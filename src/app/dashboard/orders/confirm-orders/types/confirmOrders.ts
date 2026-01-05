import { FilterOrdersDto } from '@/types/orders';

export interface ConfirmOrderStatistics {
  confirmedOrders: number;
  ordersToDeliver: number;
  rejectedOrders: number;
  remainingOrders: number;
}

export interface ConfirmOrderStatisticsResponse {
  success: boolean;
  data: ConfirmOrderStatistics;
}

export interface ConfirmOrderFilters extends FilterOrdersDto {
  printStatus?: 'printed' | 'not_printed' | null;
}

export type PrintStatus = 'printed' | 'not_printed' | null;
