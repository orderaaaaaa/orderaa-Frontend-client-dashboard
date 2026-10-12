import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { Plan, ActiveSubscription, SubscribeResponse } from '@/types/wallet';

// Fetch all active plans
export const usePlans = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PLANS] as QueryKey,
    queryFn: async () => {
      return subscriptionsApi.getPlans();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes — plans rarely change
  });
};

// Fetch active subscription
export const useActiveSubscription = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ACTIVE_SUBSCRIPTION] as QueryKey,
    queryFn: async () => {
      return subscriptionsApi.getActiveSubscription();
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Subscribe to a plan
export const useSubscribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: number) => {
      return subscriptionsApi.subscribe({ planId });
    },
    onSuccess: () =>
      invalidateAndWait(queryClient, [
        [QUERY_KEYS.ACTIVE_SUBSCRIPTION],
        [QUERY_KEYS.BILLING_INFO],
        [QUERY_KEYS.WALLET_BALANCE],
        [QUERY_KEYS.WALLET_TRANSACTIONS],
      ]),
  });
};
