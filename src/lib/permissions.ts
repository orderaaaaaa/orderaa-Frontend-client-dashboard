/**
 * Permission-code helpers for the ABAC authorization model.
 *
 * Codes are the stable wire format produced by the backend permission catalog
 * and returned as a flat `permissions: string[]` on `GET /auth/me`. The codes
 * themselves live in `@/lib/generated/permission-codes` — a file GENERATED
 * from the backend catalog (`cd backend && bun run generate:permissions-contract`),
 * so a typo'd code is a compile error, not silently hidden UI.
 *
 * These are pure functions so they can be used outside React (interceptors,
 * route helpers). Inside components use `@/hooks/usePermissions` or `<Can />`.
 */
import {
  ORDER_STATUS_READ_PREFIX,
  ORDER_STATUS_SET_PREFIX,
  type PermissionCode,
} from '@/lib/generated/permission-codes';

export {
  ORDER_STATUSES,
  ORDER_STATUS_READ_PREFIX,
  ORDER_STATUS_SET_PREFIX,
  PERMISSION_CODES,
  // Back-compat alias — existing call sites read `PERMISSIONS.X`.
  PERMISSION_CODES as PERMISSIONS,
} from '@/lib/generated/permission-codes';
export type {
  ActionPermissionCode,
  OrderStatusKey,
  OrderStatusReadCode,
  OrderStatusSetCode,
  PermissionCode,
} from '@/lib/generated/permission-codes';

// The classifiers below take `string`, not `PermissionCode`, on purpose: they
// classify SERVER-SENT catalog entries (`PermissionCatalogEntry.code`) in the
// roles editor, and wire data is not compile-time-known.

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
