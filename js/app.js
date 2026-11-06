/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * Main Application Orchestrator & Central Controller
 */

const App = {
  init() {
    console.log('[Spice Garden SaaS Platform] Bootstrapping unified commercial application...');

    // 1. Initialize Theme & Branding
    this.applyTheme(appState.theme);
    this.updateBrandingUI();

    // 2. Initialize Functional Modules
    MenuModule.init();
    CartModule.init();
    OrdersModule.init();
    if (typeof WaiterModule !== 'undefined') WaiterModule.init();
    if (typeof TablesModule !== 'undefined') TablesModule.init();
    if (typeof KitchenModule !== 'undefined') KitchenModule.init();
    if (typeof DashboardModule !== 'undefined') DashboardModule.init();
    if (typeof AdminModule !== 'undefined') AdminModule.init();
    if (typeof ReportsModule !== 'undefined') ReportsModule.init();
    if (typeof StaffModule !== 'undefined') StaffModule.init();
    NotificationService.init();

    // 3. Initialize App Router (Enforces RBAC route guards)
    AppRouter.init();

    // 4. Start Heartbeat Synchronization for multi-tab live updates
    this.startHeartbeatSync();

    // 5. Global Reactive Listeners
    appState.on('restaurant:updated', () => this.updateBrandingUI());
    appState.on('restaurant:changed', () => {
      this.updateBrandingUI();
      MenuModule.renderMenu();
      if (typeof WaiterModule !== 'undefined') WaiterModule.renderWaiterDashboard();
    });
    appState.on('theme:changed', (t) => this.applyTheme(t));
    appState.on('auth:login', () => AppRouter.handleRoute());
    appState.on('auth:logout', () => AppRouter.handleRoute());
    appState.on('state:reset', () => {
      this.updateBrandingUI();
      AppRouter.navigate('#order?res=res_spice_garden&table=12');
      NotificationService.success('Demo data restored to clean seed state');
    });

    this.bindGlobalShortcuts();
  },

  switchView(viewId) {
    AppRouter.renderView(viewId);
  },

  toggleTheme() {
    const newTheme = appState.theme === 'dark' ? 'light' : 'dark';
    appState.setTheme(newTheme);
    NotificationService.info(`Switched to ${newTheme === 'dark' ? 'Dark 🌙' : 'Light ☀️'} mode`);
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtns = document.querySelectorAll('.theme-toggle-btn');
    themeBtns.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`);
    });
  },

  updateBrandingUI() {
    const rest = appState.getCurrentRestaurant();

    document.querySelectorAll('.brand-title-text').forEach(el => el.textContent = rest.name);
    document.querySelectorAll('.brand-tagline-text').forEach(el => el.textContent = rest.tagline);
    document.querySelectorAll('.brand-logo-emoji').forEach(el => el.textContent = rest.logoEmoji || '🌿');

    const phoneEl = document.getElementById('stripPhone');
    const hoursEl = document.getElementById('stripHours');
    const tableEl = document.getElementById('stripTable');

    if (phoneEl) phoneEl.textContent = rest.phone;
    if (hoursEl) hoursEl.textContent = rest.openingHours;
    if (tableEl) tableEl.textContent = `Table #${appState.activeTable || '12'} (Change)`;
  },

  startHeartbeatSync() {
    // 3-second polling sync for real-time consistency across multi-tab simulation
    setInterval(() => {
      const storedOrders = StorageService.get('ORDERS');
      if (storedOrders && JSON.stringify(storedOrders) !== JSON.stringify(appState.orders)) {
        appState.orders = storedOrders;
        appState.emit('orders:updated', appState.orders);
      }
    }, 3000);
  },

  bindGlobalShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
        CartModule.closeDrawer();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
