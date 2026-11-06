/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * Client-Side Router with Strict Role-Based Route Guards
 */

const AppRouter = {
  currentRoute: '',

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('popstate', () => this.handleRoute());

    // Initial route handling
    this.handleRoute();
  },

  navigate(url) {
    if (window.location.hash === url) {
      this.handleRoute();
    } else {
      window.location.hash = url;
    }
  },

  parseRoute() {
    let hash = window.location.hash || '';
    if (!hash || hash === '#' || hash === '#/') {
      // Default to customer table 12 if no route specified
      return { path: 'order', params: { res: 'res_spice_garden', table: '12' }, raw: '#order?res=res_spice_garden&table=12' };
    }

    const [pathPart, queryPart] = hash.replace(/^#\/?/, '').split('?');
    const params = {};

    if (queryPart) {
      const sp = new URLSearchParams(queryPart);
      for (const [k, v] of sp.entries()) {
        params[k] = v;
      }
    }

    // Support clean URL-like routes e.g. order/res_spice_garden/table/12
    if (pathPart.startsWith('order/')) {
      const parts = pathPart.split('/');
      // order/:restaurantId/table/:tableId
      if (parts.length >= 2) params.res = parts[1];
      if (parts.length >= 4 && parts[2] === 'table') params.table = parts[3];
      return { path: 'order', params, raw: hash };
    }

    return { path: pathPart, params, raw: hash };
  },

  handleRoute() {
    const routeInfo = this.parseRoute();
    this.currentRoute = routeInfo.path;

    // 1. Check Route Access Permissions via AuthService
    const access = AuthService.checkRouteAccess(routeInfo.raw);

    if (!access.allowed) {
      if (access.reason === 'UNAUTHENTICATED') {
        NotificationService.warning('Please log in with your staff account to access this interface');
        this.renderView('staffLoginView');
        this.updateHeaderForRoute('login');
        return;
      }

      if (access.reason === 'FORBIDDEN') {
        this.render403AccessDenied(access.requiredRole, access.currentRole);
        this.updateHeaderForRoute('forbidden');
        return;
      }
    }

    // 2. Route Dispatcher
    switch (routeInfo.path) {
      case 'order':
        this.handleCustomerOrderRoute(routeInfo.params);
        break;

      case 'login':
        this.renderView('staffLoginView');
        this.updateHeaderForRoute('login');
        if (typeof LoginModule !== 'undefined') LoginModule.render();
        break;

      case 'waiter':
        this.renderView('waiterDashboardView');
        this.updateHeaderForRoute('waiter');
        if (typeof WaiterModule !== 'undefined') WaiterModule.renderWaiterDashboard();
        break;

      case 'kitchen':
        this.renderView('kitchenKdsView');
        this.updateHeaderForRoute('kitchen');
        if (typeof KitchenModule !== 'undefined') KitchenModule.renderKdsKanban();
        break;

      case 'admin':
        this.renderView('adminDashboardView');
        this.updateHeaderForRoute('admin');
        if (typeof DashboardModule !== 'undefined') DashboardModule.renderKPIs();
        break;

      case 'order-tracking':
        this.renderView('orderTrackingView');
        this.updateHeaderForRoute('customer');
        if (typeof OrdersModule !== 'undefined') OrdersModule.renderActiveOrderTracking();
        break;

      case 'invoice':
        this.renderView('printInvoiceView');
        this.updateHeaderForRoute('invoice');
        break;

      default:
        // Default to customer menu
        this.handleCustomerOrderRoute(routeInfo.params);
        break;
    }
  },

  handleCustomerOrderRoute(params) {
    const resId = params.res || 'res_spice_garden';
    const tableNo = params.table || '12';

    if (resId && appState.restaurants.some(r => r.id === resId)) {
      appState.setActiveRestaurant(resId);
    }
    if (tableNo) {
      appState.setActiveTable(tableNo);
    }

    this.renderView('customerMenuView');
    this.updateHeaderForRoute('customer');
    if (typeof MenuModule !== 'undefined') MenuModule.renderMenu();
  },

  renderView(viewId) {
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.remove('active');
    });

    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  render403AccessDenied(requiredRole, currentRole) {
    const deniedView = document.getElementById('accessDeniedView');
    const msgEl = document.getElementById('accessDeniedMessage');
    const user = AuthService.getCurrentUser();

    if (msgEl) {
      msgEl.innerHTML = `
        <div style="font-size: 3.5rem; margin-bottom: 12px;">🚫</div>
        <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--danger); margin-bottom: 8px;">403 — Access Denied</h1>
        <p style="font-size: 1rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 16px;">
          Your current staff account (<strong>${user ? user.name : 'User'}</strong> &bull; <span style="text-transform: capitalize;">${currentRole}</span>) does not have authorization to view this interface.
        </p>
        <div style="background: var(--bg-subtle); padding: 12px 18px; border-radius: var(--radius-md); border: 1px solid var(--border-light); font-size: 0.85rem; display: inline-block; margin-bottom: 20px;">
          <strong>Required Permission:</strong> ${requiredRole}
        </div>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button class="nav-btn primary" onclick="AppRouter.navigate(AuthService.getRoleHomeUrl('${currentRole}'))">
            &larr; Return to My Portal (${currentRole ? currentRole.toUpperCase() : 'Home'})
          </button>
          <button class="nav-btn" onclick="AuthService.logout()">
            Sign in as Different Staff
          </button>
        </div>
      `;
    }

    this.renderView('accessDeniedView');
  },

  updateHeaderForRoute(routeType) {
    const custNav = document.getElementById('headerCustomerNav');
    const staffNav = document.getElementById('headerStaffNav');
    const staffBadge = document.getElementById('headerStaffBadge');
    const staffNameEl = document.getElementById('headerStaffName');
    const user = AuthService.getCurrentUser();

    if (routeType === 'customer') {
      if (custNav) custNav.style.display = 'flex';
      if (staffNav) staffNav.style.display = 'none';
      if (staffBadge) staffBadge.style.display = 'none';
    } else if (routeType === 'waiter' || routeType === 'kitchen' || routeType === 'admin') {
      if (custNav) custNav.style.display = 'none';
      if (staffNav) staffNav.style.display = 'flex';
      if (staffBadge) {
        staffBadge.style.display = 'inline-flex';
        if (staffNameEl && user) staffNameEl.textContent = `${user.name} (${user.role.toUpperCase()})`;
      }
    } else {
      if (custNav) custNav.style.display = 'none';
      if (staffNav) staffNav.style.display = 'none';
    }
  }
};
