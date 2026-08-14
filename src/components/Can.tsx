'use client';

import type { ReactNode } from 'react';
import { usePermissionCheck } from '@/hooks/usePermissions';
import type { PermissionCode } from '@/lib/permissions';

interface CanProps {
  /** Single required permission code, e.g. `roles:assign`. */
  code?: PermissionCode;
  /** Renders when the user holds **at least one** of these codes. */
  anyOf?: PermissionCode[];
  /** Renders when the user holds **all** of these codes. */
  allOf?: PermissionCode[];
  /** Rendered instead of `children` when the check fails. Defaults to nothing. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Permission gate for UI built on the ABAC model.
 *
 * ```tsx
 * <Can code="roles:create">
 *   <Button onClick={openCreate}>إضافة دور</Button>
 * </Can>
 * ```
 *
 * Client-side gating is a UX affordance only — the backend `PermissionGuard`
 * is the authority. Never rely on `<Can />` to protect data.
 *
 * With no prop given the children always render, so it is safe to spread a
 * possibly-undefined code into it.
 */
export function Can({ code, anyOf, allOf, fallback = null, children }: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissionCheck();

  const allowed =
    (code === undefined || hasPermission(code)) &&
    (anyOf === undefined || anyOf.length === 0 || hasAnyPermission(anyOf)) &&
    (allOf === undefined || allOf.length === 0 || hasAllPermissions(allOf));

  return <>{allowed ? children : fallback}</>;
}

export default Can;
