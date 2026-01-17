import { FilterOrdersDto, Order } from '@/types/orders';

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

export interface PrintOrdersResponse {
  success: boolean;
  printedCount: number;
  orders: Order[];
}

export interface MarkOrdersPrintedRequest {
  ordersIds: number[];
  isPrinted: boolean;
}

export interface MarkOrdersPrintedResponse {
  updatedCount: number;
  message: string;
}

export interface PrepareOrdersRequest {
  orderCodes: string[];
}

export interface PrepareOrdersResponse {
  success: boolean;
  message: string;
}

export interface WaitingForPackagingRequest {
  orderIds: number[];
}

export interface WaitingForPackagingResponse {
  success: boolean;
  message: string;
}

export interface CallAgainOrder {
  id: number;
  packagingNote?: string;
}

export interface CallAgainRequest {
  orders: CallAgainOrder[];
}

export interface CallAgainResponse {
  success: boolean;
  message: string;
}
