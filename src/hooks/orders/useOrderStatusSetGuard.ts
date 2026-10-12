'use client';

import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { orderStatusSetCodeOf } from '@/lib/permissions';

export function useOrderStatusSetGuard() {
  const { hasPermission } = usePermissionCheck();

  return useCallback(
    (status: string, label: string) => {
      const code = orderStatusSetCodeOf(status);
      if (code && hasPermission(code)) return true;
      toast.error(`ليس لديك صلاحية نقل الطلبات إلى «${label}»`);
      return false;
    },
    [hasPermission]
  );
}
