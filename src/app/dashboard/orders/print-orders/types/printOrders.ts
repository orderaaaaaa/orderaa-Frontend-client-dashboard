import { FilterOrdersDto } from '@/types/orders';

export interface PrintOrderStatistics {
  confirmedOrders: number;
  ordersToDeliver: number;
  rejectedOrders: number;
  remainingOrders: number;
}

export interface PrintOrderStatisticsResponse {
  success: boolean;
  data: PrintOrderStatistics;
}

export interface PrintOrderFilters extends FilterOrdersDto {
  printStatus?: 'printed' | 'not_printed' | null;
}

export type PrintStatus = 'printed' | 'not_printed' | null;
