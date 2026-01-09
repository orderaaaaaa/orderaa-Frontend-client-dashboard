// constants/stores/storesTable.ts

import { IStoreTableHeader } from '../types/stores';

export const STORES_TABLE_HEADERS: IStoreTableHeader[] = [
  { id: 1, key: 'storeName', label: 'اسم المتجر' },
  { id: 2, key: 'requestsCount', label: 'عدد الطلبات' },
  { id: 3, key: 'department', label: 'القسم' },
  { id: 4, key: 'sales', label: 'المبيعات' },
  { id: 5, key: 'revenue', label: 'الايرادات' },
  { id: 6, key: 'deliveryRate', label: 'نسبة التسليم' },
  { id: 7, key: 'dateAdded', label: 'تاريخ الاضافة' },
  { id: 8, key: 'profitDate', label: 'ارباح التاجر' },
  { id: 9, key: 'actions', label: 'اجراءات' },
];

// Sample data for stores
export const STORES_SAMPLE_DATA = [
  {
    id: 1,
    storeName: 'أحذية ماشي',
    requestsCount: 40,
    department: 'احذية',
    sales: '١٢,٨٥٠',
    revenue: '٨٥٠,٣٠٠ج.م',
    deliveryRate: '94%',
    dateAdded: 'فبراير٢٠٢٤',
    profitDate: '٨٥٠,٣٠٠ج.م',
    actions: '-',
    status: 'active' as const,
  },
  {
    id: 2,
    storeName: 'حقائب جلدية',
    requestsCount: 40,
    department: 'حقائب',
    sales: '١٠,٢٠٠',
    revenue: '٤٢٠,٠٠٠ج.م',
    deliveryRate: '87%',
    dateAdded: 'مارس ٢٠٢٤',
    profitDate: '٣٨٠,٠٠٠ج.م',
    actions: '-',
    status: 'active' as const,
  },
  {
    id: 3,
    storeName: 'ملابس رياضية',
    requestsCount: 40,
    department: 'ملابس',
    sales: '١٠,٥٠٠',
    revenue: '٢٠٣,٠٠٠ج.م',
    deliveryRate: '92%',
    dateAdded: 'أبريل ٢٠٢٤',
    profitDate: '٣٨٠,٠٠٠ج.م',
    actions: 'حظر',
    status: 'inactive' as const,
  },
  {
    id: 4,
    storeName: 'أحذية ماشي',
    requestsCount: 40,
    department: 'احذية',
    sales: '١٢,٨٥٠',
    revenue: '٨٥٠,٣٠٠ج.م',
    deliveryRate: '94%',
    dateAdded: 'فبراير٢٠٢٤',
    profitDate: '٨٥٠,٣٠٠ج.م',
    actions: 'حظر',
    status: 'inactive' as const,
  },
];
