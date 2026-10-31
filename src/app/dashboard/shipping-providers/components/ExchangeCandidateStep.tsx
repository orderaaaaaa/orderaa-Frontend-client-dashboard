'use client';

import { LiaSpinnerSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import type { FollowupExchangeCandidate } from '@/lib/api/followup';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/utils/format';
import { formatNumber } from './formatNumber';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';

interface ExchangeCandidateStepProps {
  candidates: FollowupExchangeCandidate[];
  isLoading: boolean;
  isError: boolean;
  selectedId: number | null;
  disabled: boolean;
  onSelect: (id: number) => void;
  onRetry: () => void;
}

export function ExchangeCandidateStep({
  candidates,
  isLoading,
  isError,
  selectedId,
  disabled,
  onSelect,
  onRetry,
}: ExchangeCandidateStepProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <LiaSpinnerSolid className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-destructive">{t('exchange.create.step1.loadError')}</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {t('exchange.create.retry')}
        </Button>
      </div>
    );
  }

  if (candidates.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('exchange.create.step1.empty')}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {candidates.map((candidate) => {
        const openCode = candidate.openExchangeCode;
        const isBlocked = openCode !== null;
        const isDisabled = disabled || isBlocked;
        const unitCount = candidate.items.reduce((sum, item) => sum + item.quantity, 0);
        const isSelected = selectedId === candidate.id;
        return (
          <label
            key={candidate.id}
            className={cn(
              'flex cursor-pointer flex-col gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-accent',
              isSelected && 'border-primary ring-1 ring-primary',
              isDisabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
            )}
          >
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="radio"
                name="exchangeSourceOrder"
                className="size-4 accent-primary"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onSelect(candidate.id)}
              />
              <span dir="ltr" className="font-mono text-sm font-semibold text-foreground">
                {candidate.code}
              </span>
              <ShipmentStatusBadge status={candidate.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 ps-7 text-xs text-muted-foreground">
              <span>{`${formatNumber(candidate.totalCost, 2)} ج.م`}</span>
              <span>{formatDateTime(candidate.createdAt)}</span>
              <span>{t('exchange.create.units', { count: unitCount })}</span>
            </div>
            {isBlocked && (
              <p className="ps-7 text-xs font-medium text-amber-700">
                {t('exchange.create.openExchange', { code: openCode })}
              </p>
            )}
          </label>
        );
      })}
    </div>
  );
}
