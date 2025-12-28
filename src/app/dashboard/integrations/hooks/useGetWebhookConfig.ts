import { useQuery } from '@tanstack/react-query';
import { webhookApi } from '@/lib/api/webhooks';
import { WebhookConfigResponse } from '@/lib/api/webhooks';

export const useGetWebhookConfig = () => {
  return useQuery<WebhookConfigResponse>({
    queryKey: ['webhook-config'],
    queryFn: webhookApi.getConfig,
  });
};
