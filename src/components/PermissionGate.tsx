'use client';

import type React from 'react';
import { usePermission } from '@/hooks/usePermission';
import type { Permission } from '@/types/auth';
import { Role, EmployeeAccessLevel } from '@/types/auth';

interface PermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  permission?: Permission;
  minRole?: Role;
  minAccessLevel?: EmployeeAccessLevel;
}

export function PermissionGate({
  children,
  fallback = null,
  permission,
  minRole,
  minAccessLevel,
}: PermissionGateProps) {
  const { checkPermission, isAtLeastRole, isAtLeastAccessLevel } =
    usePermission();

  let hasAccess = true;

  if (permission) {
    hasAccess = checkPermission(permission);
  } else if (minRole || minAccessLevel) {
    if (minRole) {
      hasAccess = isAtLeastRole(minRole);
    }
    if (hasAccess && minAccessLevel) {
      hasAccess = isAtLeastAccessLevel(minAccessLevel);
    }
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
