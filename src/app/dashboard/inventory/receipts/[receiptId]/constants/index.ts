import { ReceiptProduct, ProductVariant } from '../types';

export const RECEIPT_STEPS = [
  { label: 'إضافة المتغيرات' },
  { label: 'الطباعة' },
  { label: 'تأكيد العدد' },
  { label: 'الرفض' },
];

export const MOCK_RECEIPT_PRODUCTS: ReceiptProduct[] = [
  {
    id: 1,
    name: 'نعال Zara RTxfoam كلاسيك',
    image: 'https://placehold.co/60x60/e8d5b7/333?text=RTxfoam',
    itemsCount: 120,
    variantsCount: 0,
  },
  {
    id: 2,
    name: 'حذاء Nike Air Max 90',
    image: 'https://placehold.co/60x60/c4e0f9/333?text=AirMax',
    itemsCount: 80,
    variantsCount: 0,
  },
  {
    id: 3,
    name: 'صندل Adidas Comfort Slide',
    image: 'https://placehold.co/60x60/d4edda/333?text=Adidas',
    itemsCount: 200,
    variantsCount: 0,
  },
];

export const MOCK_PRODUCT_VARIANTS: ProductVariant[] = [
  {
    id: 1,
    name: 'RTxfoam كلاسيك',
    image: 'https://placehold.co/60x60/e8d5b7/333?text=V1',
    colors: ['اسود', 'بيج', 'رمادي'],
    sizes: ['40', '41', '42', '43', '44', '45'],
  },
  {
    id: 2,
    name: 'RTxfoam سبورت',
    image: 'https://placehold.co/60x60/e8d5b7/333?text=V2',
    colors: ['ابيض', 'كحلي'],
    sizes: ['41', '42', '43', '44'],
  },
  {
    id: 3,
    name: 'Air Max 90 اساسي',
    image: 'https://placehold.co/60x60/c4e0f9/333?text=AM1',
    colors: ['اسود', 'ابيض', 'احمر'],
    sizes: ['39', '40', '41', '42', '43'],
  },
  {
    id: 4,
    name: 'Air Max 90 برو',
    image: 'https://placehold.co/60x60/c4e0f9/333?text=AM2',
    colors: ['رمادي', 'اخضر'],
    sizes: ['40', '41', '42', '43', '44'],
  },
  {
    id: 5,
    name: 'Comfort Slide اصلي',
    image: 'https://placehold.co/60x60/d4edda/333?text=CS1',
    colors: ['اسود', 'ابيض', 'بيج', 'زيتي'],
    sizes: ['38', '39', '40', '41', '42'],
  },
  {
    id: 6,
    name: 'Comfort Slide بريميوم',
    image: 'https://placehold.co/60x60/d4edda/333?text=CS2',
    colors: ['بني', 'كحلي', 'رمادي'],
    sizes: ['40', '41', '42', '43'],
  },
];

export const MOCK_PRODUCT_VARIANT_MAP: Record<number, number[]> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
};
