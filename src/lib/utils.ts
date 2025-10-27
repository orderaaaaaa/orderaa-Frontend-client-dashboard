import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { navigation } from '@/constants/Navbar';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBreadcrumb(pathname: string) {
  for (const item of navigation) {
    if (item.children) {
      const child = item.children.find((c) => pathname.startsWith(c.href));
      if (child) {
        return { parent: item.name, child: child.name };
      }
    }
    if (pathname === item.href) {
      return { parent: item.name, child: null as string | null };
    }
  }
  const parent = navigation.find((n) => pathname.startsWith(n.href));
  return {
    parent: parent?.name ?? 'لوحة التحكم',
    child: null as string | null,
  };
}
