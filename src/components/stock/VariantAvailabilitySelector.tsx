import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/state-panels';
import { ScrollEndFade } from '@/components/ui/scroll-end-fade';
import { useScrollEndFade } from '@/hooks/useScrollEndFade';
import { useI18n } from '@/i18n/I18nProvider';
import { useProductCards } from '@/services/products';
import type { VariantCard } from '@/lib/api/products';
import type { VariantAvailability } from '@/lib/api/warehouses';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/utils/apiError';
import { VariantCards } from './VariantCards';
import {
  availableNumbersTextFor,
  catalogAttributesOf,
  exactVariantFor,
  selectionLabel,
  selectionOfCard,
  warningTextFor,
  type Selection,
} from './variantAvailabilityModel';

export interface VariantAvailabilitySelectorProps {
  productId: number | null;
  productName: string;
  variants: VariantAvailability[];
  selection: Selection;
  onChange?: (selection: Selection) => void;
  availabilityLoading?: boolean;
  availabilityError?: unknown;
  onRetry?: () => void;
  maxHeightClassName?: string;
  className?: string;
  excludedLines?: number;
  informationOnly?: boolean;
}

export function VariantAvailabilitySelector({
  productId,
  productName,
  variants,
  selection,
  onChange,
  availabilityLoading = false,
  availabilityError = null,
  onRetry,
  maxHeightClassName,
  className,
  excludedLines = 0,
  informationOnly = false,
}: VariantAvailabilitySelectorProps) {
  const { t, dir } = useI18n();
  const { ref: scrollerRef, hasMoreAtEnd } = useScrollEndFade<HTMLDivElement>('y');
  const catalog = useProductCards(productId);
  const attributes = catalogAttributesOf(catalog.attributes ?? []);
  const cards: VariantCard[] = catalog.cards ?? [];
  if (attributes.length === 0 && !catalog.isLoading && !catalog.isError) return null;

  const container = (body: React.ReactNode) => (
    <div
      dir={dir}
      className={cn('rounded-2xl border border-border bg-card p-3', className)}
    >
      <h3 className="mb-2 text-base font-semibold text-foreground">
        {t('orderDetails.variants.title')}
      </h3>
      {body}
    </div>
  );

  if (catalog.isLoading) {
    return container(
      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>,
    );
  }

  if (catalog.isError) {
    return container(
      <ErrorState
        error={catalog.error}
        fallback={t('orderDetails.variants.loadError')}
        onRetry={() => void catalog.refetch()}
      />,
    );
  }

  const exact = exactVariantFor(variants, selection, attributes.length);
  const refusal = informationOnly ? null : (exact?.refusal ?? null);
  const warningText = exact && !informationOnly ? warningTextFor({ productName, row: exact }) : null;
  const availableNumbersText =
    exact && refusal ? availableNumbersTextFor({ productName, row: exact }) : null;
  const summary = selectionLabel(attributes, selection);
  const someUnselected = Object.keys(selection).length < attributes.length;
  const allWarehouseNotSet =
    variants.length > 0 && variants.every((variant) => variant.available === null);
  const exactNotSet = exact !== null && exact.available === null;
  const numberRows = availabilityError ? [] : variants;

  const pickCard = (card: VariantCard) => {
    if (!onChange) return;
    const isSelected = card.options.every(
      (option) => selection[option.attributeId] === option.optionId,
    );
    onChange(isSelected ? {} : selectionOfCard(card));
  };

  return container(
    <>
      {availabilityError ? (
        <div
          role="alert"
          className="mb-2 flex flex-wrap items-center gap-2 text-sm text-destructive"
        >
          <span>
            {getApiErrorMessage(availabilityError, t('orderDetails.variants.loadError'))}
          </span>
          {onRetry && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onRetry()}>
              {t('common.retry')}
            </Button>
          )}
        </div>
      ) : availabilityLoading ? (
        <p className="mb-2 text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : null}

      {summary ? (
        <p className="mb-2 text-sm text-foreground">
          {t('orderDetails.variants.selectedSummary', { variant: summary })}
        </p>
      ) : someUnselected ? (
        <p className="mb-2 text-sm text-muted-foreground">
          {t('orderDetails.variants.pickAll')}
        </p>
      ) : null}

      {cards.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('orderDetails.variants.noCards')}</p>
      ) : (
        <div className="relative">
          <div
            ref={scrollerRef}
            className={cn(
              'overflow-y-auto overscroll-contain p-0.5',
              maxHeightClassName ?? 'max-h-72 max-sm:max-h-none max-sm:overflow-y-visible',
            )}
          >
            <VariantCards
              cards={cards}
              rows={numberRows}
              selection={selection}
              onSelect={onChange ? pickCard : undefined}
            />
          </div>
          <ScrollEndFade visible={hasMoreAtEnd} axis="y" fromClassName="from-card" />
        </div>
      )}

      {excludedLines > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t('orderDetails.variants.excludedLines', { count: excludedLines })}
        </p>
      )}

      {availableNumbersText && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 whitespace-pre-line text-sm text-muted-foreground"
        >
          {availableNumbersText}
        </p>
      )}

      {warningText && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 whitespace-pre-line text-sm font-semibold text-warning"
        >
          {warningText}
        </p>
      )}

      {(exactNotSet || allWarehouseNotSet) && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t('orderDetails.stock.availableWarehouseNotSet')}
        </p>
      )}
    </>,
  );
}
