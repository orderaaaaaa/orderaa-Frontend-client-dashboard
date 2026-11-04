import { LiaBanSolid, LiaCheckCircleSolid, LiaExclamationCircleSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useI18n } from '@/i18n/I18nProvider';
import { toStockNumber } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { OptionStatus } from './variantAvailabilityModel';

interface VariantOptionChipProps {
  attributeName: string;
  optionName: string;
  status: OptionStatus;
  onSelect?: () => void;
}

const STATE_CLASS = {
  ok: 'border-success/40 bg-success/10 text-foreground',
  low: 'border-warning/50 bg-warning/10 text-foreground',
  out: 'border-destructive/40 bg-destructive/10 text-foreground',
  notSet: 'border-dashed border-border bg-muted text-muted-foreground',
  unknown: 'border-border bg-card text-foreground',
} as const;

const ICON_CLASS = {
  ok: 'text-success',
  low: 'text-warning',
  out: 'text-destructive',
  notSet: 'text-muted-foreground',
  unknown: 'text-muted-foreground',
} as const;

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
        : status.state === 'out'
          ? t('orderDetails.variants.state.out')
          : t('orderDetails.variants.state.notSet');

  const Icon = status.selected
    ? LiaCheckCircleSolid
    : status.state === 'low'
      ? LiaExclamationCircleSolid
      : status.state === 'out'
        ? LiaBanSolid
        : null;

  const iconClass = status.selected ? 'text-primary' : ICON_CLASS[status.state];

  const content = (
    <>
      <span className="flex max-w-[12rem] items-center gap-1.5 font-medium">
        {Icon && <Icon className={cn('size-4 shrink-0', iconClass)} aria-hidden="true" />}
        <span className="truncate">{optionName}</span>
      </span>
      {stateText && <span className="text-xs">{stateText}</span>}
    </>
  );

  const chipClass = cn(
    'inline-flex h-auto flex-col items-start gap-0.5 rounded-full border px-3 py-1.5 text-start text-sm',
    status.selected
      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary'
      : STATE_CLASS[status.state],
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
      <TooltipContent>{stateText ? `${attributeName}: ${optionName} — ${stateText}` : `${attributeName}: ${optionName}`}</TooltipContent>
    </Tooltip>
  );
}
