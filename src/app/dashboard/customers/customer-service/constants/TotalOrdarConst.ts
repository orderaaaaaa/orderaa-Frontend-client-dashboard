import { DataPoint, RangeType } from '../types';

export const rangeOptions = [
  { key: 'day', value: 'يوم' },
  { key: 'week', value: 'أسبوع' },
  { key: 'month', value: 'الشهور' },
  { key: 'year', value: 'سنة' },
];

export const datasets: Record<RangeType, DataPoint[]> = {
  day: [
    { label: 'الإثنين', value1: 260, value2: 180, value3: 90 },
    { label: 'الثلاثاء', value1: 240, value2: 160, value3: 80 },
    { label: 'الأربعاء', value1: 280, value2: 200, value3: 100 },
    { label: 'الخميس', value1: 270, value2: 190, value3: 70 },
    { label: 'الجمعة', value1: 300, value2: 210, value3: 120 },
    { label: 'السبت', value1: 250, value2: 170, value3: 100 },
    { label: 'الأحد', value1: 260, value2: 180, value3: 90 },
  ],
  week: [
    { label: 'الأسبوع 1', value1: 280, value2: 190, value3: 90 },
    { label: 'الأسبوع 2', value1: 270, value2: 180, value3: 100 },
    { label: 'الأسبوع 3', value1: 290, value2: 200, value3: 110 },
    { label: 'الأسبوع 4', value1: 260, value2: 170, value3: 80 },
  ],
  month: [
    { label: 'يناير', value1: 130, value2: 60, value3: 30 },
    { label: 'فبراير', value1: 250, value2: 170, value3: 30 },
    { label: 'مارس', value1: 280, value2: 200, value3: 30 },
    { label: 'أبريل', value1: 300, value2: 220, value3: 150 },
    { label: 'مايو', value1: 260, value2: 190, value3: 80 },
    { label: 'يونيو', value1: 240, value2: 160, value3: 70 },
    { label: 'يوليو', value1: 230, value2: 150, value3: 60 },
    { label: 'أغسطس', value1: 220, value2: 140, value3: 50 },
    { label: 'سبتمبر', value1: 200, value2: 130, value3: 40 },
    { label: 'أكتوبر', value1: 180, value2: 120, value3: 30 },
    { label: 'نوفمبر', value1: 160, value2: 100, value3: 20 },
    { label: 'ديسمبر', value1: 140, value2: 90, value3: 10 },
  ],
  year: [
    { label: '2020', value1: 250, value2: 160, value3: 80 },
    { label: '2021', value1: 270, value2: 180, value3: 90 },
    { label: '2022', value1: 290, value2: 200, value3: 100 },
    { label: '2023', value1: 260, value2: 170, value3: 70 },
    { label: '2024', value1: 280, value2: 190, value3: 80 },
  ],
};
