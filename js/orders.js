/**
 * SPICE GARDEN POS & DIGITAL ORDERING SYSTEM
 * Order Flow, Tracking, Status Progression & Session History
 */

const OrdersModule = {
  init() {
    this.renderActiveOrderTracking();
    this.renderCustomerOrderHistory();

    appState.on('orders:updated', () => {
      this.renderActiveOrderTracking();
      this.renderCustomerOrderHistory();
    });

    appState.on('order:active_changed', () => {
      this.renderActiveOrderTracking();
    });
  },

  generateOrderId() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${yyyy}${mm}${dd}-${randomSeq}`;
  },

  openCheckoutModal() {
    const items = CartModule.getCartItemsList();
    if (items.length === 0) {
      NotificationService.warning('Your cart is empty');
      return;
    }

    const modal = document.getElementById('checkoutModal');
    const body = document.getElementById('checkoutModalBody');
    if (!modal || !body) return;

    const bill = BillingEngine.calculate({
      items: items,
      couponCode: appState.activeCoupon ? appState.activeCoupon.code : null
    });

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Table & Guest Details -->
        <div style="background: var(--bg-subtle); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-weight: 700; font-size: 0.95rem;">Dining Table:</span>
            <span style="font-weight: 800; font-size: 1.1rem; color: var(--primary);">
              Table #${appState.activeTable || '04'}
            </span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-muted);">
            Seated at Table ${appState.activeTable || '04'}. Need to switch tables? Change it from the top bar before confirming.
          </p>
        </div>

        <!-- Optional Customer Info for Digital Receipt -->
        <div class="form-grid-2">
          <div>
            <label class="form-label" style="font-size: 0.8rem;">Customer Name (Optional)</label>
            <input type="text" id="checkoutCustName" class="form-input" placeholder="e.g. Rahul Sharma"/>
          </div>
          <div>
            <label class="form-label" style="font-size: 0.8rem;">Mobile No. (For Bill / SMS)</label>
            <input type="tel" id="checkoutCustPhone" class="form-input" placeholder="e.g. 9876543210"/>
          </div>
        </div>

        <!-- Order Summary Preview -->
        <div>
          <div style="font-weight: 700; font-size: 0.88rem; margin-bottom: 6px;">Order Summary (${bill.itemCount} Items)</div>
          <div style="max-height: 140px; overflow-y: auto; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 8px 12px; font-size: 0.84rem;">
            ${items.map(i => `
              <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid var(--border-light);">
                <span>${i.name} &times; ${i.qty} ${i.note ? `<small style="color:#b45309">(${i.note})</small>` : ''}</span>
                <span style="font-weight: 600;">₹${i.price * i.qty}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Bill Total Preview -->
        <div class="bill-breakdown-card">
          ${BillingEngine.renderBreakdownHTML(bill)}
        </div>
      </div>
    `;

    CartModule.closeDrawer();
    modal.classList.add('open');
  },

  closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.remove('open');
  },

  async confirmAndPlaceOrder() {
    const items = CartModule.getCartItemsList();
    if (items.length === 0) return;

    const nameInput = document.getElementById('checkoutCustName');
    const phoneInput = document.getElementById('checkoutCustPhone');

    const customerName = nameInput ? nameInput.value.trim() : '';
    const customerPhone = phoneInput ? phoneInput.value.trim() : '';

    const orderPayload = {
      table_number: appState.activeTable || '12',
      customer_name: customerName || 'Table Guest',
      customer_phone: customerPhone,
      coupon_code: appState.activeCoupon ? appState.activeCoupon.code : '',
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        qty: i.qty,
        special_instructions: i.note || ''
      })),
      payment_method: 'UPI'
    };

    try {
      // Create order via PostgreSQL / Supabase API
      const createdOrder = await RestaurantAPI.createOrder(orderPayload, appState.activeRestaurantId);

      // Clear transient cart
      CartModule.clearCart();
      this.closeCheckoutModal();

      // Set active order ID for tracking
      appState.setActiveOrderId(createdOrder.id);
      await appState.syncFromDatabase();

      // Trigger Notification & Audio Bell
      NotificationService.playKitchenOrderBell();
      NotificationService.success(`🎉 Order #${createdOrder.id} sent to kitchen!`);

      // Switch view to Order Tracking
      AppRouter.navigate('#order-tracking');
    } catch (err) {
      console.error('[Order Placement Error]', err);
      NotificationService.error(err.message || 'Failed to place order. Please try again.');
    }
  },

  async updateOrderStatus(orderId, newStatus, cancellationReason = null) {
    try {
      const updated = await RestaurantAPI.updateOrderStatus(orderId, newStatus, cancellationReason, appState.activeRestaurantId);
      await appState.syncFromDatabase();
      NotificationService.info(`Order #${orderId} status updated to ${newStatus.toUpperCase()}`);
      return updated;
    } catch (err) {
      console.error('[Update Order Status Error]', err);
      NotificationService.error(err.message || 'Failed to update order status');
    }
  },

  renderActiveOrderTracking() {
    const container = document.getElementById('activeOrderTrackingContainer');
    if (!container) return;

    const orderId = appState.activeOrderId;
    const order = appState.orders.find(o => o.id === orderId);

    if (!order) {
      container.innerHTML = `
        <div class="order-tracking-card">
          <div class="empty-state">
            <div class="empty-icon">🧾</div>
            <div class="empty-title">No Active Order Placed</div>
            <div class="empty-subtitle">When you place an order for your table, real-time live cooking updates will appear here.</div>
            <button class="nav-btn primary" style="margin-top: 10px;" onclick="App.switchView('customerMenuView')">
              Browse Menu & Order
            </button>
          </div>
        </div>
      `;
      return;
    }

    const steps = [
      { key: 'pending', label: 'Received', icon: '📥' },
      { key: 'confirmed', label: 'Accepted', icon: '👨‍🍳' },
      { key: 'preparing', label: 'Cooking', icon: '🔥' },
      { key: 'ready', label: 'Ready', icon: '🔔' },
      { key: 'served', label: 'Served', icon: '🍽️' },
      { key: 'completed', label: 'Paid', icon: '✅' }
    ];

    const statusHierarchy = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];
    const currentStatus = (order.status || '').toLowerCase();
    const currentIdx = statusHierarchy.indexOf(currentStatus);

    let statusBadgeClass = 'warning';
    if (currentStatus === 'preparing') statusBadgeClass = 'info';
    if (currentStatus === 'ready' || currentStatus === 'served') statusBadgeClass = 'veg';
    if (currentStatus === 'cancelled') statusBadgeClass = 'danger';

    container.innerHTML = `
      <div class="order-tracking-card">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-light); padding-bottom: 14px;">
          <div>
            <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Live Table Order</div>
            <div style="font-size: 1.3rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-main);">
              #${order.id}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="meta-chip active-table" style="font-size: 0.9rem;">
              🪑 Table ${order.tableNo}
            </span>
            <span class="table-status-pill ${statusBadgeClass}">
              ${order.status.toUpperCase()}
            </span>
          </div>
        </div>

        <!-- Step Progress Bar -->
        ${order.status !== 'cancelled' ? `
          <div class="order-tracker-timeline">
            ${steps.map((step, idx) => {
              let nodeClass = '';
              if (idx < currentIdx) nodeClass = 'completed';
              else if (idx === currentIdx) nodeClass = 'active';

              return `
                <div class="step-node ${nodeClass}">
                  <div class="step-icon-circle">
                    ${idx < currentIdx ? '✓' : step.icon}
                  </div>
                  <span class="step-label">${step.label}</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div style="background: var(--danger-light); color: var(--danger); padding: 12px; border-radius: var(--radius-md); text-align: center; margin: 20px 0; font-weight: 700;">
            ⚠️ This order was cancelled.
          </div>
        `}

        <!-- Real-time Status Message -->
        <div style="background: var(--bg-subtle); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 16px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main); margin-bottom: 4px;">
            ${this.getStatusMessage(order.status)}
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted);">
            Ordered on ${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} &bull; Est. preparation time: ~15-20 mins
          </p>
        </div>

        <!-- Ordered Dishes List -->
        <div style="margin-bottom: 18px;">
          <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Dishes in this Order:</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${(order.items || []).map(item => {
              const qty = item.quantity || item.qty || 1;
              const price = Number(item.unit_price !== undefined ? item.unit_price : (item.price || 0));
              const note = item.special_instructions || item.note || '';
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-sm); font-size: 0.88rem;">
                  <div>
                    <span style="font-weight: 600;">${item.name}</span>
                    <span style="color: var(--text-muted);">&times; ${qty}</span>
                    ${note ? `<div style="font-size: 0.75rem; color: #b45309;">Note: "${note}"</div>` : ''}
                  </div>
                  <span style="font-weight: 700; color: var(--text-main);">₹${(price * qty).toFixed(2)}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Grand Total & Action Buttons -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-top: 1px solid var(--border-light); padding-top: 16px;">
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Total Bill (incl. GST)</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">₹${Number(order.total !== undefined ? order.total : (order.grandTotal || 0)).toFixed(2)}</div>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="nav-btn" onclick="OrdersModule.viewInvoice('${order.id}')">
              📄 View Tax Bill
            </button>
            <button class="nav-btn primary" onclick="App.switchView('customerMenuView')">
              + Order More Items
            </button>
          </div>
        </div>
      </div>
    `;
  },

  getStatusMessage(status) {
    switch (status) {
      case 'pending': return '⏳ Order received! Waiting for kitchen to accept...';
      case 'confirmed': return '👨‍🍳 Chef has accepted your order!';
      case 'preparing': return '🔥 Your delicious dishes are cooking in the kitchen!';
      case 'ready': return '🔔 Food is ready! Waiter is bringing it to your table.';
      case 'served': return '🍽️ Food served. Enjoy your meal!';
      case 'completed': return '✅ Order completed and bill settled. Thank you!';
      case 'cancelled': return '❌ This order has been cancelled.';
      default: return 'Processing your dining order...';
    }
  },

  renderCustomerOrderHistory() {
    const container = document.getElementById('customerOrderHistoryList');
    if (!container) return;

    const currentTable = appState.activeTable;
    // Show orders placed in current session for this table or all recent
    const orders = appState.orders.filter(o => o.tableNo === currentTable || true).slice(0, 10);

    if (orders.length === 0) {
      container.innerHTML = `<div class="text-muted" style="font-size: 0.85rem; padding: 12px;">No past orders in this session.</div>`;
      return;
    }

    container.innerHTML = orders.map(ord => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast);" onclick="OrdersModule.selectActiveOrder('${ord.id}')">
        <div>
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">#${ord.id} (Table ${ord.tableNo})</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            ${new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; ${ord.items.length} items
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; color: var(--primary);">₹${ord.grandTotal}</div>
          <span class="table-status-pill ${ord.status === 'ready' || ord.status === 'served' ? 'available' : (ord.status === 'preparing' ? 'occupied' : 'reserved')}" style="font-size: 0.68rem;">
            ${ord.status.toUpperCase()}
          </span>
        </div>
      </div>
    `).join('');
  },

  selectActiveOrder(orderId) {
    appState.setActiveOrderId(orderId);
    App.switchView('orderTrackingView');
  },

  viewInvoice(orderId) {
    const order = appState.orders.find(o => o.id === orderId);
    if (!order) return;

    const printView = document.getElementById('printInvoiceView');
    if (!printView) return;

    printView.innerHTML = `
      <div class="no-print" style="max-width: 480px; margin: 20px auto 10px; display: flex; justify-content: space-between; align-items: center;">
        <button class="nav-btn" onclick="App.switchView('orderTrackingView')">&larr; Back to Order</button>
        <button class="nav-btn primary allow-print" onclick="window.print()">🖨️ Print / Download Bill</button>
      </div>
      ${BillingEngine.renderInvoice(order)}
    `;

    App.switchView('printInvoiceView');
  }
};
