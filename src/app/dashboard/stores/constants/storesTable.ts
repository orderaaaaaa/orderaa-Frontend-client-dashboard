// constants/stores/storesTable.ts

import { IStoreTableHeader } from '../types/stores';

export const STORES_TABLE_HEADERS: IStoreTableHeader[] = [
  { id: 1, key: 'storeName', label: 'Store Name' },
  { id: 2, key: 'requestsCount', label: 'Orders Count' },
  { id: 3, key: 'department', label: 'Department' },
  { id: 4, key: 'sales', label: 'Sales' },
  { id: 5, key: 'revenue', label: 'Revenue' },
  { id: 6, key: 'deliveryRate', label: 'Delivery Rate' },
  { id: 7, key: 'dateAdded', label: 'Date Added' },
  { id: 8, key: 'profitDate', label: 'Merchant Profit' },
  { id: 9, key: 'actions', label: 'Actions' },
];

// Sample data for stores
export const STORES_SAMPLE_DATA = [
  {
    id: 1,
    storeName: 'Mashi Shoes',
    requestsCount: 40,
    department: 'Shoes',
    sales: '12,850',
    revenue: '850,300 جنية',
    deliveryRate: '94%',
    dateAdded: 'فبراير 2024',
    profitDate: '850,300 جنية',
    actions: '-',
    status: 'active' as const,
  },
  {
    id: 2,
    storeName: 'Leather Bags',
    requestsCount: 40,
    department: 'Bags',
    sales: '10,200',
    revenue: '420,000 جنية',
    deliveryRate: '87%',
    dateAdded: 'مارس 2024',
    profitDate: '380,000 جنية',
    actions: '-',
    status: 'active' as const,
  },
  {
    id: 3,
    storeName: 'Sportswear',
    requestsCount: 40,
    department: 'Clothing',
    sales: '10,500',
    revenue: '203,000 جنية',
    deliveryRate: '92%',
    dateAdded: 'أبريل 2024',
    profitDate: '380,000 جنية',
    actions: 'Ban',
    status: 'inactive' as const,
  },
  {
    id: 4,
    storeName: 'Mashi Shoes',
    requestsCount: 40,
    department: 'Shoes',
    sales: '12,850',
    revenue: '850,300 جنية',
    deliveryRate: '94%',
    dateAdded: 'فبراير 2024',
    profitDate: '850,300 جنية',
    actions: 'Ban',
    status: 'inactive' as const,
  },
];
