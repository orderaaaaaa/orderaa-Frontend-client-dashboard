import type {
  PermissionCatalogEntry,
  PermissionCatalogGroup,
} from '@/lib/api/authorization';
import {
  isOrderStatusReadCode,
  isOrderStatusSetCode,
  orderStatusFromCode,
} from '@/lib/permissions';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';

/**
 * A renderable block of the permission form. The backend groups the catalog by
 * domain only, which puts all 16 order actions *and* the 24+24 order-status
 * codes into a single `orders` group — 64 flat checkboxes. We keep the server's
 * grouping but split that group into three sections so the status windows can
 * render as compact status grids instead.
 */
export interface PermissionSection {
  /** Stable key for React + select-all state. */
  key: string;
  title: string;
  description?: string;
  entries: PermissionCatalogEntry[];
  /** Status grids render one short chip per status; action lists render labels. */
  variant: 'list' | 'statusGrid';
}

export const ORDERS_DOMAIN = 'orders';

export const SECTION_KEYS = {
  ORDER_STATUS_READ: 'orders:__status_read',
  ORDER_STATUS_SET: 'orders:__status_set',
} as const;

/** Short Arabic status name for the compact grids, falling back to the raw enum. */
export const orderStatusLabel = (code: string): string => {
  const status = orderStatusFromCode(code);
  return ORDER_STATUS_ARABIC_LABELS[status] ?? status;
};

/**
 * Flattens the server catalog into the sections the form renders, in catalog
 * order. Unknown future domains fall through as plain lists automatically.
 */
export function buildPermissionSections(
  groups: PermissionCatalogGroup[]
): PermissionSection[] {
  const sections: PermissionSection[] = [];

  for (const group of groups) {
    if (group.domain !== ORDERS_DOMAIN) {
      sections.push({
        key: group.domain,
        title: group.label,
        entries: group.permissions,
        variant: 'list',
      });
      continue;
    }

    const actions = group.permissions.filter(
      (entry) =>
        !isOrderStatusReadCode(entry.code) && !isOrderStatusSetCode(entry.code)
    );
    const statusRead = group.permissions.filter((entry) =>
      isOrderStatusReadCode(entry.code)
    );
    const statusSet = group.permissions.filter((entry) =>
      isOrderStatusSetCode(entry.code)
    );

    if (actions.length) {
      sections.push({
        key: group.domain,
        title: group.label,
        entries: actions,
        variant: 'list',
      });
    }

    if (statusRead.length) {
      sections.push({
        key: SECTION_KEYS.ORDER_STATUS_READ,
        title: 'عرض وتعديل الحالات',
        description:
          'الحالات التي يظهر فيها الطلب لصاحب هذا الدور ويمكنه العمل عليها.',
        entries: statusRead,
        variant: 'statusGrid',
      });
    }

    if (statusSet.length) {
      sections.push({
        key: SECTION_KEYS.ORDER_STATUS_SET,
        title: 'تغيير الحالة إلى',
        description: 'الحالات التي يستطيع صاحب هذا الدور نقل الطلب إليها.',
        entries: statusSet,
        variant: 'statusGrid',
      });
    }
  }

  return sections;
}

/** Count of codes in `selected` that belong to `section`. */
export const countSelectedInSection = (
  section: PermissionSection,
  selected: Set<string>
): number => section.entries.filter((entry) => selected.has(entry.code)).length;
