import { IntegrationResponse } from './apiIntegration';

export interface IntegrationPlatform {
  name: string;
  logo: string;
  providerKey?: string;
  description: string;
  buttonText: string;
  isActive: boolean;
  id: string;
}

export interface IntegrationCardProps {
  integrations: IntegrationResponse[] | undefined;
  platform: IntegrationPlatform;
  onButtonClick: (platformId: string) => void;
}
