export const QUERY_KEYS = {
  // Orders
  ORDERS: 'orders',
  ORDER_DETAILS: 'order-details',
  ORDER_STATISTICS: 'order-statistics',
  ORDER_FILTER_OPTIONS: 'order-filter-options',
  ORDER_STATUSES: 'order-statuses',
  DEPARTMENT_STATUSES: 'department-statuses',
  CUSTOMER_ORDERS: 'customer-orders',
  PRINT_ORDER_STATISTICS: 'print-order-statistics',

  // Products
  PRODUCTS: 'products',
  PRODUCT_VARIANTS_OPTIONS: 'product-variants-options',
  PRODUCT_ATTRIBUTE_OPTIONS: 'product-attribute-options',

  // Stock
  STOCK_ANALYSIS: 'stock-analysis',
  STOCK_PRODUCTS: 'stock-products',
  STOCK_FILTER_OPTIONS: 'stock-filter-options',

  // Lookups
  GOVERNORATES: 'governorates',
  CITIES: 'cities',
  AREAS: 'areas',
  SHIPPING_COMPANIES: 'shipping-companies',
  PAYMENT_METHODS: 'payment-methods',
  PAYMENT_STATUSES: 'payment-statuses',
  CATEGORIES: 'categories',
  SHIPPING_TYPES: 'shipping-types',
  UTM_SOURCES: 'utm-sources',
  PAGE_NAMES: 'page-names',
  DEPARTMENTS: 'departments',
  SHIPPING_EVENTS: 'shipping-events',

  // Employees
  EMPLOYEES: 'employees',

  // Suppliers
  SUPPLIERS: 'suppliers',
  SUPPLIER_DETAIL: 'supplier-detail',
  SUPPLIER_PRODUCTS: 'supplier-products',
  SUPPLIER_PRODUCT_TRANSACTIONS: 'supplier-product-transactions',

  // Supplier Invoices
  SUPPLIER_INVOICES: 'supplier-invoices',
  SUPPLIER_INVOICE_DETAIL: 'supplier-invoice-detail',

  // Integrations
  INTEGRATION_CONFIGS: 'integration-configs',

  // Cancellation Reasons
  CANCELLATION_REASONS: 'cancellation-reasons',
  TOP_CANCELLATION_REASONS: 'top-cancellation-reasons',

  // Logistics & Tracking
  GOVERNORATE_LOGISTICS_CONFIG: 'governorate-logistics-config',
  TRACKING_CARDS: 'tracking-cards',
  FOLLOWUP_NEW_ORDERS: 'followup-new-orders',
  FOLLOWUP_OVERDUE: 'followup-overdue',
  FOLLOWUP_EXECUTED: 'followup-executed',
  POST_SHIPPING_REASONS: 'post-shipping-reasons',
  TOP_POST_SHIPPING_REASONS: 'top-post-shipping-reasons',
  SHIPPING_CANCELLATION_REASONS: 'shipping-cancellation-reasons',
  ORDER_PRODUCT_CHANGE_LOGS: 'order-product-change-logs',

  // Dashboard Reports
  DASHBOARD_SUMMARY: 'dashboard-summary',
  DASHBOARD_ATTEMPTED: 'dashboard-attempted',
  DASHBOARD_REMAINING: 'dashboard-remaining',
  DASHBOARD_CANCELLED: 'dashboard-cancelled',
  DASHBOARD_HOURLY_CHART: 'dashboard-hourly-chart',
  DASHBOARD_BY_STATUS: 'dashboard-by-status',
  DASHBOARD_ATTEMPT_CONVERSION: 'dashboard-attempt-conversion',
  DASHBOARD_EDIT_REJECTED_PRODUCTS: 'dashboard-edit-rejected-products',
  DASHBOARD_EMPLOYEES_ONLINE: 'dashboard-employees-online',
  DASHBOARD_EMPLOYEES_OFFLINE: 'dashboard-employees-offline',
  DASHBOARD_EMPLOYEES_STATUS: 'dashboard-employees-status',
  DASHBOARD_EMPLOYEE_ACTIVITY: 'dashboard-employee-activity',
  CONFIRMED_PRODUCTS_REPORT: 'confirmed-products-report',
  PACKAGING_INVENTORY: 'packaging-inventory',

  // Returns Receiving
  RETURNS_RECEIVING_SESSION: 'returns-receiving-session',
  RETURNS_RECEIVING_SHIPPING_COUNT: 'returns-receiving-shipping-count',

  // Wallet & Billing
  WALLET_BALANCE: 'wallet-balance',
  WALLET_TRANSACTIONS: 'wallet-transactions',
  BILLING_INFO: 'billing-info',
  WALLET_CHARGE_OPTIONS: 'wallet-charge-options',

  // Plans & Subscriptions
  PLANS: 'plans',
  ACTIVE_SUBSCRIPTION: 'active-subscription',
} as const;

export type QueryKeyType = (typeof QUERY_KEYS)[keyof typeof QUERY_KEYS];
