/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * SaaS Admin Management: Sidebar, Menu, Tables & QR Generator, Orders, Coupons, Staff, Settings
 */

const AdminModule = {
  currentSidebarTab: 'dashboard', // dashboard, orders, menu, categories, tables, coupons, staff, billing, reports, settings
  editingItemId: null,

  init() {
    this.renderSidebar();
    this.renderAdminOrdersTable();
    this.renderAdminMenuTable();
    this.renderAdminTablesList();
    this.renderCategoryManager();
    this.renderCouponManager();
    this.loadSettingsForm();

    appState.on('menu:updated', () => this.renderAdminMenuTable());
    appState.on('tables:updated', () => this.renderAdminTablesList());
    appState.on('orders:updated', () => this.renderAdminOrdersTable());
    appState.on('categories:updated', () => {
      this.renderAdminMenuTable();
      this.renderCategoryManager();
    });
    appState.on('coupons:updated', () => this.renderCouponManager());
    appState.on('restaurant:updated', () => this.loadSettingsForm());
  },

  renderSidebar() {
    const sidebarEl = document.getElementById('adminSidebarNav');
    if (!sidebarEl) return;

    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'orders', label: 'Live Orders', icon: '🧾' },
      { id: 'menu', label: 'Menu Catalog', icon: '🍽️' },
      { id: 'categories', label: 'Categories', icon: '📂' },
      { id: 'tables', label: 'Tables & QR Codes', icon: '🪑' },
      { id: 'coupons', label: 'Coupons & Promos', icon: '🎟️' },
      { id: 'staff', label: 'Staff Management', icon: '👥' },
      { id: 'reports', label: 'Sales Reports', icon: '📈' },
      { id: 'settings', label: 'Restaurant Settings', icon: '⚙️' }
    ];

    sidebarEl.innerHTML = navItems.map(item => `
      <button class="admin-sidebar-link ${this.currentSidebarTab === item.id ? 'active' : ''}" onclick="AdminModule.switchSidebarTab('${item.id}', this)">
        <span class="sidebar-icon">${item.icon}</span>
        <span class="sidebar-label">${item.label}</span>
      </button>
    `).join('');
  },

  switchSidebarTab(tabId, btnEl) {
    this.currentSidebarTab = tabId;
    document.querySelectorAll('.admin-sidebar-link').forEach(l => l.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    // Hide all admin sections
    const sections = [
      'adminDashboardContent', 'adminOrdersSection', 'adminMenuSection',
      'adminCategorySection', 'adminTablesSection', 'adminCouponSection',
      'adminStaffSection', 'adminReportsContainer', 'adminSettingsSection'
    ];

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // Show selected section
    const map = {
      dashboard: 'adminDashboardContent',
      orders: 'adminOrdersSection',
      menu: 'adminMenuSection',
      categories: 'adminCategorySection',
      tables: 'adminTablesSection',
      coupons: 'adminCouponSection',
      staff: 'adminStaffSection',
      reports: 'adminReportsContainer',
      settings: 'adminSettingsSection'
    };

    const targetId = map[tabId];
    if (targetId) {
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.style.display = 'block';
    }

    if (tabId === 'dashboard') DashboardModule.renderKPIs();
    if (tabId === 'reports') ReportsModule.renderReportsView();
    if (tabId === 'staff') StaffModule.renderStaffManager();
    if (tabId === 'tables') this.renderAdminTablesList();
    if (tabId === 'orders') this.renderAdminOrdersTable();
  },

  // ==========================================
  // ALL ORDERS TABLE & FILTER
  // ==========================================
  renderAdminOrdersTable(filterStatus = 'ALL', searchQuery = '') {
    const tbody = document.getElementById('adminAllOrdersTableBody');
    if (!tbody) return;

    let orders = [...appState.orders];
    if (filterStatus !== 'ALL') {
      orders = orders.filter(o => o.status === filterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      orders = orders.filter(o => o.id.toLowerCase().includes(q) || o.tableNo.includes(q));
    }

    tbody.innerHTML = orders.map(order => `
      <tr>
        <td style="font-weight: 700; font-family: var(--font-mono);">#${order.id}</td>
        <td><strong>Table ${order.tableNo}</strong></td>
        <td>${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td>${order.items.map(i => `${i.qty}&times; ${i.name}`).join(', ')}</td>
        <td style="font-weight: 800; color: var(--primary);">₹${order.grandTotal}</td>
        <td>
          <span class="table-status-pill ${order.status.toLowerCase()}">
            ${order.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="nav-btn" style="padding: 4px 8px; font-size: 0.75rem;" onclick="OrdersModule.viewInvoice('${order.id}')">
              📄 Bill
            </button>
            <select class="form-select" style="padding: 2px 6px; font-size: 0.75rem;" onchange="OrdersModule.updateOrderStatus('${order.id}', this.value)">
              <option value="">Status...</option>
              <option value="${ORDER_STATUS.PENDING}">Pending</option>
              <option value="${ORDER_STATUS.CONFIRMED}">Confirmed</option>
              <option value="${ORDER_STATUS.PREPARING}">Preparing</option>
              <option value="${ORDER_STATUS.READY}">Ready</option>
              <option value="${ORDER_STATUS.SERVED}">Served</option>
              <option value="${ORDER_STATUS.COMPLETED}">Completed</option>
              <option value="${ORDER_STATUS.CANCELLED}">Cancelled</option>
            </select>
          </div>
        </td>
      </tr>
    `).join('');
  },

  // ==========================================
  // TABLES & QR CODE GENERATION
  // ==========================================
  renderAdminTablesList() {
    const container = document.getElementById('adminTablesContainer');
    if (!container) return;

    const res = appState.getCurrentRestaurant();
    const tables = appState.tables.filter(t => !t.restaurantId || t.restaurantId === res.id);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-weight: 700;">Tables & QR Code Generator</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Generate high-resolution printable table standee cards with QR codes.</p>
        </div>
        <button class="nav-btn primary" onclick="AdminModule.promptAddTable()">+ Add New Table</button>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Table No.</th>
              <th>Floor Section</th>
              <th>Seating</th>
              <th>Status</th>
              <th>Direct QR Link</th>
              <th>QR Standee Actions</th>
            </tr>
          </thead>
          <tbody>
            ${tables.map(t => {
              const qrUrl = QRModule.getTableQRUrl(t.number, res.id);
              return `
                <tr>
                  <td style="font-weight: 800; font-size: 1.05rem;">Table #${t.number}</td>
                  <td>${t.section}</td>
                  <td>${t.capacity} Guests</td>
                  <td>
                    <span class="table-status-pill ${t.status.toLowerCase()}">${t.status}</span>
                  </td>
                  <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">
                    <a href="${qrUrl}" target="_blank" style="color: var(--primary); text-decoration: underline;">
                      #order?res=${res.id}&table=${t.number}
                    </a>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="nav-btn primary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="QRModule.openTableQRModal(${t.id})">
                        📱 View / Print QR Card
                      </button>
                      <button class="nav-btn" style="padding: 4px 8px; font-size: 0.75rem; color: var(--danger);" onclick="AdminModule.deleteTable(${t.id})">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  promptAddTable() {
    const num = prompt('Enter table number (e.g. 26):');
    if (!num || !num.trim()) return;

    const section = prompt('Enter section ("Indoor AC", "Garden Terrace", "Family Lounge", "Banquet Hall"):', 'Indoor AC') || 'Indoor AC';
    const capacity = parseInt(prompt('Seating capacity (e.g. 4):', '4')) || 4;

    const newTable = {
      id: Date.now(),
      number: String(num.trim()).padStart(2, '0'),
      section: section.trim(),
      capacity: capacity,
      status: TABLE_STATUS.AVAILABLE,
      activeOrderId: null,
      restaurantId: appState.activeRestaurantId
    };

    const updated = [...appState.tables, newTable];
    appState.saveTables(updated);
    NotificationService.success(`Table #${newTable.number} added!`);
  },

  deleteTable(tableId) {
    if (confirm('Delete this table from floor plan?')) {
      const updated = appState.tables.filter(t => t.id !== tableId);
      appState.saveTables(updated);
      NotificationService.warning('Table removed');
    }
  },

  // ==========================================
  // MENU CRUD
  // ==========================================
  renderAdminMenuTable() {
    const tbody = document.getElementById('adminMenuTableBody');
    if (!tbody) return;

    const res = appState.getCurrentRestaurant();
    const menu = appState.menu.filter(m => (m.restaurant_id ? m.restaurant_id === res.id : (!m.restaurantId || m.restaurantId === res.id)));

    tbody.innerHTML = menu.map(item => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            ${(item.image_url || item.image) ? `
              <img src="${item.image_url || item.image}" alt="${item.name}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;" onerror="this.style.display='none'"/>
            ` : `
              <span style="font-size: 1.5rem;">${item.emoji || '🍲'}</span>
            `}
            <div>
              <div style="font-weight: 700; color: var(--text-main);">${item.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${(item.description || item.desc) ? (item.description || item.desc).substring(0, 45) + '...' : ''}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="meta-chip" style="text-transform: capitalize; font-size: 0.75rem;">
            ${item.cat || item.category_id}
          </span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span>₹</span>
            <input type="number" class="form-input" style="width: 80px; padding: 4px 8px; font-weight: 700;" value="${item.price}" onchange="AdminModule.quickUpdatePrice(${item.id}, this.value)"/>
          </div>
        </td>
        <td>
          <button class="nav-btn ${item.available ? 'primary' : ''}" style="padding: 4px 10px; font-size: 0.75rem;" onclick="AdminModule.toggleAvailability(${item.id})">
            ${item.available ? '✅ In Stock' : '❌ Sold Out'}
          </button>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="nav-btn" style="padding: 4px 8px; font-size: 0.75rem;" onclick="AdminModule.openEditItemModal(${item.id})">
              ✏️ Edit
            </button>
            <button class="nav-btn" style="padding: 4px 8px; font-size: 0.75rem;" onclick="AdminModule.duplicateItem(${item.id})">
              📋 Duplicate
            </button>
            <button class="nav-btn" style="padding: 4px 8px; font-size: 0.75rem; color: var(--danger);" onclick="AdminModule.deleteItem(${item.id})">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  quickUpdatePrice(id, newPrice) {
    const price = Number(newPrice);
    if (!price || price < 1) return;

    const menu = appState.menu.map(i => i.id === id ? { ...i, price } : i);
    appState.saveMenu(menu);
    NotificationService.success('Price updated successfully');
  },

  toggleAvailability(id) {
    const menu = appState.menu.map(i => i.id === id ? { ...i, available: !i.available } : i);
    appState.saveMenu(menu);
    const item = menu.find(i => i.id === id);
    NotificationService.info(`${item.name} availability toggled to ${item.available ? 'Available' : 'Unavailable'}`);
  },

  openAddItemModal() {
    this.editingItemId = null;
    const modal = document.getElementById('adminDishModal');
    const title = document.getElementById('adminDishModalTitle');
    const form = document.getElementById('adminDishForm');

    if (!modal || !form) return;

    if (title) title.textContent = 'Add New Menu Item';
    form.reset();

    // Populate category dropdown
    const catSelect = document.getElementById('dishFormCategory');
    if (catSelect) {
      catSelect.innerHTML = appState.categories.map(c => `
        <option value="${c.id}">${c.emoji || ''} ${c.name}</option>
      `).join('');
    }

    modal.classList.add('open');
  },

  openEditItemModal(id) {
    const item = appState.menu.find(i => i.id === id);
    if (!item) return;

    this.editingItemId = id;
    const modal = document.getElementById('adminDishModal');
    const title = document.getElementById('adminDishModalTitle');

    if (!modal) return;
    if (title) title.textContent = `Edit Item: ${item.name}`;

    const catSelect = document.getElementById('dishFormCategory');
    if (catSelect) {
      catSelect.innerHTML = appState.categories.map(c => `
        <option value="${c.id}" ${c.id === item.cat ? 'selected' : ''}>${c.emoji || ''} ${c.name}</option>
      `).join('');
    }

    document.getElementById('dishFormName').value = item.name || '';
    document.getElementById('dishFormEmoji').value = item.emoji || '🍲';
    document.getElementById('dishFormPrice').value = item.price || '';
    document.getElementById('dishFormDesc').value = item.desc || '';
    document.getElementById('dishFormSpice').value = item.spiceLevel || 0;
    document.getElementById('dishFormDietary').value = item.dietary || 'veg';
    document.getElementById('dishFormPrepTime').value = item.prepTime || '';
    document.getElementById('dishFormCalories').value = item.calories || '';
    document.getElementById('dishFormIngredients').value = Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '';
    document.getElementById('dishFormAllergens').value = Array.isArray(item.allergens) ? item.allergens.join(', ') : '';
    document.getElementById('dishFormImage').value = item.image || '';
    document.getElementById('dishFormBestseller').checked = !!item.isBestseller;
    document.getElementById('dishFormAvailable').checked = item.available !== false;

    modal.classList.add('open');
  },

  saveDishForm(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('dishFormName').value.trim();
    const price = Number(document.getElementById('dishFormPrice').value);
    const cat = document.getElementById('dishFormCategory').value;
    const emoji = document.getElementById('dishFormEmoji').value.trim() || '🍲';
    const desc = document.getElementById('dishFormDesc').value.trim();
    const spiceLevel = parseInt(document.getElementById('dishFormSpice').value) || 0;
    const dietary = document.getElementById('dishFormDietary').value;
    const prepTime = document.getElementById('dishFormPrepTime').value.trim();
    const calories = document.getElementById('dishFormCalories').value.trim();
    const ingredientsRaw = document.getElementById('dishFormIngredients').value;
    const allergensRaw = document.getElementById('dishFormAllergens').value;
    const image = document.getElementById('dishFormImage').value.trim();
    const isBestseller = document.getElementById('dishFormBestseller').checked;
    const available = document.getElementById('dishFormAvailable').checked;

    if (!name || isNaN(price) || price <= 0) {
      NotificationService.error('Please provide a valid dish name and price');
      return;
    }

    const ingredients = ingredientsRaw ? ingredientsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const allergens = allergensRaw ? allergensRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    let updatedMenu = [...appState.menu];

    if (this.editingItemId) {
      updatedMenu = updatedMenu.map(item => {
        if (item.id === this.editingItemId) {
          return {
            ...item,
            name, price, cat, emoji, desc, spiceLevel, dietary, prepTime, calories, ingredients, allergens, image, isBestseller, available
          };
        }
        return item;
      });
      NotificationService.success(`Updated "${name}"`);
    } else {
      const nextId = Math.max(0, ...updatedMenu.map(i => i.id)) + 1;
      const newItem = {
        id: nextId,
        restaurantId: appState.activeRestaurantId,
        name, price, cat, emoji, desc, spiceLevel, dietary, prepTime, calories, ingredients, allergens, image, isBestseller, available
      };
      updatedMenu.push(newItem);
      NotificationService.success(`Added "${name}" to menu!`);
    }

    appState.saveMenu(updatedMenu);
    this.closeDishModal();
  },

  duplicateItem(id) {
    const item = appState.menu.find(i => i.id === id);
    if (!item) return;

    const nextId = Math.max(0, ...appState.menu.map(i => i.id)) + 1;
    const duplicated = {
      ...item,
      id: nextId,
      name: `${item.name} (Copy)`
    };

    const updatedMenu = [...appState.menu, duplicated];
    appState.saveMenu(updatedMenu);
    NotificationService.success(`Duplicated "${item.name}"`);
  },

  deleteItem(id) {
    const item = appState.menu.find(i => i.id === id);
    if (!item) return;

    if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      const updatedMenu = appState.menu.filter(i => i.id !== id);
      appState.saveMenu(updatedMenu);
      NotificationService.warning(`Deleted "${item.name}"`);
    }
  },

  closeDishModal() {
    const modal = document.getElementById('adminDishModal');
    if (modal) modal.classList.remove('open');
    this.editingItemId = null;
  },

  // ==========================================
  // CATEGORIES CRUD
  // ==========================================
  renderCategoryManager() {
    const container = document.getElementById('adminCategoriesContainer');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-weight: 700;">Menu Categories</h3>
        <button class="nav-btn primary" onclick="AdminModule.promptAddCategory()">+ Add Category</button>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Emoji</th>
              <th>Category Name</th>
              <th>Slug ID</th>
              <th>Items Count</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${appState.categories.map(cat => {
              const count = appState.menu.filter(m => m.cat === cat.id).length;
              return `
                <tr>
                  <td style="font-size: 1.4rem;">${cat.emoji || '🍽️'}</td>
                  <td style="font-weight: 700;">${cat.name}</td>
                  <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">${cat.id}</td>
                  <td>${count} items</td>
                  <td>
                    <button class="nav-btn ${cat.active ? 'primary' : ''}" style="padding: 3px 8px; font-size: 0.75rem;" onclick="AdminModule.toggleCategoryActive('${cat.id}')">
                      ${cat.active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="nav-btn" style="padding: 3px 8px; font-size: 0.75rem;" onclick="AdminModule.promptRenameCategory('${cat.id}')">Rename</button>
                      <button class="nav-btn" style="padding: 3px 8px; font-size: 0.75rem; color: var(--danger);" onclick="AdminModule.deleteCategory('${cat.id}')">Delete</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  promptAddCategory() {
    const name = prompt('Enter new category name:');
    if (!name || !name.trim()) return;

    const emoji = prompt('Enter category emoji (e.g. 🍕, 🥗, 🍛):', '🍽️') || '🍽️';
    const id = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

    if (appState.categories.some(c => c.id === id)) {
      NotificationService.error('Category ID already exists');
      return;
    }

    const updated = [...appState.categories, { id, name: name.trim(), emoji: emoji.trim(), active: true, restaurantId: appState.activeRestaurantId }];
    appState.saveCategories(updated);
    NotificationService.success(`Category "${name}" added!`);
  },

  promptRenameCategory(id) {
    const cat = appState.categories.find(c => c.id === id);
    if (!cat) return;

    const newName = prompt('Enter new name for category:', cat.name);
    if (!newName || !newName.trim()) return;

    const updated = appState.categories.map(c => c.id === id ? { ...c, name: newName.trim() } : c);
    appState.saveCategories(updated);
    NotificationService.success(`Renamed category to "${newName}"`);
  },

  toggleCategoryActive(id) {
    const updated = appState.categories.map(c => c.id === id ? { ...c, active: !c.active } : c);
    appState.saveCategories(updated);
  },

  deleteCategory(id) {
    if (confirm(`Delete this category? Items in this category will need reassignment.`)) {
      const updated = appState.categories.filter(c => c.id !== id);
      appState.saveCategories(updated);
      NotificationService.warning('Category deleted');
    }
  },

  // ==========================================
  // COUPONS CRUD
  // ==========================================
  renderCouponManager() {
    const container = document.getElementById('adminCouponSection');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h3 style="font-weight: 700;">Promotional Coupons & Discounts</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Manage customer discount codes, percentage & flat rates.</p>
        </div>
        <button class="nav-btn primary" onclick="AdminModule.promptAddCoupon()">+ Create Coupon</button>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Max Limit</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${appState.coupons.map(c => `
              <tr>
                <td style="font-weight: 800; font-family: var(--font-mono); color: var(--primary);">🎟️ ${c.code}</td>
                <td style="font-weight: 700;">${c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} FLAT`}</td>
                <td>₹${c.minOrder || 0}</td>
                <td>${c.maxDiscount ? `₹${c.maxDiscount}` : 'No limit'}</td>
                <td style="font-size: 0.8rem;">${c.expiresAt}</td>
                <td>
                  <button class="nav-btn ${c.active ? 'primary' : ''}" style="padding: 3px 8px; font-size: 0.75rem;" onclick="AdminModule.toggleCouponActive('${c.code}')">
                    ${c.active ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td>
                  <button class="nav-btn" style="padding: 3px 8px; font-size: 0.75rem; color: var(--danger);" onclick="AdminModule.deleteCoupon('${c.code}')">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  promptAddCoupon() {
    const code = prompt('Enter coupon code (e.g. FESTIVE20):');
    if (!code || !code.trim()) return;

    const type = prompt('Enter discount type ("percent" or "flat"):', 'percent') || 'percent';
    const value = Number(prompt(`Enter ${type === 'percent' ? 'percentage' : 'flat amount in ₹'}:`, '20'));
    const minOrder = Number(prompt('Minimum order value in ₹:', '499')) || 0;
    const maxDiscount = Number(prompt('Maximum discount cap in ₹ (0 for unlimited):', '150')) || 0;

    const newCoupon = {
      code: code.trim().toUpperCase(),
      type: type === 'flat' ? 'flat' : 'percent',
      value: value || 10,
      minOrder: minOrder,
      maxDiscount: maxDiscount || (type === 'flat' ? value : 500),
      expiresAt: '2026-12-31',
      active: true,
      restaurantId: appState.activeRestaurantId,
      desc: `${code}: ${value}${type === 'percent' ? '%' : '₹'} off on orders above ₹${minOrder}`
    };

    const updated = [...appState.coupons, newCoupon];
    appState.saveCoupons(updated);
    NotificationService.success(`Created coupon ${newCoupon.code}`);
  },

  toggleCouponActive(code) {
    const updated = appState.coupons.map(c => c.code === code ? { ...c, active: !c.active } : c);
    appState.saveCoupons(updated);
  },

  deleteCoupon(code) {
    if (confirm(`Delete coupon ${code}?`)) {
      const updated = appState.coupons.filter(c => c.code !== code);
      appState.saveCoupons(updated);
      NotificationService.warning(`Deleted coupon ${code}`);
    }
  },

  // ==========================================
  // SETTINGS & BRANDING
  // ==========================================
  loadSettingsForm() {
    const rest = appState.getCurrentRestaurant();
    const tax = rest.tax || { gstRate: 5, serviceChargeRate: 5, enableGst: true, enableServiceCharge: true };

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined ? val : '';
    };

    setVal('settingRestName', rest.name);
    setVal('settingRestTagline', rest.tagline);
    setVal('settingRestLogo', rest.logoEmoji);
    setVal('settingRestPhone', rest.phone);
    setVal('settingRestEmail', rest.email);
    setVal('settingRestAddress', rest.address);
    setVal('settingRestGstin', rest.gstNumber);
    setVal('settingRestFssai', rest.fssaiNumber);
    setVal('settingRestHours', rest.openingHours);

    setVal('settingGstRate', tax.gstRate);
    setVal('settingScRate', tax.serviceChargeRate);

    const gstChk = document.getElementById('settingGstEnabled');
    if (gstChk) gstChk.checked = !!tax.enableGst;

    const scChk = document.getElementById('settingScEnabled');
    if (scChk) scChk.checked = !!tax.enableServiceCharge;

    const soundChk = document.getElementById('settingSoundAlerts');
    if (soundChk) soundChk.checked = rest.settings ? !!rest.settings.soundAlerts : true;
  },

  saveSettings(e) {
    if (e) e.preventDefault();

    const getVal = id => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const updatedData = {
      name: getVal('settingRestName') || 'Spice Garden',
      tagline: getVal('settingRestTagline') || '',
      logoEmoji: getVal('settingRestLogo') || '🌿',
      phone: getVal('settingRestPhone') || '',
      email: getVal('settingRestEmail') || '',
      address: getVal('settingRestAddress') || '',
      gstNumber: getVal('settingRestGstin') || '',
      fssaiNumber: getVal('settingRestFssai') || '',
      openingHours: getVal('settingRestHours') || '',
      tax: {
        gstRate: Number(getVal('settingGstRate')) || 5,
        serviceChargeRate: Number(getVal('settingScRate')) || 5,
        enableGst: document.getElementById('settingGstEnabled') ? document.getElementById('settingGstEnabled').checked : true,
        enableServiceCharge: document.getElementById('settingScEnabled') ? document.getElementById('settingScEnabled').checked : true
      },
      settings: {
        soundAlerts: document.getElementById('settingSoundAlerts') ? document.getElementById('settingSoundAlerts').checked : true
      }
    };

    appState.updateRestaurant(appState.activeRestaurantId, updatedData);
    NotificationService.success('Restaurant profile and tax configuration updated!');
  }
};
