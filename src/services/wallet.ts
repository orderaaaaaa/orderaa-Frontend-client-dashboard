import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { walletApi, GetTransactionsParams } from '@/lib/api/wallet';
import {
  BillingInfo,
  WalletTransaction,
  PaginatedResponse,
  WalletChargeOption,
} from '@/types/wallet';

// Fetch billing info (balance + subscription + order capacity)
export const useBillingInfo = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.BILLING_INFO] as QueryKey,
    queryFn: async () => {
      return walletApi.getBillingInfo();
    },
    staleTime: 30 * 1000, // 30 seconds — balance changes matter
  });
};

// Fetch wallet transactions with pagination
export const useWalletTransactions = (params?: GetTransactionsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WALLET_TRANSACTIONS, params] as QueryKey,
    queryFn: async () => {
      return walletApi.getTransactions(params);
    },
  });
};

// Fetch charge options for top-up modal
export const useChargeOptions = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.WALLET_CHARGE_OPTIONS] as QueryKey,
    queryFn: async () => {
      return walletApi.getChargeOptions();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — rarely changes
  });
};

// Create top-up session and get Kashier payment URL
export const useTopUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chargeOptionId: number) => {
      const response = await walletApi.topUp({ chargeOptionId });
      return response;
    },
    onSuccess: () => {
      // Invalidate balance + billing info — will refetch after payment completes
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BILLING_INFO],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.WALLET_BALANCE],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.WALLET_TRANSACTIONS],
      });
    },
  });
};
