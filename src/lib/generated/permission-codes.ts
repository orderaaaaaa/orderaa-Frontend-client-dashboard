/* AUTO-GENERATED — DO NOT EDIT.
 *
 * Source of truth: backend/src/authorization/permission-catalog.ts
 *                  backend/src/common/constants/order-lifecycle.ts
 * Regenerate:      cd backend && bun run generate:permissions-contract
 * Staleness check: cd backend && bun run check:permissions-contract
 */

/** Canonical order-status lifecycle, in backend ORDER_LIFECYCLE order. */
export const ORDER_STATUSES = [
  'NEW_ORDER',
  'WHATSAPP_CONFIRMED',
  'ATTEMPTED',
  'WAITING_FOR_PAYMENT',
  'WHATSAPP',
  'CALL_AGAIN',
  'EDIT_REJECTED',
  'POSTPONED',
  'STOPPED',
  'CANCELLED',
  'UNCOMPLETED',
  'CONFIRMED',
  'WAITING_FOR_PACKAGING',
  'PREPARED',
  'WAITING_FOR_APPROVAL',
  'SHIPPING',
  'WITH_DRIVER',
  'DELIVERED',
  'RETURNED_DELIVERED',
  'RETURNED_COLLECTED',
  'COLLECTED',
  'RETURNED_SETTLED',
  'RETURNED_FINAL',
  'MISSING',
] as const;

export type OrderStatusKey = (typeof ORDER_STATUSES)[number];

/** `orders:status:<STATUS>` — which statuses a role may see / work on. */
export const ORDER_STATUS_READ_PREFIX = 'orders:status:';
/** `orders:setStatus:<STATUS>` — which statuses a role may move an order into. */
export const ORDER_STATUS_SET_PREFIX = 'orders:setStatus:';

export type OrderStatusReadCode = `orders:status:${OrderStatusKey}`;
export type OrderStatusSetCode = `orders:setStatus:${OrderStatusKey}`;

