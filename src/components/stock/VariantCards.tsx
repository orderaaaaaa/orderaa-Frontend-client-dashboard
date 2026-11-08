import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { useI18n } from '@/i18n/I18nProvider';
import type { VariantCard } from '@/lib/api/products';
import type { VariantAvailability } from '@/lib/api/warehouses';
import { cn } from '@/lib/utils';
import { toStockNumber } from '@/utils/format';
import {
  cardNumbersOf,
  isCardSelected,
  type CardNumbers,
  type Selection,
} from './variantAvailabilityModel';

const FILTER_THRESHOLD = 12;

const CARD_BORDER: Record<CardNumbers['kind'], string> = {
  warning: 'border-warning/50 bg-warning/10',
  low: 'border-warning/50 bg-warning/10',
  out: 'border-destructive/40 bg-destructive/10',
  notSet: 'border-border bg-card',
  enough: 'border-border bg-card',
};

const CARD_TEXT: Record<CardNumbers['kind'], string> = {
  warning: 'text-warning',
  low: 'text-warning',
  out: 'text-destructive',
  notSet: 'text-muted-foreground',
  enough: 'text-muted-foreground',
};

interface VariantCardsProps {
  cards: VariantCard[];
  rows: VariantAvailability[];
  selection: Selection;
  onSelect?: (card: VariantCard) => void;
}

export function VariantCards({ cards, rows, selection, onSelect }: VariantCardsProps) {
  const { t } = useI18n();
  const [filter, setFilter] = useState('');
  const rowByVariantId = new Map(rows.map((row) => [row.variantId, row]));
  const needle = filter.trim().toLowerCase();
  const visible =
    needle && cards.length > FILTER_THRESHOLD
      ? cards.filter((card) => card.label.toLowerCase().includes(needle))
      : cards;

  const numbersTextOf = (numbers: CardNumbers): string => {
    switch (numbers.kind) {
      case 'warning':
      case 'out':
        return t('orderDetails.variants.state.out');
      case 'notSet':
        return t('orderDetails.variants.state.notSet');
      case 'low':
        return t('orderDetails.stock.availableWithRequired', {
          available: toStockNumber(numbers.available),
          required: toStockNumber(numbers.required),
        });
      case 'enough':
        return t('orderDetails.stock.available', { count: toStockNumber(numbers.available) });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {cards.length > FILTER_THRESHOLD && (
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label={t('orderDetails.variants.filterLabel')}
          placeholder={t('orderDetails.variants.filterLabel')}
          className="h-9"
        />
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visible.map((card) => {
          const row = rowByVariantId.get(card.id);
          const numbers = row ? cardNumbersOf(row) : null;
          const selected = isCardSelected(card, selection);
          return (
            <Button
              key={card.id}
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={selected}
              onClick={onSelect ? () => onSelect(card) : undefined}
              className={cn(
                'flex h-auto min-h-14 min-w-0 flex-col items-start justify-center gap-1 whitespace-normal rounded-xl border px-3 py-2 text-start text-sm',
                numbers ? CARD_BORDER[numbers.kind] : 'border-border bg-card',
                selected && 'ring-2 ring-primary',
              )}
            >
              <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium text-foreground">
                {card.label}
              </span>
              {numbers && (
                <span className={cn('text-xs', CARD_TEXT[numbers.kind])}>
                  {numbersTextOf(numbers)}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
