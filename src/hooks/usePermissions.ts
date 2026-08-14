'use client';

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { fetchMe } from '@/lib/api/auth';
import {
  PERMISSIONS,
  hasAllPermissionCodes,
  hasAnyPermissionCode,
  hasPermissionCode,
  type PermissionCode,
} from '@/lib/permissions';

/**
 * Permission codes of the signed-in user, straight from the persisted
 * `/auth/me` payload. `undefined` = pre-ABAC session (see `hasPermissionCode`).
 */
export function usePermissions(): string[] | undefined {
  return useAuthStore((state) => state.user?.permissions);
}

/** Roles assigned to the signed-in user (`{ id, name }[]`). */
export function useCurrentUserRoles() {
  return useAuthStore((state) => state.user?.roles) ?? [];
}

/**
 * Imperative permission check — use when gating needs to happen in a callback,
 * a `useMemo`, or over a list. For rendering, prefer `<Can />`.
 *
 * ```ts
 * const { hasPermission, hasAnyPermission } = usePermissionCheck();
 * if (hasPermission('roles:assign')) { … }
 * ```
 */
export function usePermissionCheck() {
  const permissions = usePermissions();

  const hasPermission = useCallback(
    (code: PermissionCode) => hasPermissionCode(permissions, code),
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (codes: PermissionCode[]) => hasAnyPermissionCode(permissions, codes),
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (codes: PermissionCode[]) => hasAllPermissionCodes(permissions, codes),
    [permissions]
  );

  return useMemo(
    () => ({ permissions, hasPermission, hasAnyPermission, hasAllPermissions }),
    [permissions, hasPermission, hasAnyPermission, hasAllPermissions]
  );
}

/** Boolean shorthand for a single code. */
export function useHasPermission(code: PermissionCode): boolean {
  const permissions = usePermissions();
  return hasPermissionCode(permissions, code);
}

/**
 * Whether the signed-in user can hand roles to an employee. Needs BOTH codes:
 * `roles:read` to list the roles at all, `roles:assign` for the backend to
 * accept them. Used to decide if a roles field is rendered — and therefore
 * whether picking a role can be required (see `buildCreateEmployeeSchema`).
 */
export function useCanAssignRoles(): boolean {
  const { hasAllPermissions } = usePermissionCheck();
  return hasAllPermissions([PERMISSIONS.ROLES_READ, PERMISSIONS.ROLES_ASSIGN]);
}

/**
 * Re-reads `/auth/me` and writes it back to the auth store. Call it after any
 * mutation that can change the caller's own grants (editing a role they hold,
 * reassigning their own roles) so the UI stops reflecting stale permissions.
 */
export function useRefreshCurrentUser() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  return useCallback(async () => {
    if (!token) return;
    try {
      const user = await fetchMe(token);
      setUser(user);
    } catch {
      // A failed refresh must never break the mutation that triggered it —
      // the stale payload stays until the next sign-in or successful refresh.
    }
  }, [token, setUser]);
}
