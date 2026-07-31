export type AutomationProvider = 'VROBO' | 'OTHER';

export type AutomationConfigType = 'API' | 'WEBHOOK';

export type AutoConfirmationProviderId = 'VROBO';

export interface AutoConfirmationProvider {
  id: AutoConfirmationProviderId;
  name: string;
  logo: string;
  description: string;
  isActive: boolean;
}

export interface AutoConfirmationConfig {
  id: number;
  merchantId: number;
  provider: AutomationProvider;
  configType: AutomationConfigType;
  apiKey: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutoConfirmationConfigRequest {
  provider: AutomationProvider;
  configType: AutomationConfigType;
  apiKey: string;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateAutoConfirmationConfigRequest {
  apiKey?: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AvailableAutomationProvidersResponse {
  providers: AutomationProvider[];
}

export const getAccountIdFromMetadata = (
  metadata: Record<string, unknown> | null | undefined
): string | undefined => {
  const value = metadata?.merchant_id;
  return typeof value === 'string' ? value : undefined;
};
