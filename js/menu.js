/**
 * SPICE GARDEN POS & DIGITAL ORDERING SYSTEM
 * Customer Menu, Search, Filter & Item Details Modal
 */

const MenuModule = {
  currentCat: 'all',
  searchQuery: '',
  activeFilters: {
    vegOnly: false,
    veganOnly: false,
    spicyOnly: false,
    bestsellerOnly: false,
    availableOnly: false
  },
  selectedItemForModal: null,

  init() {
    this.renderCategoryNav();
    this.renderMenu();
    this.bindEvents();

    // Listen to state changes
    appState.on('menu:updated', () => this.renderMenu());
    appState.on('categories:updated', () => {
      this.renderCategoryNav();
      this.renderMenu();
    });
    appState.on('cart:updated', () => this.renderMenu());
  },

  bindEvents() {
    const searchInput = document.getElementById('menuSearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (clearBtn) {
          clearBtn.classList.toggle('show', this.searchQuery.length > 0);
        }
        this.renderMenu();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
          clearBtn.classList.remove('show');
          this.renderMenu();
        }
      });
    }
  },

  renderCategoryNav() {
    const container = document.getElementById('categoryNavInner');
    if (!container) return;

    const categories = appState.categories.filter(c => c.active);
    let html = `
      <button class="cat-pill ${this.currentCat === 'all' ? 'active' : ''}" onclick="MenuModule.filterCategory('all', this)">
        <span>🍽️</span> All Dishes
      </button>
    `;

    categories.forEach(cat => {
      const isActive = this.currentCat === cat.id;
      html += `
        <button class="cat-pill ${isActive ? 'active' : ''}" onclick="MenuModule.filterCategory('${cat.id}', this)">
          <span>${cat.emoji || '🍽️'}</span> ${cat.name}
        </button>
      `;
    });

    container.innerHTML = html;
  },

  filterCategory(catId, btnEl) {
    this.currentCat = catId;
    document.querySelectorAll('.cat-pill').forEach(el => el.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.renderMenu();
  },

  toggleFilter(filterKey, chipEl) {
    this.activeFilters[filterKey] = !this.activeFilters[filterKey];
    if (chipEl) {
      chipEl.classList.toggle('active', this.activeFilters[filterKey]);
    }
    this.renderMenu();
  },

  getFilteredItems() {
    let items = appState.menu;

    // 1. Category Filter
    if (this.currentCat !== 'all') {
      items = items.filter(i => i.cat === this.currentCat);
    }

    // 2. Search Query (Name, Description, Ingredients)
    if (this.searchQuery) {
      const q = this.searchQuery;
      items = items.filter(i => {
        const nameMatch = i.name.toLowerCase().includes(q);
        const descMatch = (i.desc || '').toLowerCase().includes(q);
        const ingMatch = Array.isArray(i.ingredients) && i.ingredients.some(ing => ing.toLowerCase().includes(q));
        return nameMatch || descMatch || ingMatch;
      });
    }

    // 3. Quick Tag Filters
    if (this.activeFilters.vegOnly) {
      items = items.filter(i => i.dietary === 'veg' || i.dietary === 'vegan');
    }
    if (this.activeFilters.veganOnly) {
      items = items.filter(i => i.dietary === 'vegan');
    }
    if (this.activeFilters.spicyOnly) {
      items = items.filter(i => (i.spiceLevel || 0) >= 2);
    }
    if (this.activeFilters.bestsellerOnly) {
      items = items.filter(i => i.isBestseller);
    }
    if (this.activeFilters.availableOnly) {
      items = items.filter(i => i.available);
    }

    return items;
  },

  renderMenu() {
    const container = document.getElementById('menuContainer');
    if (!container) return;

    const filteredItems = this.getFilteredItems();

    if (filteredItems.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">No matching dishes found</div>
          <div class="empty-subtitle">Try adjusting your search terms or clearing active filters to see our full delicious menu.</div>
          <button class="nav-btn primary" style="margin-top: 10px;" onclick="MenuModule.clearAllFilters()">
            Clear Filters & View All
          </button>
        </div>
      `;
      return;
    }

    // Group items by category for clean visual hierarchy
    const grouped = {};
    appState.categories.forEach(cat => { grouped[cat.id] = []; });

    filteredItems.forEach(item => {
      if (!grouped[item.cat]) grouped[item.cat] = [];
      grouped[item.cat].push(item);
    });

    let html = '';
    const activeCats = appState.categories.filter(c => c.active);

    activeCats.forEach(cat => {
      const itemsInCat = grouped[cat.id] || [];
      if (itemsInCat.length === 0) return;

      html += `
        <div class="menu-section-group" id="cat-section-${cat.id}">
          <div class="section-header">
            <h2 class="section-title">
              <span>${cat.emoji || '🍽️'}</span> ${cat.name}
            </h2>
            <span class="section-count">${itemsInCat.length} ${itemsInCat.length === 1 ? 'item' : 'items'}</span>
          </div>

          <div class="menu-cards-grid">
            ${itemsInCat.map(item => this.renderCardHTML(item)).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  renderCardHTML(item) {
    const qtyInCart = CartModule.getItemQuantity(item.id);
    const spiceIcons = '🌶️'.repeat(item.spiceLevel || 0);

    return `
      <div class="food-card ${item.available ? '' : 'unavailable'}" data-item-id="${item.id}">
        <!-- Media / Image -->
        <div class="card-media-wrapper" onclick="MenuModule.openItemDetailModal(${item.id})">
          ${item.isBestseller ? `
            <div class="badge-ribbon">⭐ Bestseller</div>
          ` : ''}
          ${item.prepTime ? `
            <div class="badge-prep-time">⏱️ ${item.prepTime}</div>
          ` : ''}
          
          ${item.image ? `
            <img class="card-img" src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
            <div class="card-placeholder-art" style="display: none;">${item.emoji || '🍲'}</div>
          ` : `
            <div class="card-placeholder-art">${item.emoji || '🍲'}</div>
          `}
        </div>

        <!-- Body -->
        <div class="card-body">
          <div class="card-header-row">
            <div class="dish-name" onclick="MenuModule.openItemDetailModal(${item.id})">
              ${item.name}
            </div>
            <div class="diet-indicator ${item.dietary || 'veg'}" title="${item.dietary === 'vegan' ? 'Vegan' : 'Pure Veg'}"></div>
          </div>

          <p class="dish-desc">${item.desc || 'Prepared freshly with authentic house spices.'}</p>

          <div class="card-meta-chips">
            ${item.spiceLevel > 0 ? `<span class="spice-rating" title="Spiciness: ${item.spiceLevel}/3">${spiceIcons}</span>` : ''}
            ${item.calories ? `<span class="text-muted">${item.calories}</span>` : ''}
          </div>

          <!-- Footer -->
          <div class="card-footer-row">
            <div class="price-container">
              <span class="currency-symbol">₹</span>
              <span class="dish-price">${item.price}</span>
            </div>

            <div class="action-container">
              ${!item.available ? `
                <span class="unavail-label" style="font-size: 0.8rem; color: var(--danger); font-weight: 700;">Sold Out</span>
              ` : (
                qtyInCart === 0 ? `
                  <button class="btn-card-add" onclick="CartModule.quickAddItem(${item.id}, event)" aria-label="Add ${item.name} to cart">
                    <span>+</span> Add
                  </button>
                ` : `
                  <div class="qty-counter-control">
                    <button class="qty-btn-sub" onclick="CartModule.decrementItem(${item.id}, event)" aria-label="Decrease quantity">−</button>
                    <span class="qty-display-val">${qtyInCart}</span>
                    <button class="qty-btn-add" onclick="CartModule.quickAddItem(${item.id}, event)" aria-label="Increase quantity">+</button>
                  </div>
                `
              )}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  openItemDetailModal(itemId) {
    const item = appState.menu.find(m => m.id === itemId);
    if (!item) return;

    this.selectedItemForModal = item;
    const modalEl = document.getElementById('itemDetailModal');
    const contentEl = document.getElementById('itemDetailModalBody');

    if (!modalEl || !contentEl) return;

    const qtyInCart = CartModule.getItemQuantity(item.id) || 1;
    const spiceIcons = item.spiceLevel > 0 ? '🌶️'.repeat(item.spiceLevel) : 'Mild';

    contentEl.innerHTML = `
      <div class="detail-modal-media">
        ${item.image ? `
          <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'"/>
        ` : `
          <div class="card-placeholder-art">${item.emoji || '🍲'}</div>
        `}
      </div>

      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div>
          <h2 style="font-family: var(--font-serif); font-size: 1.4rem; font-weight: 700; color: var(--text-main);">
            ${item.name}
          </h2>
          <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px; font-size: 0.85rem; color: var(--text-muted);">
            <span class="diet-indicator ${item.dietary || 'veg'}"></span>
            <span>${item.dietary === 'vegan' ? '100% Vegan' : '100% Pure Vegetarian'}</span>
            ${item.prepTime ? `<span>&bull; ⏱️ ${item.prepTime}</span>` : ''}
            ${item.calories ? `<span>&bull; 🔥 ${item.calories}</span>` : ''}
          </div>
        </div>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">
          ₹${item.price}
        </div>
      </div>

      <p style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.5;">
        ${item.desc || 'Cooked with premium ingredients and seasoned to perfection.'}
      </p>

      <div style="background: var(--bg-subtle); padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.85rem; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="font-weight: 600; color: var(--text-muted);">Spice Rating:</span>
          <span>${spiceIcons} (${item.spiceLevel || 0}/3)</span>
        </div>
        ${Array.isArray(item.ingredients) && item.ingredients.length > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; color: var(--text-muted);">Key Ingredients:</span>
            <span>${item.ingredients.join(', ')}</span>
          </div>
        ` : ''}
        ${Array.isArray(item.allergens) && item.allergens.length > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; color: var(--danger);">Allergen Info:</span>
            <span style="font-weight: 700; color: var(--danger);">${item.allergens.join(', ')}</span>
          </div>
        ` : ''}
      </div>

      <!-- Special Instructions Input -->
      <div>
        <label class="form-label" style="font-size: 0.85rem;">
          Special Cooking Instructions (Optional):
        </label>
        <textarea 
          id="modalSpecialNotes" 
          class="special-instruction-box" 
          placeholder="e.g. Less spicy, make it extra crispy, no garlic, serve hot..."
        ></textarea>
      </div>

      <!-- Quantity Selector & Add Button in Modal -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">Quantity:</span>
          <div class="qty-counter-control" style="background: var(--bg-subtle); border: 1px solid var(--border-medium);">
            <button class="qty-btn-sub" style="color: var(--text-main);" onclick="MenuModule.updateModalQty(-1)">−</button>
            <span class="qty-display-val" id="modalQtyDisplay" style="color: var(--text-main);">${qtyInCart > 0 ? qtyInCart : 1}</span>
            <button class="qty-btn-add" style="color: var(--text-main);" onclick="MenuModule.updateModalQty(1)">+</button>
          </div>
        </div>

        <button class="nav-btn primary" style="padding: 12px 24px; font-size: 0.95rem;" onclick="MenuModule.addModalItemToCart()">
          Add to Order &bull; ₹<span id="modalAddPriceDisplay">${item.price * (qtyInCart > 0 ? qtyInCart : 1)}</span>
        </button>
      </div>
    `;

    modalEl.classList.add('open');
  },

  updateModalQty(delta) {
    const qtyEl = document.getElementById('modalQtyDisplay');
    const priceEl = document.getElementById('modalAddPriceDisplay');
    if (!qtyEl || !this.selectedItemForModal) return;

    let current = parseInt(qtyEl.textContent) || 1;
    current = Math.max(1, current + delta);
    qtyEl.textContent = current;

    if (priceEl) {
      priceEl.textContent = this.selectedItemForModal.price * current;
    }
  },

  addModalItemToCart() {
    if (!this.selectedItemForModal) return;
    const qtyEl = document.getElementById('modalQtyDisplay');
    const notesEl = document.getElementById('modalSpecialNotes');

    const qty = parseInt(qtyEl ? qtyEl.textContent : 1) || 1;
    const note = notesEl ? notesEl.value.trim() : '';

    CartModule.addItem(this.selectedItemForModal, qty, note);
    this.closeModal();
    NotificationService.success(`Added ${this.selectedItemForModal.name} to cart!`);
  },

  closeModal() {
    const modalEl = document.getElementById('itemDetailModal');
    if (modalEl) modalEl.classList.remove('open');
    this.selectedItemForModal = null;
  },

  clearAllFilters() {
    this.currentCat = 'all';
    this.searchQuery = '';
    const searchInput = document.getElementById('menuSearchInput');
    if (searchInput) searchInput.value = '';
    
    Object.keys(this.activeFilters).forEach(k => { this.activeFilters[k] = false; });
    document.querySelectorAll('.filter-tag-chip').forEach(c => c.classList.remove('active'));

    this.renderCategoryNav();
    this.renderMenu();
  }
};