/** Every non-status permission code, in catalog order. */
export const PERMISSION_CODES = {
  ORDERS_READ: 'orders:read',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_CANCEL: 'orders:cancel',
  ORDERS_BULK_UPDATE: 'orders:bulk-update',
  ORDERS_PREPARE: 'orders:prepare',
  ORDERS_CALL_AGAIN: 'orders:call-again',
  ORDERS_WAITING_FOR_PACKAGING: 'orders:waiting-for-packaging',
  ORDERS_SUBMIT_FOR_APPROVAL: 'orders:submit-for-approval',
  ORDERS_PRINT: 'orders:print',
  ORDERS_IMPORT: 'orders:import',
  ORDERS_PRODUCTS_MANAGE: 'orders:products:manage',
  ORDERS_RETURN_RECEIPTS_CREATE: 'orders:return-receipts:create',
  ORDERS_RETURN_RECEIPTS_REVIEW: 'orders:return-receipts:review',
  ORDERS_PICKUPS_REVIEW: 'orders:pickups:review',
  ORDERS_SETTLEMENT_MANAGE: 'orders:settlement:manage',
  ORDERS_STATISTICS_READ: 'orders:statistics:read',
  ORDERS_BYPASS_LOCK: 'orders:bypass-lock',
  FOLLOWUP_READ: 'followup:read',
  FOLLOWUP_MANAGE: 'followup:manage',
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_UPDATE: 'customers:update',
  CUSTOMERS_MERGE: 'customers:merge',
  PRODUCTS_READ: 'products:read',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_SYNC: 'products:sync',
  PRODUCTS_MERGE: 'products:merge',
  PRODUCTS_STOCK_READ: 'products:stock:read',
  EMPLOYEES_READ: 'employees:read',
  EMPLOYEES_CREATE: 'employees:create',
  EMPLOYEES_UPDATE: 'employees:update',
  EMPLOYEES_ACTIVATE: 'employees:activate',
  EMPLOYEES_DELETE: 'employees:delete',
  EMPLOYEES_PERFORMANCE_UPDATE: 'employees:performance:update',
  EMPLOYEES_ATTENDANCE_READ: 'employees:attendance:read',
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  ROLES_ASSIGN: 'roles:assign',
  SUPPLIERS_READ: 'suppliers:read',
  SUPPLIERS_CREATE: 'suppliers:create',
  SUPPLIERS_UPDATE: 'suppliers:update',
  SUPPLIERS_DELETE: 'suppliers:delete',
  SUPPLIER_INVOICES_READ: 'supplier-invoices:read',
  SUPPLIER_INVOICES_CREATE: 'supplier-invoices:create',
  SUPPLIER_INVOICES_UPDATE: 'supplier-invoices:update',
  SUPPLIER_INVOICES_DELETE: 'supplier-invoices:delete',
  SUPPLIER_INVOICES_APPROVE: 'supplier-invoices:approve',
  SUPPLIER_INVOICES_ATTRIBUTE: 'supplier-invoices:attribute',
  WAREHOUSES_READ: 'warehouses:read',
  WAREHOUSES_CREATE: 'warehouses:create',
  WAREHOUSES_UPDATE: 'warehouses:update',
  WAREHOUSES_DELETE: 'warehouses:delete',
  WAREHOUSES_STOCK_READ: 'warehouses:stock:read',
  STOCK_MOVEMENTS_READ: 'stock-movements:read',
  STOCK_MOVEMENTS_ADJUST: 'stock-movements:adjust',
  STOCK_MOVEMENTS_TRANSFER: 'stock-movements:transfer',
  STOCK_WORKFLOWS_READ: 'stock-workflows:read',
  STOCK_WORKFLOWS_CREATE: 'stock-workflows:create',
  STOCK_WORKFLOWS_UPDATE: 'stock-workflows:update',
  STOCK_WORKFLOWS_DELETE: 'stock-workflows:delete',
  MERCHANT_SETTINGS_READ: 'merchant-settings:read',
  MERCHANT_SETTINGS_UPDATE: 'merchant-settings:update',
  STORES_READ: 'stores:read',
  STORES_CREATE: 'stores:create',
  STORES_UPDATE: 'stores:update',
  STORES_DELETE: 'stores:delete',
  SHIPPING_CONFIG_READ: 'shipping-config:read',
  SHIPPING_CONFIG_MANAGE: 'shipping-config:manage',
  SHIPPING_LOCATIONS_READ: 'shipping-locations:read',
  INTEGRATION_CONFIG_READ: 'integration-config:read',
  INTEGRATION_CONFIG_MANAGE: 'integration-config:manage',
  AUTOMATION_CONFIG_READ: 'automation-config:read',
  AUTOMATION_CONFIG_MANAGE: 'automation-config:manage',
  BILLING_READ: 'billing:read',
  WALLET_READ: 'wallet:read',
  WALLET_TOPUP: 'wallet:topup',
  SUBSCRIPTIONS_SUBSCRIBE: 'subscriptions:subscribe',
  REPORTS_READ: 'reports:read',
  REPORTS_EMPLOYEES_READ: 'reports:employees:read',
  PACKAGING_INVENTORY_READ: 'packaging-inventory:read',
  PACKAGING_INVENTORY_CHECK: 'packaging-inventory:check',
  CANCELLATION_REASONS_READ: 'cancellation-reasons:read',
  UPLOADS_CREATE: 'uploads:create',
  PLATFORM_TEMPLATES_READ: 'platform:templates:read',
  PLATFORM_TEMPLATES_MANAGE: 'platform:templates:manage',
  PLATFORM_ADMINS_READ: 'platform:admins:read',
  PLATFORM_ADMINS_MANAGE: 'platform:admins:manage',
  PLATFORM_PERMISSIONS_READ: 'platform:permissions:read',
  PLATFORM_MERCHANTS_READ: 'platform:merchants:read',
  PLATFORM_PLANS_MANAGE: 'platform:plans:manage',
  PLATFORM_CHARGE_OPTIONS_MANAGE: 'platform:charge-options:manage',
} as const;

export type ActionPermissionCode =
  (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];

/** Mirrors the backend `PermissionCode` union exactly. */
export type PermissionCode =
  | ActionPermissionCode
  | OrderStatusReadCode
  | OrderStatusSetCode;
