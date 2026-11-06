/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * Clean API & Data Service Layer (PostgreSQL & Supabase Connected)
 * 
 * All UI controllers communicate EXCLUSIVELY through these service methods.
 * Raw queries and direct storage manipulations are isolated here.
 */

const RestaurantAPI = {
  activeRestaurantId: 'res_spice_garden',

  async init(seedData) {
    await dbEngine.init(seedData);
  },

  setActiveRestaurant(resId) {
    this.activeRestaurantId = resId;
  },

  // 1. RESTAURANT
  async getRestaurant(restaurantId = this.activeRestaurantId) {
    const list = await dbEngine.selectRestaurants({ id: restaurantId });
    return list.length > 0 ? list[0] : null;
  },

  async updateRestaurant(restaurantId = this.activeRestaurantId, data = {}) {
    return await dbEngine.updateRestaurant(restaurantId, data);
  },

  async getSettings(restaurantId = this.activeRestaurantId) {
    return await dbEngine.getSettings(restaurantId);
  },

  async updateSettings(restaurantId = this.activeRestaurantId, updates = {}) {
    return await dbEngine.updateSettings(restaurantId, updates);
  },

  // 2. MENU & CATEGORIES
  async getCategories(restaurantId = this.activeRestaurantId) {
    return await dbEngine.selectCategories(restaurantId);
  },

  async createCategory(restaurantId = this.activeRestaurantId, categoryPayload = {}) {
    return await dbEngine.insertCategory(restaurantId, categoryPayload);
  },

  async getMenu(restaurantId = this.activeRestaurantId, options = {}) {
    return await dbEngine.selectMenuItems(restaurantId, options);
  },

  async createMenuItem(itemPayload, restaurantId = this.activeRestaurantId) {
    return await dbEngine.insertMenuItem(restaurantId, itemPayload);
  },

  async updateMenuItem(itemId, itemPayload, restaurantId = this.activeRestaurantId) {
    return await dbEngine.updateMenuItem(restaurantId, itemId, itemPayload);
  },

  async deleteMenuItem(itemId, restaurantId = this.activeRestaurantId) {
    return await dbEngine.deleteMenuItem(restaurantId, itemId);
  },

  // 3. TABLES
  async getTables(restaurantId = this.activeRestaurantId) {
    return await dbEngine.selectTables(restaurantId);
  },

  async getTable(tableNumber, restaurantId = this.activeRestaurantId) {
    const tables = await dbEngine.selectTables(restaurantId);
    return tables.find(t => t.table_number === String(tableNumber).padStart(2, '0')) || null;
  },

  async updateTableStatus(tableNumber, status, activeOrderId = null, restaurantId = this.activeRestaurantId) {
    return await dbEngine.updateTableStatus(restaurantId, tableNumber, status, activeOrderId);
  },

  async generateTableQR(tableId, restaurantId = this.activeRestaurantId) {
    const tables = await dbEngine.selectTables(restaurantId);
    const table = tables.find(t => t.id === tableId || t.table_number === String(tableId).padStart(2, '0'));
    if (!table) throw new Error('Table not found');

    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'http://localhost:8080';
    const qrUrl = `${origin}/#order?res=${restaurantId}&table=${table.table_number}`;
    return {
      table,
      url: qrUrl,
      qrSvg: (typeof QRModule !== 'undefined' && QRModule.renderQRSVG) ? QRModule.renderQRSVG(qrUrl) : null
    };
  },

  // 4. ORDERS (Centralized Order Lifecycle & Historical Pricing)
  async createOrder(orderPayload, restaurantId = this.activeRestaurantId) {
    return await dbEngine.insertOrder(restaurantId, orderPayload);
  },

  async getOrder(orderId, restaurantId = this.activeRestaurantId) {
    const orders = await dbEngine.selectOrders(restaurantId, { id: orderId });
    return orders.length > 0 ? orders[0] : null;
  },

  async updateOrderStatus(orderId, newStatus, cancellationReason = null, restaurantId = this.activeRestaurantId) {
    return await dbEngine.updateOrderStatus(restaurantId, orderId, newStatus, cancellationReason);
  },

  async getKitchenOrders(restaurantId = this.activeRestaurantId) {
    return await dbEngine.selectOrders(restaurantId, {
      status: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY']
    });
  },

  async getWaiterOrders(restaurantId = this.activeRestaurantId) {
    return await dbEngine.selectOrders(restaurantId, {
      status: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'BILL_REQUESTED']
    });
  },

  async getRestaurantOrders(restaurantId = this.activeRestaurantId, filter = {}) {
    return await dbEngine.selectOrders(restaurantId, filter);
  },

  // 5. STAFF & RBAC
  async getStaff(restaurantId = this.activeRestaurantId) {
    return await dbEngine.selectProfiles(restaurantId);
  },

  async createStaff(staffPayload, restaurantId = this.activeRestaurantId) {
    return await dbEngine.insertProfile(restaurantId, staffPayload);
  },

  // 6. REALTIME SUBSCRIPTIONS
  subscribeToOrders(callback, restaurantId = this.activeRestaurantId) {
    return dbEngine.subscribe('orders', (evt) => {
      if (!evt.data || evt.data.restaurant_id === restaurantId) {
        callback(evt);
      }
    });
  },

  subscribeToTables(callback, restaurantId = this.activeRestaurantId) {
    return dbEngine.subscribe('tables', (evt) => {
      if (!evt.data || evt.data.restaurant_id === restaurantId) {
        callback(evt);
      }
    });
  },

  subscribeToMenu(callback, restaurantId = this.activeRestaurantId) {
    return dbEngine.subscribe('menu', (evt) => {
      if (!evt.data || evt.data.restaurant_id === restaurantId) {
        callback(evt);
      }
    });
  },

  subscribeToNotifications(callback, restaurantId = this.activeRestaurantId) {
    return dbEngine.subscribe('notifications', (evt) => {
      if (!evt.data || evt.data.restaurant_id === restaurantId) {
        callback(evt);
      }
    });
  },

  // 7. FINANCIAL REPORTS & ANALYTICS
  async getReports(restaurantId = this.activeRestaurantId, timeRange = 'today') {
    const orders = await dbEngine.selectOrders(restaurantId);
    const validOrders = orders.filter(o => o.status !== 'CANCELLED');

    const grossSales = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalGst = validOrders.reduce((sum, o) => sum + Number(o.gst || 0), 0);
    const totalDiscount = validOrders.reduce((sum, o) => sum + Number(o.discount || 0), 0);
    const totalServiceCharge = validOrders.reduce((sum, o) => sum + Number(o.service_charge || 0), 0);
    const avgOrderValue = validOrders.length > 0 ? Math.round(grossSales / validOrders.length) : 0;

    // Item sales breakdown
    const itemSalesMap = {};
    validOrders.forEach(o => {
      (o.items || []).forEach(item => {
        if (!itemSalesMap[item.name]) {
          itemSalesMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemSalesMap[item.name].quantity += item.quantity;
        itemSalesMap[item.name].revenue += item.total;
      });
    });

    const topSellingDishes = Object.values(itemSalesMap).sort((a, b) => b.revenue - a.revenue);

    return {
      grossSales,
      totalGst,
      totalDiscount,
      totalServiceCharge,
      avgOrderValue,
      totalOrdersCount: validOrders.length,
      topSellingDishes,
      orders: validOrders
    };
  }
};
