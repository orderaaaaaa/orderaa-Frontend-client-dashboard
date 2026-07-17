import api from './index';

export interface SettlementRow {
  orderCode?: string;
  shippingCompanyCode?: string;
  settlementAmount: number;
  targetStatus: 'COLLECTED' | 'RETURNED_SETTLED';
}

export interface UploadSettlementResponse {
  success: string[];
  failed: { row: number; reason: string }[];
}

export interface ShortfallSettlement {
  id: number;
  code: string;
  settlementAmount: string;
  status: string;
  settlementResolved: boolean;
}

export interface AdjustSettlementPayload {
  orderId: number;
  amount: number;
}

export async function uploadSettlementRows(
  rows: SettlementRow[],
): Promise<UploadSettlementResponse> {
  const { data } = await api.post<UploadSettlementResponse>(
    '/orders/settlement/upload',
    { rows },
  );
  return data;
}

export async function getShortfallSettlements(
  filter: 'pending' | 'finished' | 'all',
): Promise<ShortfallSettlement[]> {
  const { data } = await api.get<ShortfallSettlement[]>(
    '/orders/settlement/shortfall',
    { params: { filter } },
  );
  return data;
}

export async function adjustSettlement(
  orderId: number,
  amount: number,
): Promise<void> {
  await api.patch(`/orders/settlement/${orderId}/adjust`, { amount });
}
