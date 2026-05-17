export type AutoConfirmationProviderId = 'vrobo';

export interface AutoConfirmationProvider {
  id: AutoConfirmationProviderId;
  name: string;
  logo: string;
  description: string;
  isActive: boolean;
}

export interface AutoConfirmationConfig {
  id: string;
  provider: AutoConfirmationProviderId;
  apiKey: string;
  accountId?: string;
  isActive: boolean;
}
