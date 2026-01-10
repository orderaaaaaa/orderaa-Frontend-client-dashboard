import { FilterOrdersDto } from '@/types/orders';

export interface PrintOrderStatistics {
  totalConfirmedOrders: number;
  confirmedNotPrintedOrders: number;
  confirmedPrintedOrders: number;
  totalPreparedOrders: number;
}

export interface PrintOrderStatisticsResponse {
  success: boolean;
  data: PrintOrderStatistics;
}

export interface PrintOrderFilters extends FilterOrdersDto {
  printStatus?: 'printed' | 'not_printed' | null;
}

export type PrintStatus = 'printed' | 'not_printed' | null;
