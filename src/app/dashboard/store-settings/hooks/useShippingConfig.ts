import { useQuery } from '@tanstack/react-query';
import { shippingConfigApi } from '../api/shippingApi';

export const useShippingConfig = () => {
  const shippingConfigQuery = useQuery({
    queryKey: ['shipping-config'],
    queryFn: shippingConfigApi.getShippingConfigs,
  });

  return {
    shippingConfigs: shippingConfigQuery.data,
    isLoading: shippingConfigQuery.isLoading,
    hasShippingConfig: (shippingConfigQuery.data?.length ?? 0) > 0,
  };
};
