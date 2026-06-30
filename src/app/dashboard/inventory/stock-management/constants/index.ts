import type { StockProduct, StockStatus } from '../types';

export const STOCK_STATUS_CONFIG: Record<
  StockStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  high: {
    label: 'مرتفع',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    dotColor: 'bg-emerald-500',
  },
  medium: {
    label: 'متوسط',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    dotColor: 'bg-amber-500',
  },
  low: {
    label: 'منخفض',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    dotColor: 'bg-red-500',
  },
  out_of_stock: {
    label: 'غير متوفر',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    dotColor: 'bg-red-500',
  },
};

function generateVariants(
  sizes: string[],
  colors: string[],
  getStock: (size: string, color: string) => { quantity: number; status: StockStatus }
) {
  return sizes.map((size) => ({
    size,
    stocks: Object.fromEntries(
      colors.map((color) => [color, getStock(size, color)])
    ),
  }));
}

export const MOCK_PRODUCTS: StockProduct[] = [
  {
    id: 1,
    name: 'حذاء اديداس كلاسيك',
    sku: 'ADI-FTW-01',
    image: '/placeholder-shoe.png',
    colors: ['اسود', 'احمر', 'الزق'],
    sizes: ['41', '42', '43', '44', '45'],
    variants: generateVariants(
      ['41', '42', '43', '44', '45'],
      ['اسود', 'احمر', 'الزق'],
      (size, color) => {
        if (size === '42' && color === 'الزق') return { quantity: 0, status: 'out_of_stock' };
        if (size === '44' && color === 'اسود') return { quantity: 5, status: 'medium' };
        if (size === '44' && color === 'احمر') return { quantity: 5, status: 'low' };
        if (size === '45' && color === 'احمر') return { quantity: 0, status: 'out_of_stock' };
        return { quantity: 5, status: 'high' };
      }
    ),
  },
  {
    id: 2,
    name: 'حذاء نايك اير ماكس',
    sku: 'NIK-AM-02',
    image: '/placeholder-shoe.png',
    colors: ['ابيض', 'اسود', 'رمادي'],
    sizes: ['39', '40', '41', '42', '43'],
    variants: generateVariants(
      ['39', '40', '41', '42', '43'],
      ['ابيض', 'اسود', 'رمادي'],
      (size, color) => {
        if (size === '39' && color === 'رمادي') return { quantity: 2, status: 'low' };
        if (size === '43' && color === 'ابيض') return { quantity: 0, status: 'out_of_stock' };
        return { quantity: 8, status: 'high' };
      }
    ),
  },
];

export const MOCK_ALL_COLORS = [
  { key: 'اسود', value: 'اسود' },
  { key: 'احمر', value: 'احمر' },
  { key: 'الزق', value: 'الزق' },
  { key: 'ابيض', value: 'ابيض' },
  { key: 'رمادي', value: 'رمادي' },
];

export const MOCK_ALL_SIZES = [
  { key: '39', value: '39' },
  { key: '40', value: '40' },
  { key: '41', value: '41' },
  { key: '42', value: '42' },
  { key: '43', value: '43' },
  { key: '44', value: '44' },
  { key: '45', value: '45' },
];

export const LOW_STOCK_THRESHOLD = 10;

export const LOCATION_TYPE_OPTIONS = [
  { key: '', value: 'الكل (المخزون المتاح)' },
  { key: 'AVAILABLE', value: 'المخزون المتاح' },
  { key: 'RESERVED', value: 'المخزون المحجوز' },
  { key: 'PROCESSING', value: 'قيد التجهيز' },
  { key: 'DELIVERED', value: 'تم التوصيل' },
  { key: 'RETURNED_WITH_COMPANY', value: 'مرتجع لدى الشركة' },
  { key: 'DAMAGED', value: 'تالف' },
];
