'use client';

import { useMemo } from 'react';
import { navigation } from '@/constants/Navbar';
import type { NavigationItem } from '@/constants/Navbar';
import { usePermission } from './usePermission';
import { DEFAULT_PERMISSION } from '@/constants/permissions';

export function useFilteredNavigation(): NavigationItem[] {
  const { checkPermission } = usePermission();

  return useMemo(() => {
    return navigation.reduce<NavigationItem[]>((acc, item) => {
      const itemPermission = item.permission ?? DEFAULT_PERMISSION;

      if (!checkPermission(itemPermission)) return acc;

      if (item.children) {
        const filteredChildren = item.children.filter((child) => {
          const childPermission = child.permission ?? itemPermission;
          return checkPermission(childPermission);
        });

        if (filteredChildren.length === 0) return acc;

        acc.push({ ...item, children: filteredChildren });
      } else {
        acc.push(item);
      }

      return acc;
    }, []);
  }, [checkPermission]);
}
