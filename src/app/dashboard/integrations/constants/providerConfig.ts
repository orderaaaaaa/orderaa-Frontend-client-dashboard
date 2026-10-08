import { IntegrationProvider } from '../types/apiIntegration';
import {
  webhookSteps,
  integrationSteps,
  shopifyWebhookSteps,
  shopifyIntegrationSteps,
  lightfunnelsWebhookSteps,
} from './steps';

export const PROVIDER_CONNECTION_MODE = {
  WEBHOOK_AND_API: 'WEBHOOK_AND_API',
  WEBHOOK_ONLY: 'WEBHOOK_ONLY',
} as const;

export type ProviderConnectionMode =
  (typeof PROVIDER_CONNECTION_MODE)[keyof typeof PROVIDER_CONNECTION_MODE];

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
  connectionMode?: ProviderConnectionMode;
  successMessage?: string;
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
  lightfunnels: {
    provider: IntegrationProvider.LIGHTFUNNELS,
    modalTitle: 'ربط المتاجر - Lightfunnels',
    modalDescription: 'قم بربط متجرك لمراقبة الطلبات تلقائياً عبر Lightfunnels',
    webhookSteps: lightfunnelsWebhookSteps,
    apiSteps: [],
    connectionMode: PROVIDER_CONNECTION_MODE.WEBHOOK_ONLY,
    successMessage:
      'تم ربط Lightfunnels بنجاح! سيتم استقبال الطلبات المؤكدة تلقائياً.',
  },
};
