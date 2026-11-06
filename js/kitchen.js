/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * Kitchen Display System (KDS) — 3-Column Kanban Board with Urgency States
 */

const KitchenModule = {
  init() {
    this.renderKdsKanban();

    // Auto-update timers every 15 seconds
    setInterval(() => {
      if (appState.activeRole === 'kitchen') {
        this.renderKdsKanban();
      }
    }, 15000);

    appState.on('orders:updated', () => this.renderKdsKanban());
  },

  renderKdsKanban() {
    const newCol = document.getElementById('kdsColNew');
    const prepCol = document.getElementById('kdsColPrep');
    const readyCol = document.getElementById('kdsColReady');

    if (!newCol || !prepCol || !readyCol) return;

    const res = appState.getCurrentRestaurant();
    const orders = appState.orders.filter(o => (o.restaurant_id ? o.restaurant_id === res.id : (!o.restaurantId || o.restaurantId === res.id)));

    const newOrders = orders.filter(o => o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.CONFIRMED || o.status === 'PENDING' || o.status === 'CONFIRMED');
    const prepOrders = orders.filter(o => o.status === ORDER_STATUS.PREPARING || o.status === 'PREPARING');
    const readyOrders = orders.filter(o => o.status === ORDER_STATUS.READY || o.status === 'READY');

    // Update column counters
    const setCount = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };
    setCount('kdsCountNew', newOrders.length);
    setCount('kdsCountPrep', prepOrders.length);
    setCount('kdsCountReady', readyOrders.length);

    newCol.innerHTML = newOrders.length > 0 
      ? newOrders.map(o => this.renderOrderCard(o)).join('') 
      : `<div class="kds-empty-col">No incoming new orders</div>`;

    prepCol.innerHTML = prepOrders.length > 0 
      ? prepOrders.map(o => this.renderOrderCard(o)).join('') 
      : `<div class="kds-empty-col">No dishes currently cooking</div>`;

    readyCol.innerHTML = readyOrders.length > 0 
      ? readyOrders.map(o => this.renderOrderCard(o)).join('') 
      : `<div class="kds-empty-col">No orders waiting for pickup</div>`;
  },

  renderOrderCard(order) {
    const elapsedMins = Math.floor((Date.now() - new Date(order.created_at || order.createdAt || Date.now()).getTime()) / 60000);
    let urgencyClass = 'urgency-normal';
    if (elapsedMins >= 10 && elapsedMins < 20) urgencyClass = 'urgency-waiting';
    if (elapsedMins >= 20) urgencyClass = 'urgency-delayed';

    return `
      <div class="kds-kanban-card ${order.status.toLowerCase()} ${urgencyClass}">
        <!-- Card Header -->
        <div class="kds-card-header">
          <div>
            <div class="kds-table-badge">Table #${order.table_number || order.tableNo}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">#${order.id}</div>
          </div>
          <div class="kds-timer-badge ${urgencyClass}">
            ⏱️ ${elapsedMins}m
          </div>
        </div>

        <!-- Items & Cooking Instructions -->
        <div class="kds-items-list">
          ${(order.items || []).map(item => {
            const qty = item.quantity !== undefined ? item.quantity : (item.qty || 1);
            const note = item.special_instructions || item.note || '';
            return `
              <div class="kds-item-row">
                <span class="kds-item-qty">${qty}</span>
                <div class="kds-item-details">
                  <div style="font-weight: 700; color: var(--text-main); font-size: 0.92rem;">${item.name}</div>
                  ${note ? `
                    <div class="kds-special-note">⚠️ Note: "${note}"</div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Action Buttons -->
        <div class="kds-card-actions">
          ${this.renderActions(order)}
        </div>
      </div>
    `;
  },

  renderActions(order) {
    if (order.status === ORDER_STATUS.PENDING) {
      return `
        <button class="nav-btn primary" style="flex: 1; padding: 6px 10px; font-size: 0.8rem;" onclick="KitchenModule.acceptOrder('${order.id}')">
          👨‍🍳 ACCEPT ORDER
        </button>
        <button class="nav-btn" style="color: var(--danger); padding: 6px 8px; font-size: 0.8rem;" onclick="KitchenModule.rejectOrderPrompt('${order.id}')" title="Reject / Cancel">
          ✕
        </button>
      `;
    }
    if (order.status === ORDER_STATUS.CONFIRMED) {
      return `
        <button class="nav-btn primary" style="flex: 1; background: var(--info); border-color: var(--info); padding: 6px 10px; font-size: 0.8rem;" onclick="KitchenModule.startPreparing('${order.id}')">
          🔥 START PREPARING
        </button>
      `;
    }
    if (order.status === ORDER_STATUS.PREPARING) {
      return `
        <button class="nav-btn primary" style="flex: 1; background: var(--veg); border-color: var(--veg); padding: 6px 10px; font-size: 0.8rem;" onclick="KitchenModule.markReady('${order.id}')">
          🔔 MARK READY
        </button>
      `;
    }
    if (order.status === ORDER_STATUS.READY) {
      return `
        <button class="nav-btn primary" style="flex: 1; padding: 6px 10px; font-size: 0.8rem;" onclick="KitchenModule.handOffToWaiter('${order.id}')">
          🍽️ HAND OFF TO WAITER
        </button>
      `;
    }
    return ``;
  },

  acceptOrder(orderId) {
    appState.updateOrderStatus(orderId, ORDER_STATUS.CONFIRMED);
    NotificationService.success(`Order #${orderId} accepted`);
  },

  startPreparing(orderId) {
    appState.updateOrderStatus(orderId, ORDER_STATUS.PREPARING);
    NotificationService.info(`Started cooking Order #${orderId}`);
  },

  markReady(orderId) {
    appState.updateOrderStatus(orderId, ORDER_STATUS.READY);
    NotificationService.playKitchenOrderBell();
    NotificationService.success(`🔔 Order #${orderId} is READY! Waiter notified.`);
  },

  handOffToWaiter(orderId) {
    appState.updateOrderStatus(orderId, ORDER_STATUS.SERVED);
    NotificationService.info(`Order #${orderId} marked as served`);
  },

  rejectOrderPrompt(orderId) {
    const reason = prompt('Reason for cancelling order (e.g. Item out of stock / Kitchen closing):');
    if (reason === null) return;

    appState.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED);
    NotificationService.warning(`Order #${orderId} cancelled: ${reason || 'Chef rejected'}`);
  }
};
