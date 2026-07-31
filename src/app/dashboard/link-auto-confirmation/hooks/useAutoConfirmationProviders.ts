'use client';

import { useCallback } from 'react';
import {
  AutoConfirmationConfig,
  AutoConfirmationProviderId,
} from '../types/autoConfirmation';
import { useAutoConfirmationConfigs } from './useAutoConfirmationConfigs';

export interface AutoConfirmationConfigInput {
  provider: AutoConfirmationProviderId;
  apiKey: string;
  accountId?: string;
  isActive: boolean;
}

const getApiConfig = (
  configs: AutoConfirmationConfig[] | undefined,
  provider: AutoConfirmationProviderId | null | undefined
): AutoConfirmationConfig | undefined => {
  if (!provider) return undefined;
  return configs?.find(
    (config) => config.provider === provider && config.configType === 'API'
  );
};

export const useAutoConfirmationProviders = () => {
  const {
    configs,
    isLoading,
    isError,
    createConfig,
    updateConfig,
    deleteConfig: deleteConfigMutation,
  } = useAutoConfirmationConfigs();

  const findByProvider = useCallback(
    (provider: AutoConfirmationProviderId | null | undefined) =>
      getApiConfig(configs, provider),
    [configs]
  );

  const saveConfig = useCallback(
    async (input: AutoConfirmationConfigInput) => {
      const existing = getApiConfig(configs, input.provider);
      const metadata = input.accountId
        ? { merchant_id: input.accountId }
        : {};
      if (existing) {
        await updateConfig({
          configId: existing.id,
          data: {
            apiKey: input.apiKey,
            isActive: input.isActive,
            metadata,
          },
        });
      } else {
        await createConfig({
          provider: input.provider,
          configType: 'API',
          apiKey: input.apiKey,
          isActive: input.isActive,
          metadata: input.accountId ? { merchant_id: input.accountId } : undefined,
        });
      }
    },
    [configs, createConfig, updateConfig]
  );

  const deleteConfig = useCallback(
    async (provider: AutoConfirmationProviderId) => {
      const existing = getApiConfig(configs, provider);
      if (!existing) return;
      await deleteConfigMutation(existing.id);
    },
    [configs, deleteConfigMutation]
  );

  return {
    configs,
    findByProvider,
    saveConfig,
    deleteConfig,
    isLoading,
    isError,
  };
};
