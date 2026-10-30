'use client';

import { useEffect, useId } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorWithRetry } from '@/components/entity-manager/StateViews';
import { useI18n } from '@/i18n/I18nProvider';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
import { useCanonicalNamesQuery } from '@/services/canonicalNames';
import { useQueueUrlState } from '../utils/queueUrlState';

interface ScopeSelectorProps {
  value: number | undefined;
  onChange: (governorateId: number) => void;
  urlSync?: boolean;
}

export default function ScopeSelector({ value, onChange, urlSync = false }: ScopeSelectorProps) {
  const { t } = useI18n();
  const id = useId();
  const gateId = `${id}-gate`;
  const queue = useQueueUrlState();
  const {
    data: governorates,
    isLoading,
    isError,
    refetch,
  } = useCanonicalNamesQuery(CANONICAL_NAME_DOMAINS.GOVERNORATE, {});

  useEffect(() => {
    if (!urlSync || value !== undefined || queue.scope === null || !governorates) return;
    if (governorates.some((governorate) => governorate.id === queue.scope)) {
      onChange(queue.scope);
    }
  }, [urlSync, value, queue.scope, governorates, onChange]);

  const handleChange = (next: string) => {
    const governorateId = Number(next);
    if (urlSync) queue.update({ scope: governorateId });
    onChange(governorateId);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {t('canonical.queue.scope.label')}
      </label>
      <Select
        value={value !== undefined ? String(value) : undefined}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger
          id={id}
          aria-label={t('canonical.queue.scope.label')}
          aria-describedby={value === undefined ? gateId : undefined}
          className="min-h-11 sm:min-h-10 w-full sm:w-[220px]"
        >
          <SelectValue placeholder={t('canonical.queue.scope.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {(governorates ?? []).map((governorate) => (
            <SelectItem key={governorate.id} value={String(governorate.id)}>
              {governorate.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === undefined && (
        <p id={gateId} className="text-sm text-muted-foreground">
          {t('canonical.queue.scope.gate')}
        </p>
      )}
      {isError && (
        <ErrorWithRetry
          message={t('canonical.queue.scope.error')}
          onRetry={() => void refetch()}
        />
      )}
    </div>
  );
}
