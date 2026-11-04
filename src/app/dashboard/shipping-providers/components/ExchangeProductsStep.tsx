'use client';

import { PackageSearch } from 'lucide-react';
import { LiaMinusSolid, LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import {
  type ChangeProductsLine,
  draftForProductLines,
  isLineComplete,
} from '@/components/orders/ChangeProductsModal';
import { OrderlessVariantAvailabilityPanel } from '@/components/stock/OrderlessVariantAvailabilityPanel';
import { probeQuantityOf, type Selection } from '@/components/stock/variantAvailabilityModel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/state-panels';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import type { FollowupExchangeCandidateItem, FollowupExchangeReason } from '@/lib/api/followup';
import { cn } from '@/lib/utils';
import { formatNumber } from './formatNumber';

export interface ExchangeLine extends ChangeProductsLine {
  price: number;
}

export const itemKeyOf = (item: FollowupExchangeCandidateItem): string => `${item.productId}:${item.variantId}`;

export const EXCHANGE_REASONS: FollowupExchangeReason[] = ['SIZE_OR_COLOR', 'DIFFERENT_PRODUCT', 'DEFECT_OR_WRONG_ITEM'];

const EXCHANGE_REASON_KEYS: Record<FollowupExchangeReason, TranslationKey> = {
  SIZE_OR_COLOR: 'exchange.create.reason.SIZE_OR_COLOR',
  DIFFERENT_PRODUCT: 'exchange.create.reason.DIFFERENT_PRODUCT',
  DEFECT_OR_WRONG_ITEM: 'exchange.create.reason.DEFECT_OR_WRONG_ITEM',
};

interface ExchangeProductsStepProps {
  returnItems: FollowupExchangeCandidateItem[];
  returnQuantities: Record<string, number>;
  lines: ExchangeLine[];
  reason: FollowupExchangeReason;
  disabled: boolean;
  onToggleItem: (item: FollowupExchangeCandidateItem) => void;
  onChangeItemQuantity: (item: FollowupExchangeCandidateItem, quantity: number) => void;
  onAddProducts: () => void;
  onRemoveLine: (key: string) => void;
  onChangeLineQuantity: (key: string, quantity: number) => void;
  onChangeLineSelection: (key: string, next: Selection) => void;
  onChangeReason: (reason: FollowupExchangeReason) => void;
}

export function ExchangeProductsStep({
  returnItems,
  returnQuantities,
  lines,
  reason,
  disabled,
  onToggleItem,
  onChangeItemQuantity,
  onAddProducts,
  onRemoveLine,
  onChangeLineQuantity,
  onChangeLineSelection,
  onChangeReason,
}: ExchangeProductsStepProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-foreground">{t('exchange.create.step2.returnedTitle')}</span>
          <span className="text-xs text-muted-foreground">{t('exchange.create.step2.returnedHint')}</span>
        </div>
        <div className="flex flex-col gap-2">
          {returnItems.map((item) => {
            const key = itemKeyOf(item);
            const quantity = returnQuantities[key];
            const isSelected = quantity !== undefined;
            return (
              <div
                key={key}
                className={cn(
                  'flex flex-wrap items-center gap-3 rounded-lg border border-border p-3',
                  isSelected && 'border-primary',
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleItem(item)}
                  disabled={disabled}
                  aria-label={item.productName}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground">{item.productName}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.variantLabel}
                    {` · ${formatNumber(item.unitPrice, 2)} ${t('exchange.create.currency')}`}
                    {` · ${item.quantity}×`}
                  </span>
                </div>
                {isSelected && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="max-sm:size-10"
                      aria-label={t('exchange.create.step2.decrease')}
                      onClick={() => onChangeItemQuantity(item, quantity - 1)}
                      disabled={disabled || quantity <= 1}
                    >
                      <LiaMinusSolid className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="max-sm:size-10"
                      aria-label={t('exchange.create.step2.increase')}
                      onClick={() => onChangeItemQuantity(item, quantity + 1)}
                      disabled={disabled || quantity >= item.quantity}
                    >
                      <LiaPlusSolid className="size-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-foreground">{t('exchange.create.step2.newTitle')}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 max-sm:h-10"
            onClick={onAddProducts}
            disabled={disabled}
          >
            <LiaPlusSolid className="size-3.5" />
            {t('exchange.create.step2.add')}
          </Button>
        </div>
        {lines.length === 0 ? (
          <EmptyState
            icon={
              <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <PackageSearch className="size-5 text-muted-foreground" />
              </span>
            }
            title={t('exchange.create.step2.noNew')}
            className="py-6"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {lines.map((line) => (
              <div key={line.rowId} className="flex flex-col gap-3 rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{line.name}</span>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="max-sm:size-10"
                      aria-label={t('exchange.create.step2.decrease')}
                      onClick={() => onChangeLineQuantity(line.key, line.quantity - 1)}
                      disabled={disabled || line.quantity <= 1}
                    >
                      <LiaMinusSolid className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="max-sm:size-10"
                      aria-label={t('exchange.create.step2.increase')}
                      onClick={() => onChangeLineQuantity(line.key, line.quantity + 1)}
                      disabled={disabled}
                    >
                      <LiaPlusSolid className="size-3" />
                    </Button>
                  </div>
                  <button
                    type="button"
                    aria-label={t('exchange.create.step2.remove')}
                    onClick={() => onRemoveLine(line.key)}
                    disabled={disabled}
                    className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <LiaTimesSolid className="size-4" />
                  </button>
                </div>
                {line.variantOptions.length > 0 && (
                  <OrderlessVariantAvailabilityPanel
                    productId={line.productId}
                    productName={line.name}
                    targetStatus="CONFIRMED"
                    quantity={probeQuantityOf(line.quantity)}
                    draft={draftForProductLines(lines, line.productId, line.key).draft}
                    excludedLines={draftForProductLines(lines, line.productId, line.key).excluded}
                    selection={line.attributeOptionIds}
                    onChange={disabled ? undefined : (next) => onChangeLineSelection(line.key, next)}
                  />
                )}
                {!isLineComplete(line) && (
                  <p className="text-sm text-destructive">{t('exchange.create.step2.incompleteVariants')}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bold text-foreground">{t('exchange.create.step2.reason')}</span>
        <Select value={reason} onValueChange={(value) => onChangeReason(value as FollowupExchangeReason)} disabled={disabled}>
          <SelectTrigger aria-label={t('exchange.create.step2.reason')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXCHANGE_REASONS.map((value) => (
              <SelectItem key={value} value={value}>
                {t(EXCHANGE_REASON_KEYS[value])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
