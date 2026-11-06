/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * Waiter / Service Staff Floor Dashboard & Table Operations
 */

const WaiterModule = {
  currentSection: 'all',

  init() {
    this.renderWaiterDashboard();

    appState.on('tables:updated', () => this.renderWaiterDashboard());
    appState.on('orders:updated', () => this.renderWaiterDashboard());
  },

  setSectionFilter(section, btnEl) {
    this.currentSection = section;
    document.querySelectorAll('.waiter-sec-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.renderWaiterDashboard();
  },

  renderWaiterDashboard() {
    const container = document.getElementById('waiterTableGridContainer');
    const alertBanner = document.getElementById('waiterFoodReadyBanner');
    if (!container) return;

    const res = appState.getCurrentRestaurant();
    let tables = appState.tables.filter(t => (t.restaurant_id ? t.restaurant_id === res.id : (!t.restaurantId || t.restaurantId === res.id)));

    if (this.currentSection !== 'all') {
      tables = tables.filter(t => t.section === this.currentSection);
    }

    // Check for any FOOD_READY tables to display top alert
    const readyTables = tables.filter(t => (t.status === TABLE_STATUS.FOOD_READY || t.status === 'FOOD_READY'));
    if (alertBanner) {
      if (readyTables.length > 0) {
        alertBanner.style.display = 'flex';
        alertBanner.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5rem; animation: pulseNode 1s infinite;">🔔</span>
            <div>
              <strong style="font-size: 0.95rem; color: #b45309;">FOOD READY FOR PICKUP!</strong>
              <div style="font-size: 0.8rem; color: #78350f;">
                ${readyTables.map(t => `Table #${t.table_number || t.number} (#${t.active_order_id || t.activeOrderId || 'Order'})`).join(', ')} — Ready to serve guests!
              </div>
            </div>
          </div>
          <button class="nav-btn primary" style="background: #b45309; border-color: #b45309; font-size: 0.75rem;" onclick="WaiterModule.openTableModal(${readyTables[0].id})">
            Serve Table #${readyTables[0].table_number || readyTables[0].number} &rarr;
          </button>
        `;
      } else {
        alertBanner.style.display = 'none';
      }
    }

    // Render Table Cards
    container.innerHTML = tables.map(table => {
      const activeOrderId = table.active_order_id || table.activeOrderId;
      const activeOrder = activeOrderId ? appState.orders.find(o => o.id === activeOrderId) : null;
      let statusColorDot = '🟢';
      let statusLabel = 'AVAILABLE';
      let cardClass = 'available';

      const st = (table.status || '').toUpperCase();
      if (st === 'OCCUPIED' || st === TABLE_STATUS.OCCUPIED) {
        statusColorDot = '🔴';
        statusLabel = 'OCCUPIED';
        cardClass = 'occupied';
      } else if (st === 'FOOD_READY' || st === TABLE_STATUS.FOOD_READY) {
        statusColorDot = '🟡';
        statusLabel = 'FOOD READY';
        cardClass = 'food-ready pulse-ready';
      } else if (st === 'BILL_REQUESTED' || st === TABLE_STATUS.BILL_REQUESTED) {
        statusColorDot = '🔵';
        statusLabel = 'BILL REQUESTED';
        cardClass = 'bill-requested';
      } else if (st === 'CLEANING' || st === TABLE_STATUS.CLEANING) {
        statusColorDot = '🟣';
        statusLabel = 'CLEANING';
        cardClass = 'cleaning';
      }

      const tableNum = table.table_number || table.number;

      return `
        <div class="waiter-table-card ${cardClass}" onclick="WaiterModule.openTableModal(${table.id})">
          <div class="waiter-card-header">
            <span style="font-weight: 800; font-size: 1.15rem;">TABLE ${tableNum}</span>
            <span class="table-status-pill ${cardClass}">${statusColorDot} ${statusLabel}</span>
          </div>

          <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 4px;">
            <span>📍 ${table.section}</span>
            <span>👥 ${table.capacity} Guests</span>
          </div>

          ${activeOrder ? `
            <div style="margin-top: 8px; padding: 6px 10px; background: rgba(0,0,0,0.03); border-radius: var(--radius-xs); font-size: 0.78rem;">
              <div style="font-weight: 700; color: var(--text-main);">#${activeOrder.id}</div>
              <div style="color: var(--primary); font-weight: 800;">₹${Number(activeOrder.total !== undefined ? activeOrder.total : (activeOrder.grandTotal || 0)).toFixed(2)} &bull; ${(activeOrder.items || []).length} items</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-top: 2px;">
                Status: ${activeOrder.status}
              </div>
            </div>
          ` : `
            <div style="margin-top: 10px; font-size: 0.75rem; color: var(--text-subtle);">
              ${st === 'AVAILABLE' || st === TABLE_STATUS.AVAILABLE ? 'Ready for new guests' : 'No active order'}
            </div>
          `}
        </div>
      `;
    }).join('');
  },

  openTableModal(tableId) {
    const table = appState.tables.find(t => t.id === tableId);
    if (!table) return;

    const modal = document.getElementById('waiterOrderModal');
    const body = document.getElementById('waiterOrderModalBody');
    if (!modal || !body) return;

    const activeOrderId = table.active_order_id || table.activeOrderId;
    const activeOrder = activeOrderId ? appState.orders.find(o => o.id === activeOrderId) : null;
    const tableNum = table.table_number || table.number;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-light); padding-bottom: 12px;">
          <div>
            <h2 style="font-family: var(--font-serif); font-size: 1.4rem; font-weight: 800;">Table #${tableNum}</h2>
            <p style="font-size: 0.82rem; color: var(--text-muted);">${table.section} &bull; Capacity: ${table.capacity} Guests</p>
          </div>
          <span class="table-status-pill ${table.status.toLowerCase()}">${table.status}</span>
        </div>

        ${activeOrder ? `
          <!-- Active Order Summary -->
          <div style="background: var(--bg-subtle); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 800; font-size: 1rem; color: var(--text-main);">Order #${activeOrder.id}</span>
              <span style="font-weight: 700; color: var(--primary); font-size: 1.1rem;">₹${Number(activeOrder.total !== undefined ? activeOrder.total : (activeOrder.grandTotal || 0)).toFixed(2)}</span>
            </div>

            <!-- Items -->
            <div style="display: flex; flex-direction: column; gap: 6px; margin: 10px 0;">
              ${(activeOrder.items || []).map(i => {
                const qty = i.quantity !== undefined ? i.quantity : (i.qty || 1);
                const price = Number(i.unit_price !== undefined ? i.unit_price : (i.price || 0));
                const note = i.special_instructions || i.note || '';
                return `
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid var(--border-light);">
                    <span><strong>${qty}&times;</strong> ${i.name} ${note ? `<br/><small style="color:#b45309; font-style:italic;">"${note}"</small>` : ''}</span>
                    <span style="font-weight: 600;">₹${(price * qty).toFixed(2)}</span>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">
              <span>Guest: ${activeOrder.customer_name || activeOrder.customerName || 'Dine-In'}</span>
              <span>Status: <strong style="color:var(--text-main); text-transform:uppercase;">${activeOrder.status}</strong></span>
            </div>
          </div>

          <!-- Waiter Actions -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${activeOrder.status === ORDER_STATUS.READY ? `
              <button class="nav-btn primary full" style="grid-column: 1 / -1; padding: 12px; font-size: 0.95rem;" onclick="WaiterModule.markServed('${activeOrder.id}', ${table.id})">
                🍽️ MARK AS SERVED
              </button>
            ` : ''}

            <button class="nav-btn" onclick="OrdersModule.viewInvoice('${activeOrder.id}'); WaiterModule.closeModal();">
              📄 View Tax Bill
            </button>

            <button class="nav-btn primary" style="background: var(--info); border-color: var(--info);" onclick="WaiterModule.requestBill(${table.id})">
              💳 Settle Payment
            </button>

            <button class="nav-btn full" style="grid-column: 1 / -1; color: var(--danger); border-color: var(--border-light);" onclick="WaiterModule.clearTable(${table.id})">
              🧹 Clear & Mark Table Available
            </button>
          </div>
        ` : `
          <!-- No Active Order -->
          <div class="empty-state" style="padding: 20px;">
            <div class="empty-icon">🪑</div>
            <div class="empty-title">Table is currently ${table.status.toLowerCase()}</div>
            <p class="empty-subtitle">Guests have not placed an order yet, or the previous bill has been cleared.</p>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="nav-btn primary" style="flex:1;" onclick="WaiterModule.takeDirectOrder('${table.number}')">
              + Take Table Order
            </button>
            <button class="nav-btn" onclick="WaiterModule.changeTableStatus(${table.id}, '${TABLE_STATUS.AVAILABLE}')">
              Mark Available
            </button>
          </div>
        `}
      </div>
    `;

    modal.classList.add('open');
  },

  markServed(orderId, tableId) {
    appState.updateOrderStatus(orderId, ORDER_STATUS.SERVED);
    this.closeModal();
    NotificationService.success(`Order #${orderId} marked as served!`);
  },

  requestBill(tableId) {
    appState.updateTableStatus(tableId, TABLE_STATUS.BILL_REQUESTED);
    const table = appState.tables.find(t => t.id === tableId);
    if (table && table.activeOrderId) {
      OrdersModule.viewInvoice(table.activeOrderId);
    }
    this.closeModal();
  },

  clearTable(tableId) {
    const table = appState.tables.find(t => t.id === tableId);
    if (table && table.activeOrderId) {
      appState.updateOrderStatus(table.activeOrderId, ORDER_STATUS.COMPLETED);
    }
    appState.updateTableStatus(tableId, TABLE_STATUS.AVAILABLE, null);
    this.closeModal();
    NotificationService.success(`Table #${table ? table.number : ''} cleared and marked available`);
  },

  takeDirectOrder(tableNumber) {
    this.closeModal();
    appState.setActiveTable(tableNumber);
    appState.setActiveRole('waiter');
    App.switchView('customerMenuView');
    NotificationService.info(`Taking direct order for Table #${tableNumber}`);
  },

  changeTableStatus(tableId, status) {
    appState.updateTableStatus(tableId, status);
    this.closeModal();
    NotificationService.info(`Table status updated to ${status}`);
  },

  closeModal() {
    const modal = document.getElementById('waiterOrderModal');
    if (modal) modal.classList.remove('open');
  }
};
