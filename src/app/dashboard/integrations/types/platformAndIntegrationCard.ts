import { WebhookConfigResponse } from '@/lib/api/webhooks';

export interface IntegrationPlatform {
  name: string;
  logo: string;
  description: string;
  buttonText: string;
  isActive: boolean;
  id: string;
}

export interface IntegrationCardProps {
  platform: IntegrationPlatform;
  onButtonClick: (platformId: string) => void;
  webhookConfig: WebhookConfigResponse | null;
}
