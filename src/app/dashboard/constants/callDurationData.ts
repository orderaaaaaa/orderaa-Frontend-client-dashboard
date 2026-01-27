import type { CallDurationItem } from '../types';

export const CALL_DURATIONS: CallDurationItem[] = [
  {
    key: 'confirmed',
    label: 'المكالمات المؤكده',
    value: '3 دقيقه',
    chartCategories: ['02:55:00', '03:00:00', '03:05:00', '03:10:00'],
    chartSeries: [
      { name: 'series1', data: [40, 42, 43, 45] },
      { name: 'series2', data: [35, 38, 40, 42] },
    ],
  },
  {
    key: 'cancelled',
    label: 'المكالمات الملغاه',
    value: '3 دقيقه',
    chartCategories: ['02:55:00', '03:00:00', '03:05:00', '03:10:00'],
    chartSeries: [
      { name: 'series1', data: [45, 44, 42, 40] },
      { name: 'series2', data: [42, 43, 44, 45] },
    ],
  },
  {
    key: 'followUp',
    label: 'المكالمات الخاصه بالمتابعة',
    value: '4 دقيقه',
    chartCategories: ['02:55:00', '03:00:00', '03:05:00', '03:10:00'],
    chartSeries: [
      { name: 'series1', data: [30, 35, 38, 42] },
      { name: 'series2', data: [28, 30, 32, 35] },
    ],
  },
  {
    key: 'incomplete',
    label: 'المكالمات غير المكتمله',
    value: '1 دقيقه',
    chartCategories: ['02:55:00', '03:00:00', '03:05:00', '03:10:00'],
    chartSeries: [
      { name: 'series1', data: [38, 40, 42, 45] },
      { name: 'series2', data: [35, 37, 39, 41] },
    ],
  },
];
