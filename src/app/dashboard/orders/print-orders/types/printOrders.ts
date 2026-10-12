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

export type PrintSkipReason =
  | 'PRINTED'
  | 'PARKED'
  | 'NOT_CONFIRMED'
  | 'CLAIMED_BY_OTHER'
  | 'NOT_FOUND';

export interface PrintSkippedOrder {
  id: number;
  reason: PrintSkipReason;
  message: string;
}

export interface ClaimNextPrintOrdersResponse {
  claimed: Order[];
}

export interface ClaimPrintOrdersResponse {
  claimed: Order[];
  skipped: PrintSkippedOrder[];
}

export interface ReleasePrintClaimsResponse {
  released: number;
}

export interface MarkOrdersPrintedRequest {
  ordersIds: number[];
  printTimes?: number;
}

export interface MarkOrdersPrintedResponse {
  success: boolean;
  printedCount: number;
  orders: Order[];
  skippedIds: number[];
}

export interface ReprintOrdersResponse {
  success: boolean;
  reprintedCount: number;
  skippedIds: number[];
}

export interface PrintJob {
  claimedIds: number[];
  markIds: number[];
  reprintIds: number[];
}

export interface ConfirmPrintedRequest {
  markIds: number[];
  reprintIds: number[];
  printTimes: number;
}

export interface ConfirmPrintedResult {
  printedCount: number;
  reprintedCount: number;
  skippedIds: number[];
  reprintError?: unknown;
}

export interface PrepareOrdersRequest {
  orderCodes: string[];
}

export interface PrepareOrdersResponse {
  success: boolean;
  preparedCount: number;
  preparedOrderIds: number[];
}

export interface WaitingForPackagingRequest {
  orderIds: number[];
}

export interface WaitingForPackagingResponse {
  success: boolean;
  movedCount: number;
  movedOrderIds: number[];
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
  movedCount: number;
  movedOrderIds: number[];
}
