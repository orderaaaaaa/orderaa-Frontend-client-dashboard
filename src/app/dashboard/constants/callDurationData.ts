import type { CallDurationItem } from '../types';

export const CALL_DURATIONS: CallDurationItem[] = [
  {
    key: 'confirmed',
    label: 'المكالمات المؤكده',
    value: '3 دقيقه',
  },
  {
    key: 'cancelled',
    label: 'المكالمات الملغاه',
    value: '3 دقيقه',
  },
  {
    key: 'followUp',
    label: 'المكالمات الخاصه بالمتابعة',
    value: '4 دقيقه',
  },
  {
    key: 'incomplete',
    label: 'المكالمات غير المكتمله',
    value: '1 دقيقه',
  },
];
