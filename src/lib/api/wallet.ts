import http from './http';
import {
  WalletBalance,
  WalletTransaction,
  PaginatedResponse,
  WalletChargeOption,
  TopUpSession,
  BillingInfo,
} from '@/types/wallet';

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  type?: 'CREDIT' | 'DEBIT';
}

export interface TopUpPayload {
  chargeOptionId: number;
}

export const walletApi = {
  getBalance: () =>
    http.get<WalletBalance>('/wallet/balance').then((res) => res.data),

  getTransactions: (params?: GetTransactionsParams) =>
    http
      .get<PaginatedResponse<WalletTransaction>>('/wallet/transactions', { params })
      .then((res) => res.data),

  topUp: (payload: TopUpPayload) =>
    http.post<TopUpSession>('/wallet/topup', payload).then((res) => res.data),

  getBillingInfo: () =>
    http.get<BillingInfo>('/wallet/billing-info').then((res) => res.data),

  getChargeOptions: () =>
    http
      .get<WalletChargeOption[]>('/wallet/charge-options')
      .then((res) => res.data),
};
