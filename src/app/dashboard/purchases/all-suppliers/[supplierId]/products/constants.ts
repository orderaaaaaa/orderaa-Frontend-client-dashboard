import { SupplierProduct, ProductTransaction } from './types';

export const DEFAULT_PAGE_SIZE = 10;

export const MOCK_SUPPLIER_PRODUCTS: SupplierProduct[] = [
  {
    id: 1,
    name: 'Zara RTxfoam',
    image: '/placeholder-product.png',
    purchasedQuantity: 50,
    totalPurchase: 12000,
    totalReturned: 2000,
    totalNet: 10000,
  },
  {
    id: 2,
    name: 'Nike Air Max',
    image: '/placeholder-product.png',
    purchasedQuantity: 120,
    totalPurchase: 36000,
    totalReturned: 6000,
    totalNet: 30000,
  },
  {
    id: 3,
    name: 'Adidas Ultra Boost',
    image: '/placeholder-product.png',
    purchasedQuantity: 30,
    totalPurchase: 9000,
    totalReturned: 1500,
    totalNet: 7500,
  },
  {
    id: 4,
    name: 'Puma Suede Classic',
    image: '/placeholder-product.png',
    purchasedQuantity: 85,
    totalPurchase: 21250,
    totalReturned: 4250,
    totalNet: 17000,
  },
  {
    id: 5,
    name: 'New Balance 574',
    image: '/placeholder-product.png',
    purchasedQuantity: 200,
    totalPurchase: 50000,
    totalReturned: 10000,
    totalNet: 40000,
  },
  {
    id: 6,
    name: 'Reebok Classic',
    image: '/placeholder-product.png',
    purchasedQuantity: 15,
    totalPurchase: 3750,
    totalReturned: 750,
    totalNet: 3000,
  },
  {
    id: 7,
    name: 'Converse All Star',
    image: '/placeholder-product.png',
    purchasedQuantity: 70,
    totalPurchase: 14000,
    totalReturned: 0,
    totalNet: 14000,
  },
];

export const MOCK_PRODUCT_TRANSACTIONS: Record<number, ProductTransaction[]> = {
  1: [
    { id: 1, date: '2026-02-10T14:30:00', quantity: 50, totalPrice: 5000, type: 'purchase' },
    { id: 2, date: '2026-02-10T14:30:00', quantity: 50, totalPrice: 5000, type: 'purchase' },
    { id: 3, date: '2026-02-10T14:30:00', quantity: 50, totalPrice: 5000, type: 'return' },
    { id: 4, date: '2026-02-10T14:30:00', quantity: 50, totalPrice: 5000, type: 'return' },
  ],
  2: [
    { id: 5, date: '2026-01-15T10:00:00', quantity: 80, totalPrice: 24000, type: 'purchase' },
    { id: 6, date: '2026-02-01T09:00:00', quantity: 40, totalPrice: 12000, type: 'purchase' },
    { id: 7, date: '2026-02-20T11:30:00', quantity: 20, totalPrice: 6000, type: 'return' },
  ],
  3: [
    { id: 8, date: '2026-02-05T16:00:00', quantity: 30, totalPrice: 9000, type: 'purchase' },
    { id: 9, date: '2026-02-25T13:00:00', quantity: 5, totalPrice: 1500, type: 'return' },
  ],
  4: [
    { id: 10, date: '2026-01-20T08:30:00', quantity: 50, totalPrice: 12500, type: 'purchase' },
    { id: 11, date: '2026-02-08T15:00:00', quantity: 35, totalPrice: 8750, type: 'purchase' },
    { id: 12, date: '2026-02-18T10:45:00', quantity: 17, totalPrice: 4250, type: 'return' },
  ],
  5: [
    { id: 13, date: '2026-01-05T12:00:00', quantity: 100, totalPrice: 25000, type: 'purchase' },
    { id: 14, date: '2026-01-25T14:00:00', quantity: 100, totalPrice: 25000, type: 'purchase' },
    { id: 15, date: '2026-02-15T09:30:00', quantity: 40, totalPrice: 10000, type: 'return' },
  ],
  6: [
    { id: 16, date: '2026-02-12T11:00:00', quantity: 15, totalPrice: 3750, type: 'purchase' },
    { id: 17, date: '2026-02-28T16:30:00', quantity: 3, totalPrice: 750, type: 'return' },
  ],
  7: [
    { id: 18, date: '2026-01-10T10:00:00', quantity: 40, totalPrice: 8000, type: 'purchase' },
    { id: 19, date: '2026-02-03T13:15:00', quantity: 30, totalPrice: 6000, type: 'purchase' },
  ],
};
