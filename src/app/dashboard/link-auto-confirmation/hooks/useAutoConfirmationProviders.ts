'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  AutoConfirmationConfig,
  AutoConfirmationProviderId,
} from '../types/autoConfirmation';

let configs: AutoConfirmationConfig[] = [];
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const emit = () => {
  listeners.forEach((listener) => listener());
};

const getSnapshot = () => configs;
const getServerSnapshot = () => configs;

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface AutoConfirmationConfigInput {
  provider: AutoConfirmationProviderId;
  apiKey: string;
  accountId?: string;
  isActive: boolean;
}

export const useAutoConfirmationProviders = () => {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const findByProvider = useCallback(
    (provider: AutoConfirmationProviderId | null | undefined) => {
      if (!provider) return undefined;
      return data.find((config) => config.provider === provider);
    },
    [data]
  );

  const saveConfig = useCallback(async (input: AutoConfirmationConfigInput) => {
    await wait(400);
    const existing = configs.find((c) => c.provider === input.provider);
    if (existing) {
      configs = configs.map((c) =>
        c.provider === input.provider
          ? {
              ...c,
              apiKey: input.apiKey,
              accountId: input.accountId,
              isActive: input.isActive,
            }
          : c
      );
    } else {
      const next: AutoConfirmationConfig = {
        id: `${input.provider}-${Date.now()}`,
        provider: input.provider,
        apiKey: input.apiKey,
        accountId: input.accountId,
        isActive: input.isActive,
      };
      configs = [...configs, next];
    }
    emit();
  }, []);

  const deleteConfig = useCallback(
    async (provider: AutoConfirmationProviderId) => {
      await wait(300);
      configs = configs.filter((c) => c.provider !== provider);
      emit();
    },
    []
  );

  return {
    configs: data,
    findByProvider,
    saveConfig,
    deleteConfig,
    isLoading: false,
  };
};
