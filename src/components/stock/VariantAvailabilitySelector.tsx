import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/state-panels';
import { ScrollEndFade } from '@/components/ui/scroll-end-fade';
import { useScrollEndFade } from '@/hooks/useScrollEndFade';
import { useI18n } from '@/i18n/I18nProvider';
import type { VariantAvailability } from '@/lib/api/warehouses';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/utils/apiError';
import { useEffect } from 'react';
import { VariantOptionChip } from './VariantOptionChip';
import { useBlockedLinesStore } from './blockedLinesStore';
import {
  exactVariantFor,
  optionStatus,
  refusalTextFor,
  selectionLabel,
  warningTextFor,
  sortedCatalog,
  unknownOptionStatus,
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
  availabilityLoading?: boolean;
  availabilityError?: unknown;
  onRetry?: () => void;
  maxHeightClassName?: string;
  className?: string;
  excludedLines?: number;
  showWarehouseNote?: boolean;
  blockKey?: string;
}

export function VariantAvailabilitySelector({
  productName,
  attributes,
  variants,
  selection,
  onChange,
  isLoading = false,
  isError = false,
  availabilityLoading = false,
  availabilityError = null,
  onRetry,
  maxHeightClassName,
  className,
  excludedLines = 0,
  showWarehouseNote = true,
  blockKey,
}: VariantAvailabilitySelectorProps) {
  const { t, dir } = useI18n();
  const { ref: scrollerRef, hasMoreAtEnd } = useScrollEndFade<HTMLDivElement>('y');
  const setBlocked = useBlockedLinesStore((state) => state.setBlocked);
  const isBlockedNow = exactVariantFor(variants, selection, attributes.length)?.blocked === true;

  useEffect(() => {
    if (blockKey) setBlocked(blockKey, isBlockedNow);
  }, [blockKey, isBlockedNow, setBlocked]);

  useEffect(() => {
    if (!blockKey) return;
    return () => setBlocked(blockKey, false);
  }, [blockKey, setBlocked]);

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
  const warningText =
    exact && !refusal ? warningTextFor({ productName, row: exact }) : null;
  const summary = selectionLabel(attributes, selection);
  const someUnselected = Object.keys(selection).length < attributes.length;
  const allWarehouseNotSet =
    variants.length > 0 && variants.every((variant) => variant.available === null);
  const exactNotSet = exact !== null && exact.available === null && refusal === null;
  const hasStates = variants.length > 0 || (!availabilityLoading && !availabilityError);

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
                    status={
                      hasStates
                        ? optionStatus({
                            variants,
                            attribute,
                            optionId: option.optionId,
                            selection,
                          })
                        : unknownOptionStatus(
                            selection[attribute.attributeId] === option.optionId,
                          )
                    }
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

      {availabilityError ? (
        <div
          role="alert"
          className="mt-2 flex flex-wrap items-center gap-2 text-sm text-destructive"
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
        <p className="mt-2 text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : null}

      {summary ? (
        <p className="mt-3 text-sm text-foreground">
          {t('orderDetails.variants.selectedSummary', { variant: summary })}
        </p>
      ) : someUnselected ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {t('orderDetails.variants.pickAll')}
        </p>
      ) : null}

      {excludedLines > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t('orderDetails.variants.excludedLines', { count: excludedLines })}
        </p>
      )}

      {exact && refusal && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 whitespace-pre-line text-sm font-semibold text-destructive"
        >
          {refusalTextFor({ refusal, productName, row: exact })}
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

      {exactNotSet && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-sm font-semibold text-destructive"
        >
          {t('orderDetails.stock.availableWarehouseNotSet')}
        </p>
      )}
      {showWarehouseNote &&
        allWarehouseNotSet &&
        !exactNotSet &&
        refusal !== 'AVAILABLE_WAREHOUSE_NOT_SET' && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t('orderDetails.stock.availableWarehouseNotSet')}
          </p>
        )}
      {variants.length === 0 && !availabilityLoading && !availabilityError && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t('orderDetails.variants.noVariantRows')}
        </p>
      )}
    </>,
  );
}
