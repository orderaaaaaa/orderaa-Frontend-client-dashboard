import { IntegrationProvider } from '../types/apiIntegration';
import {
  webhookSteps,
  integrationSteps,
  shopifyWebhookSteps,
  shopifyIntegrationSteps,
} from './steps';

export interface MetadataField {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: 'text' | 'url';
}

export interface ProviderModalConfig {
  provider: IntegrationProvider;
  modalTitle: string;
  modalDescription: string;
  webhookSteps: string[];
  apiSteps: string[];
  videoUrl?: string;
  metadataFields?: MetadataField[];
}

export const providerConfigs: Record<string, ProviderModalConfig> = {
  easyorder: {
    provider: IntegrationProvider.EASY_ORDERS,
    modalTitle: 'ربط المتاجر - Easy Order',
    modalDescription: 'قم بربط متجرك لمراقبة الطلبات تلقائياً عبر Easy Order',
    webhookSteps: webhookSteps,
    apiSteps: integrationSteps,
    videoUrl:
      'https://drive.google.com/file/d/1aoWTPTEbKQg3fWBwI3VL0gIf82Lsdnf-/preview',
  },
  shopify: {
    provider: IntegrationProvider.SHOPIFY,
    modalTitle: 'ربط المتاجر - Shopify',
    modalDescription: 'قم بربط متجرك لمراقبة الطلبات تلقائياً عبر Shopify',
    webhookSteps: shopifyWebhookSteps,
    apiSteps: shopifyIntegrationSteps,
    metadataFields: [
      {
        key: 'shopDomain',
        label: 'دومين المتجر',
        placeholder: 'my-store.myshopify.com',
        required: true,
        type: 'url',
      },
      {
        key: 'clientId',
        label: 'Client ID',
        placeholder: 'أدخل Client ID...',
        required: true,
        type: 'text',
      },
    ],
  },
};
