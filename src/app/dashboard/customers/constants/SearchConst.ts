import type { CustomerBadge } from '../types/customer';

export const clientStatusOptions = [
  { key: '', value: 'جميع الحالات' },
  { key: 'active', value: 'نشط' },
  { key: 'frozen', value: 'محظور' },
];

export const CUSTOMER_BADGE_PRIORITY: readonly CustomerBadge[] = [
  'ghost',
  'window',
  'high',
  'bulk',
  'loyal',
];

export const CUSTOMER_BADGE_DISPLAY_ORDER: readonly CustomerBadge[] = [
  'loyal',
  'bulk',
  'high',
  'ghost',
  'window',
];

export const CUSTOMER_BADGE_LABELS: Record<CustomerBadge, string> = {
  loyal: 'عميل وفي',
  bulk: 'مشتري بالجملة',
  ghost: 'عميل شبح',
  window: 'عميل متفرج',
  high: 'قيمة عالية',
};

export const NO_BADGE_LABEL = 'بدون شارة';

export const PREMIUM_LABEL = 'المميزين';

export const buildBadgeFilterOptions = (enabled: readonly CustomerBadge[]) => [
  ...CUSTOMER_BADGE_DISPLAY_ORDER.filter((badge) => enabled.includes(badge)).map(
    (badge) => ({ key: badge, value: CUSTOMER_BADGE_LABELS[badge] })
  ),
  { key: 'none', value: NO_BADGE_LABEL },
];

export const segmentOptions = [
  { key: 'all', value: 'جميع العملاء' },
  { key: 'premium', value: 'المميزين فقط' },
];
