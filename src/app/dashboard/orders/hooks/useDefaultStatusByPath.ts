'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { StatusTypes } from '../types/StatusTypes';
export function useDefaultStatusByPath(): StatusTypes {
  const pathname = usePathname();

  return useMemo<StatusTypes>(() => {
    if (!pathname) return null;

    switch (true) {
      case pathname.includes('print-orders'):
        return 'CONFIRMED';

      case pathname.includes('shipping-orders'):
        return 'PREPARED';

      case pathname.includes('call-center'):
        return 'NEW_ORDER';

      default:
        return null;
    }
  }, [pathname]);
}
