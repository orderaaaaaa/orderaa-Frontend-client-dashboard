import { ErrorState } from '@/components/ui/state-panels';
import { ScrollEndFade } from '@/components/ui/scroll-end-fade';
import { useScrollEndFade } from '@/hooks/useScrollEndFade';
import { useI18n } from '@/i18n/I18nProvider';
import type { VariantAvailability } from '@/lib/api/warehouses';
import { cn } from '@/lib/utils';
import { VariantOptionChip } from './VariantOptionChip';
import {
  exactVariantFor,
  optionStatus,
  refusalTextFor,
  selectionLabel,
  sortedCatalog,
  type CatalogAttribute,
  type Selection,
} from './variantAvailabilityModel';

export interface VariantAvailabilitySelectorProps {
  productName: string;
  attributes: CatalogAttribute[];
  variants: VariantAvailability[];
  selection: Selection;
  onChange?: (selection: Selection) => void;
  isLoading?: boolean;
  isError?: boolean;
  maxHeightClassName?: string;
  className?: string;
}

export function VariantAvailabilitySelector({
  productName,
  attributes,
  variants,
  selection,
  onChange,
  isLoading = false,
  isError = false,
  maxHeightClassName,
  className,
}: VariantAvailabilitySelectorProps) {
  const { t, dir } = useI18n();
  const { ref: scrollerRef, hasMoreAtEnd } = useScrollEndFade<HTMLDivElement>('y');

  if (attributes.length === 0 && !isLoading && !isError) return null;

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

  if (isLoading) {
    return container(
      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>,
    );
  }

  if (isError) {
    return container(
      <ErrorState error={null} fallback={t('orderDetails.variants.title')} />,
    );
  }

  const sorted = sortedCatalog(attributes);
  const exact = exactVariantFor(variants, selection, attributes.length);
  const refusal = exact?.refusal ?? null;
  const summary = selectionLabel(attributes, selection);
  const someUnselected = Object.keys(selection).length < attributes.length;
  const allWarehouseNotSet =
    variants.length > 0 && variants.every((variant) => variant.available === null);

  const choose = (attributeId: number, optionId: number) => {
    if (!onChange) return;
    const next: Selection = { ...selection };
    if (next[attributeId] === optionId) {
      delete next[attributeId];
    } else {
      next[attributeId] = optionId;
    }
    onChange(next);
  };

  return container(
    <>
      <div className="relative">
        <div
          ref={scrollerRef}
          className={cn(
            'overflow-y-auto overscroll-contain',
            maxHeightClassName ?? 'max-h-72',
          )}
        >
          {sorted.map((attribute) => (
            <div key={attribute.attributeId} className="mb-3 last:mb-0">
              <p className="mb-1.5 text-sm font-semibold text-muted-foreground">
                {attribute.attributeName}
              </p>
              <div className="flex flex-wrap gap-2">
                {attribute.options.map((option) => (
                  <VariantOptionChip
                    key={option.optionId}
                    attributeName={attribute.attributeName}
                    optionName={option.optionName}
                    status={optionStatus({
                      variants,
                      attribute,
                      optionId: option.optionId,
                      selection,
                    })}
                    onSelect={
                      onChange
                        ? () => choose(attribute.attributeId, option.optionId)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <ScrollEndFade visible={hasMoreAtEnd} axis="y" fromClassName="from-card" />
      </div>

      {summary ? (
        <p className="mt-3 text-sm text-foreground">
          {t('orderDetails.variants.selectedSummary', { variant: summary })}
        </p>
      ) : someUnselected ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {t('orderDetails.variants.pickAll')}
        </p>
      ) : null}

      {exact && refusal && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 whitespace-pre-line text-sm font-semibold text-destructive"
        >
          {refusalTextFor({ refusal, productName, row: exact })}
        </p>
      )}

      {allWarehouseNotSet && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t('orderDetails.stock.availableWarehouseNotSet')}
        </p>
      )}
      {variants.length === 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t('orderDetails.variants.noVariantRows')}
        </p>
      )}
    </>,
  );
}
