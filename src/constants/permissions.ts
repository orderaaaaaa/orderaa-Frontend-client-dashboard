import { Role, EmployeeAccessLevel } from '@/types/auth';
import type { Permission } from '@/types/auth';

export const PERMISSION_PRESETS = {
  ALL_AUTHENTICATED: { minRole: Role.USER } as Permission,
  MANAGER_AND_ABOVE: {
    minRole: Role.USER,
    minAccessLevel: EmployeeAccessLevel.MANAGER,
  } as Permission,
  ADMIN_AND_ABOVE: {
    minRole: Role.USER,
    minAccessLevel: EmployeeAccessLevel.ADMIN,
  } as Permission,
  EMPLOYEE_SUPER_ADMIN: {
    minRole: Role.USER,
    minAccessLevel: EmployeeAccessLevel.SUPER_ADMIN,
  } as Permission,
  MERCHANT_OWNER: { minRole: Role.ADMIN } as Permission,
  PLATFORM_ADMIN: { minRole: Role.SUPERADMIN } as Permission,
} as const;

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/dashboard': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/orders': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/orders/allOrders': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/orders/call-center': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/orders/print-orders': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/orders/shipping-orders': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/reports': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/customers': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/employees': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/employees/add-employee': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/upload-products/manual': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/upload-products/excel': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/integrations': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/link-shipping-company': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/store-settings': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/wallet': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/products': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/purchases': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/purchases/all-invoices': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/purchases/add-invoice': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/settings': PERMISSION_PRESETS.ALL_AUTHENTICATED,
  '/dashboard/unauthorized': PERMISSION_PRESETS.ALL_AUTHENTICATED,
};

export const DEFAULT_PERMISSION: Permission = PERMISSION_PRESETS.ALL_AUTHENTICATED;

export function getPermissionForRoute(pathname: string): Permission {
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }

  const matchingRoutes = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length);

  return matchingRoutes.length > 0
    ? ROUTE_PERMISSIONS[matchingRoutes[0]]
    : DEFAULT_PERMISSION;
}
