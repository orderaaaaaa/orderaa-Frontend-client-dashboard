'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Department } from '@/types';

export function useDepartment(): Department | null {
  const pathname = usePathname();

  return useMemo(() => {
    if (!pathname) return null;

    if (pathname.includes('call-center')) {
      return Department.CALL_CENTER;
    }

    if (pathname.includes('print-orders')) {
      return Department.PACKAGING;
    }

    if (pathname.includes('shipping-orders')) {
      return Department.SHIPPING;
    }

    return null;
  }, [pathname]);
}
