/**
 * SPICE GARDEN POS & DIGITAL ORDERING SYSTEM
 * Cart Operations, Drawer UI & Calculations
 */

const CartModule = {
  init() {
    this.updateBadges();
    this.renderDrawer();

    appState.on('cart:updated', () => {
      this.updateBadges();
      this.renderDrawer();
    });

    appState.on('coupon:applied', () => {
      this.renderDrawer();
    });

    appState.on('table:selected', () => {
      this.renderDrawer();
    });
  },

  getItemQuantity(itemId) {
    const cart = appState.cart;
    let count = 0;
    Object.keys(cart).forEach(key => {
      if (cart[key].item && cart[key].item.id === itemId) {
        count += cart[key].qty;
      }
    });
    return count;
  },

  quickAddItem(itemId, event) {
    if (event) event.stopPropagation();
    const item = appState.menu.find(m => m.id === itemId);
    if (!item || !item.available) return;

    this.addItem(item, 1, '');
    NotificationService.success(`Added ${item.name}`);
  },

  decrementItem(itemId, event) {
    if (event) event.stopPropagation();
    const cart = { ...appState.cart };

    // Find first key matching this item id
    const matchingKey = Object.keys(cart).find(k => cart[k].item && cart[k].item.id === itemId);
    if (matchingKey) {
      if (cart[matchingKey].qty > 1) {
        cart[matchingKey].qty -= 1;
      } else {
        delete cart[matchingKey];
      }
      appState.saveCart(cart);
    }
  },

  addItem(item, qty = 1, note = '') {
    const cart = { ...appState.cart };
    // Unique key combines item id and custom note so different instructions are tracked separately
    const key = `${item.id}_${note.trim().toLowerCase().replace(/\s+/g, '_')}`;

    if (cart[key]) {
      cart[key].qty += qty;
      cart[key].note = note || cart[key].note;
    } else {
      cart[key] = {
        item: item,
        qty: qty,
        note: note
      };
    }

    appState.saveCart(cart);
  },

  updateItemQtyByKey(key, delta) {
    const cart = { ...appState.cart };
    if (!cart[key]) return;

    cart[key].qty += delta;
    if (cart[key].qty <= 0) {
      delete cart[key];
    }
    appState.saveCart(cart);
  },

  removeItemByKey(key) {
    const cart = { ...appState.cart };
    delete cart[key];
    appState.saveCart(cart);
    NotificationService.info('Item removed from cart');
  },

  clearCart() {
    appState.saveCart({});
    appState.setActiveCoupon(null);
  },

  getCartItemsList() {
    const cart = appState.cart;
    return Object.keys(cart).map(k => {
      const entry = cart[k];
      return {
        key: k,
        id: entry.item.id,
        name: entry.item.name,
        price: entry.item.price,
        emoji: entry.item.emoji,
        image: entry.item.image,
        qty: entry.qty,
        note: entry.note
      };
    });
  },

  updateBadges() {
    const items = this.getCartItemsList();
    const totalCount = items.reduce((sum, i) => sum + i.qty, 0);

    const bill = BillingEngine.calculate({
      items: items,
      couponCode: appState.activeCoupon ? appState.activeCoupon.code : null
    });

    // Update Header Badge
    const countEl = document.getElementById('cartBadgeCount');
    if (countEl) {
      countEl.textContent = totalCount;
      countEl.classList.remove('bump');
      void countEl.offsetWidth; // Trigger reflow
      countEl.classList.add('bump');
    }

    // Update Sticky Bottom Bar
    const barEl = document.getElementById('mobileCartBar');
    const barCountEl = document.getElementById('mobileCartCount');
    const barTotalEl = document.getElementById('mobileCartTotal');

    if (barEl && barCountEl && barTotalEl) {
      if (totalCount > 0 && appState.activeRole === 'customer') {
        barEl.classList.add('visible');
        barCountEl.textContent = `${totalCount} ${totalCount === 1 ? 'item' : 'items'}`;
        barTotalEl.textContent = `₹${bill.grandTotal.toFixed(2)}`;
      } else {
        barEl.classList.remove('visible');
      }
    }
  },

  openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    this.renderDrawer();
    if (drawer && backdrop) {
      backdrop.classList.add('open');
      drawer.classList.add('open');
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
    }
  },

  applyCoupon() {
    const input = document.getElementById('cartCouponInput');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      NotificationService.warning('Please enter a coupon code');
      return;
    }

    const items = this.getCartItemsList();
    const bill = BillingEngine.calculate({
      items: items,
      couponCode: code
    });

    if (bill.couponError) {
      NotificationService.error(bill.couponError);
      return;
    }

    if (bill.appliedCoupon) {
      appState.setActiveCoupon(bill.appliedCoupon);
      NotificationService.success(`🎉 Coupon ${code} applied! Saved ₹${bill.discount}`);
    }
  },

  removeCoupon() {
    appState.setActiveCoupon(null);
    NotificationService.info('Coupon removed');
  },

  renderDrawer() {
    const container = document.getElementById('cartItemsListContainer');
    const summaryContainer = document.getElementById('cartBillSummaryContainer');
    const checkoutBtn = document.getElementById('btnProceedCheckout');
    const tableNoEl = document.getElementById('cartActiveTableNo');

    if (tableNoEl) {
      tableNoEl.textContent = appState.activeTable || '04';
    }

    const items = this.getCartItemsList();

    if (!container || !summaryContainer || !checkoutBtn) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 30px 10px;">
          <div class="empty-icon">🛒</div>
          <div class="empty-title">Your cart is empty</div>
          <div class="empty-subtitle">Explore our menu and add something delicious to your table order.</div>
          <button class="nav-btn primary" style="margin-top: 10px;" onclick="CartModule.closeDrawer()">
            Browse Menu
          </button>
        </div>
      `;
      summaryContainer.innerHTML = '';
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = `<span>Cart is Empty</span> <span>₹0.00</span>`;
      return;
    }

    checkoutBtn.disabled = false;

    // Render items list
    container.innerHTML = items.map(entry => `
      <div class="cart-item-row">
        ${entry.image ? `
          <img class="cart-item-img" src="${entry.image}" alt="${entry.name}" onerror="this.style.display='none'"/>
        ` : `
          <div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;">${entry.emoji || '🍲'}</div>
        `}

        <div class="cart-item-info">
          <div class="cart-item-title">${entry.name}</div>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">
            ₹${entry.price} &times; ${entry.qty} = <span style="color:var(--primary);">₹${entry.price * entry.qty}</span>
          </div>
          ${entry.note ? `
            <div class="cart-item-note">📝 "${entry.note}"</div>
          ` : ''}
        </div>

        <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 6px;">
          <div class="qty-counter-control" style="background: var(--bg-subtle); border: 1px solid var(--border-medium);">
            <button class="qty-btn-sub" style="color: var(--text-main);" onclick="CartModule.updateItemQtyByKey('${entry.key}', -1)">−</button>
            <span class="qty-display-val" style="color: var(--text-main); font-size: 0.82rem;">${entry.qty}</span>
            <button class="qty-btn-add" style="color: var(--text-main);" onclick="CartModule.updateItemQtyByKey('${entry.key}', 1)">+</button>
          </div>
          <button style="font-size: 0.75rem; color: var(--danger); font-weight: 600;" onclick="CartModule.removeItemByKey('${entry.key}')">Remove</button>
        </div>
      </div>
    `).join('');

    // Calculate billing
    const bill = BillingEngine.calculate({
      items: items,
      couponCode: appState.activeCoupon ? appState.activeCoupon.code : null
    });

    // Render Coupon Section & Breakdown
    const activeCoupon = appState.activeCoupon;
    summaryContainer.innerHTML = `
      <!-- Coupon Section -->
      <div style="margin-bottom: 12px;">
        <label class="form-label" style="font-size: 0.8rem;">Apply Discount Coupon:</label>
        ${activeCoupon ? `
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--veg-bg); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px dashed var(--veg);">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--veg);">
              🎟️ ${activeCoupon.code} applied (Saved ₹${bill.discount})
            </div>
            <button style="color: var(--danger); font-size: 0.8rem; font-weight: 700;" onclick="CartModule.removeCoupon()">Remove</button>
          </div>
        ` : `
          <div class="coupon-section">
            <input type="text" id="cartCouponInput" class="coupon-input" placeholder="e.g. WELCOME50, SPICE20"/>
            <button class="btn-apply-coupon" onclick="CartModule.applyCoupon()">Apply</button>
          </div>
        `}
      </div>

      <!-- Bill Breakdown -->
      <div class="bill-breakdown-card">
        ${BillingEngine.renderBreakdownHTML(bill)}
      </div>
    `;

    checkoutBtn.innerHTML = `
      <span>Place Table Order (${bill.itemCount} items)</span>
      <span>₹${bill.grandTotal.toFixed(2)} &rarr;</span>
    `;
  }
};
