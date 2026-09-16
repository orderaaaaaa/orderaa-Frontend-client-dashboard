import type { NavigationItem } from '@/constants/Navbar';

export function collectLeafHrefs(items: NavigationItem[]): string[] {
  return items.flatMap((item) =>
    item.children ? collectLeafHrefs(item.children) : [item.href],
  );
}

export function findActiveHref(
  items: NavigationItem[],
  pathname: string,
): string | null {
  const leafHrefs = collectLeafHrefs(items);
  let best: string | null = null;

  for (const href of leafHrefs) {
    const isExact = pathname === href;
    const isPrefix =
      href.split('/').filter(Boolean).length >= 2 &&
      pathname.startsWith(href + '/');

    if (!isExact && !isPrefix) continue;
    if (best === null || href.length > best.length) {
      best = href;
    }
  }

  return best;
}

export function containsHref(
  item: NavigationItem,
  href: string | null,
): boolean {
  if (href === null) return false;
  if (!item.children) return item.href === href;
  return item.children.some((child) => containsHref(child, href));
}
