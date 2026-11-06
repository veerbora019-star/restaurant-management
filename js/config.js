/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * Multi-Tenant Config, Permissions, Status Constants & Role Definitions
 */

const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const TABLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  FOOD_READY: 'FOOD_READY',
  BILL_REQUESTED: 'BILL_REQUESTED',
  CLEANING: 'CLEANING'
};

const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

const PAYMENT_METHODS = {
  CASH: 'Cash',
  UPI: 'UPI (GPay / PhonePe / Paytm)',
  CARD: 'Credit / Debit Card',
  ONLINE: 'Online Payment Gateway'
};

const ROLES = {
  OWNER: { id: 'owner', name: 'Restaurant Owner', permissions: ['all'] },
  MANAGER: { id: 'manager', name: 'Store Manager', permissions: ['orders', 'menu', 'tables', 'reports', 'billing'] },
  WAITER: { id: 'waiter', name: 'Service Staff / Waiter', permissions: ['tables', 'orders', 'serving'] },
  KITCHEN: { id: 'kitchen', name: 'Kitchen Chef / KDS', permissions: ['kds', 'orders'] },
  CUSTOMER: { id: 'customer', name: 'Customer (QR Dine-in)', permissions: ['menu', 'cart', 'order_self'] }
};

const MULTI_RESTAURANTS_SEED = [
  {
    id: 'res_spice_garden',
    name: 'Spice Garden Authentic Kitchen',
    tagline: '100% Pure Vegetarian Fine Dining',
    logoEmoji: '🌿',
    phone: '+91 98765 43210',
    email: 'contact@spicegarden.in',
    address: 'Plot 42, Heritage Court, FC Road, Pune - 411004, Maharashtra',
    gstNumber: '27AABCS1429B1Z5',
    fssaiNumber: '11521019000342',
    openingHours: '11:00 AM – 11:30 PM (All 7 Days)',
    currency: '₹',
    currencyCode: 'INR',
    primaryColor: '#15803d',
    secondaryColor: '#f59e0b',
    tax: {
      gstRate: 5.0,
      serviceChargeRate: 5.0,
      enableGst: true,
      enableServiceCharge: true,
      packagingCharge: 0
    },
    settings: {
      allowCustomerSelfOrder: true,
      autoAcceptOrders: false,
      soundAlerts: true,
      estimatedPrepTimeMins: 20
    }
  },
  {
    id: 'res_royal_punjab',
    name: 'Royal Punjab Dhaba & Grill',
    tagline: 'Authentic Tandoor, Kebabs & Biryanis',
    logoEmoji: '👑',
    phone: '+91 98111 22334',
    email: 'info@royalpunjab.in',
    address: 'Shop 18, Grand Plaza, Bandra West, Mumbai - 400050',
    gstNumber: '27AABCP9981K1Z2',
    fssaiNumber: '11522020000889',
    openingHours: '12:00 PM – 12:00 AM',
    currency: '₹',
    currencyCode: 'INR',
    primaryColor: '#b45309',
    secondaryColor: '#dc2626',
    tax: {
      gstRate: 5.0,
      serviceChargeRate: 0.0,
      enableGst: true,
      enableServiceCharge: false,
      packagingCharge: 0
    },
    settings: {
      allowCustomerSelfOrder: true,
      autoAcceptOrders: true,
      soundAlerts: true,
      estimatedPrepTimeMins: 15
    }
  }
];

const DEFAULT_CONFIG = {
  activeRestaurantId: 'res_spice_garden',
  security: {
    adminPassword: 'admin123',
    demoMode: true,
    note: 'DEMO ARCHITECTURE NOTICE: In a commercial production environment, frontend credentials are replaced with secure server-side JWT authentication, HTTPS cookies, and database role-based access control (RBAC).'
  }
};
