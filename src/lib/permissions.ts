/**
 * Permission-code helpers for the ABAC authorization model.
 *
 * Codes are the stable wire format produced by the backend permission catalog
 * (`orderaa-backend/src/authorization/permission-catalog.ts`) and returned as a
 * flat `permissions: string[]` on `GET /auth/me`.
 *
 * These are pure functions so they can be used outside React (interceptors,
 * route helpers). Inside components use `@/hooks/usePermissions` or `<Can />`.
 */

/** Codes referenced from UI gating. Extend as more screens adopt gating. */
export const PERMISSIONS = {
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  ROLES_ASSIGN: 'roles:assign',
  EMPLOYEES_READ: 'employees:read',
  EMPLOYEES_CREATE: 'employees:create',
  EMPLOYEES_UPDATE: 'employees:update',
  EMPLOYEES_DELETE: 'employees:delete',
} as const;

export type PermissionCode = string;

/** `orders:status:<STATUS>` — which statuses a role may see / work on. */
export const ORDER_STATUS_READ_PREFIX = 'orders:status:';
/** `orders:setStatus:<STATUS>` — which statuses a role may move an order into. */
export const ORDER_STATUS_SET_PREFIX = 'orders:setStatus:';

export const isOrderStatusReadCode = (code: string) =>
  code.startsWith(ORDER_STATUS_READ_PREFIX);

export const isOrderStatusSetCode = (code: string) =>
  code.startsWith(ORDER_STATUS_SET_PREFIX);

/** Extracts `CONFIRMED` from `orders:status:CONFIRMED` / `orders:setStatus:CONFIRMED`. */
export const orderStatusFromCode = (code: string): string =>
  code.slice(code.lastIndexOf(':') + 1);

/**
 * Fail-closed membership check against a known permission list.
 *
 * `permissions === undefined` means the session predates ABAC (persisted
 * `auth-storage` from an older build, before `/auth/me` returned codes). Those
 * sessions are treated as permitted so a deploy never blanks the UI for users
 * who have not re-authenticated — the backend guard remains the real authority.
 * Any *array* — including an empty one — is trusted and evaluated strictly.
 */
export function hasPermissionCode(
  permissions: string[] | undefined,
  code: PermissionCode
): boolean {
  if (!permissions) return true;
  return permissions.includes(code);
}

export function hasAnyPermissionCode(
  permissions: string[] | undefined,
  codes: PermissionCode[]
): boolean {
  if (!permissions) return true;
  return codes.some((code) => permissions.includes(code));
}

export function hasAllPermissionCodes(
  permissions: string[] | undefined,
  codes: PermissionCode[]
): boolean {
  if (!permissions) return true;
  return codes.every((code) => permissions.includes(code));
}
