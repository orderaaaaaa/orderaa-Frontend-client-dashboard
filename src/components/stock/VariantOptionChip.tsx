import { LiaBanSolid, LiaCheckCircleSolid, LiaExclamationCircleSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useI18n } from '@/i18n/I18nProvider';
import { toStockNumber } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { OptionState, OptionStatus } from './variantAvailabilityModel';

interface VariantOptionChipProps {
  attributeName: string;
  optionName: string;
  status: OptionStatus;
  onSelect?: () => void;
}

const STATE_CLASS = {
  ok: 'border-success/40 bg-success/10',
  low: 'border-warning/50 bg-warning/10',
  warning: 'border-warning/50 bg-warning/10',
  out: 'border-destructive/40 bg-destructive/10',
  notSet: 'border-dashed border-border bg-muted',
  unknown: 'border-border bg-card',
} as const;

const STATE_TEXT_CLASS = {
  ok: 'text-success',
  low: 'text-warning',
  warning: 'text-warning',
  out: 'text-destructive',
  notSet: 'text-muted-foreground',
  unknown: 'text-muted-foreground',
} as const;

const iconFor = (state: OptionState) =>
  state === 'low' || state === 'warning'
    ? LiaExclamationCircleSolid
    : state === 'out'
      ? LiaBanSolid
      : null;

export function VariantOptionChip({
  attributeName,
  optionName,
  status,
  onSelect,
}: VariantOptionChipProps) {
  const { t } = useI18n();
  const best = toStockNumber(status.best);

  const stateText =
    status.state === 'unknown'
      ? null
      : status.state === 'ok'
        ? status.required !== null && status.required > 1
          ? t('orderDetails.stock.availableWithRequired', {
              available: best,
              required: toStockNumber(status.required),
            })
          : t('orderDetails.stock.available', { count: best })
        : status.state === 'low'
          ? t('orderDetails.variants.state.low', { count: best })
          : status.state === 'warning'
            ? t('orderDetails.variants.state.warning', { count: best })
          : status.state === 'out'
            ? t('orderDetails.variants.state.out')
            : t('orderDetails.variants.state.notSet');

  const Icon = iconFor(status.state);

  const content = (
    <>
      <span className="flex max-w-[12rem] items-center gap-1.5 font-medium text-foreground">
        {Icon && <Icon className={cn('size-4 shrink-0', STATE_TEXT_CLASS[status.state])} aria-hidden="true" />}
        <span className="truncate">{optionName}</span>
        {status.selected && <LiaCheckCircleSolid className="size-4 shrink-0 text-primary-text" aria-hidden="true" />}
      </span>
      {stateText && (
        <span className={cn('text-xs', STATE_TEXT_CLASS[status.state])}>{stateText}</span>
      )}
    </>
  );

  const chipClass = cn(
    'inline-flex h-auto min-h-14 min-w-24 flex-col items-start justify-center gap-1 rounded-xl border px-3 py-2 text-start text-sm',
    STATE_CLASS[status.state],
    status.selected && 'ring-2 ring-primary',
  );

  const element = onSelect ? (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={status.selected}
      onClick={onSelect}
      className={chipClass}
    >
      {content}
    </Button>
  ) : (
    <span className={chipClass}>{content}</span>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{element}</TooltipTrigger>
      <TooltipContent collisionPadding={16} className="max-w-[min(20rem,calc(100vw-2rem))]">{stateText ? `${attributeName}: ${optionName} — ${stateText}` : `${attributeName}: ${optionName}`}</TooltipContent>
    </Tooltip>
  );
}
