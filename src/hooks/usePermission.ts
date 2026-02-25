'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  Role,
  EmployeeAccessLevel,
  hasPermission,
} from '@/types/auth';
import type { Permission } from '@/types/auth';
import { getPermissionForRoute } from '@/constants/permissions';

export function usePermission() {
  const rawRole = useAuthStore((state) => state.user?.role);
  const rawAccessLevel = useAuthStore((state) => state.user?.accessLevel);

  const role = Object.values(Role).includes(rawRole as Role)
    ? (rawRole as Role)
    : undefined;
  const accessLevel =
    rawAccessLevel &&
    Object.values(EmployeeAccessLevel).includes(
      rawAccessLevel as EmployeeAccessLevel
    )
      ? (rawAccessLevel as EmployeeAccessLevel)
      : undefined;

  const checkPermission = useCallback(
    (required: Permission): boolean => {
      return hasPermission(role, accessLevel, required);
    },
    [role, accessLevel]
  );

  const checkRouteAccess = useCallback(
    (pathname: string): boolean => {
      const required = getPermissionForRoute(pathname);
      return hasPermission(role, accessLevel, required);
    },
    [role, accessLevel]
  );

  const isAtLeastRole = useCallback(
    (minRole: Role): boolean => {
      return hasPermission(role, accessLevel, { minRole });
    },
    [role, accessLevel]
  );

  const isAtLeastAccessLevel = useCallback(
    (level: EmployeeAccessLevel): boolean => {
      return hasPermission(role, accessLevel, {
        minRole: Role.USER,
        minAccessLevel: level,
      });
    },
    [role, accessLevel]
  );

  return {
    checkPermission,
    checkRouteAccess,
    isAtLeastRole,
    isAtLeastAccessLevel,
    userRole: role,
    userAccessLevel: accessLevel,
  };
}
