'use client';

import { useMemo } from 'react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useI18n } from '@/i18n/I18nProvider';
import type { StoreConfirmOutOfStock } from '@/utils/storeConfirmMode';
import {
  PRODUCT_CONFIRM_OUT_OF_STOCK_MODES,
  type ProductConfirmOutOfStockMode,
} from '../types/products';

interface Props {
  value: ProductConfirmOutOfStockMode;
  storeMode: StoreConfirmOutOfStock;
  onChange: (mode: ProductConfirmOutOfStockMode) => void;
  disabled?: boolean;
}

const MODE_ORDER: ProductConfirmOutOfStockMode[] = [
  PRODUCT_CONFIRM_OUT_OF_STOCK_MODES.INHERIT,
  PRODUCT_CONFIRM_OUT_OF_STOCK_MODES.FOLLOW_WORKFLOW,
  PRODUCT_CONFIRM_OUT_OF_STOCK_MODES.ALLOW,
  PRODUCT_CONFIRM_OUT_OF_STOCK_MODES.FORBID,
];

const isProductConfirmMode = (
  value: string
): value is ProductConfirmOutOfStockMode =>
  MODE_ORDER.some((mode) => mode === value);

export function ConfirmOutOfStockControl({
  value,
  storeMode,
  onChange,
  disabled = false,
}: Props) {
  const { t } = useI18n();

  const options = useMemo(() => {
    const storeLabel =
      storeMode === null
        ? t('products.confirmOutOfStock.followWorkflow')
        : storeMode
          ? t('products.confirmOutOfStock.allowNegative')
          : t('products.confirmOutOfStock.forbid');

    const labels: Record<ProductConfirmOutOfStockMode, string> = {
      INHERIT: t('products.confirmOutOfStock.inherit', { value: storeLabel }),
      FOLLOW_WORKFLOW: t('products.confirmOutOfStock.followWorkflow'),
      ALLOW: t('products.confirmOutOfStock.allowNegative'),
      FORBID: t('products.confirmOutOfStock.forbid'),
    };

    return MODE_ORDER.map((mode) => ({ key: mode, value: labels[mode] }));
  }, [storeMode, t]);

  return (
    <div className="flex flex-col gap-1">
      <SearchableSelect
        options={options}
        value={value}
        disabled={disabled}
        searchThreshold={10}
        onValueChange={(next) => {
          if (isProductConfirmMode(next) && next !== value) onChange(next);
        }}
        placeholder={t('products.confirmOutOfStock.placeholder')}
        triggerClassName="h-9 text-xs"
      />
      {value === PRODUCT_CONFIRM_OUT_OF_STOCK_MODES.FOLLOW_WORKFLOW && (
        <p className="text-[11px] leading-4 text-gray-500">
          {t('products.confirmOutOfStock.followWorkflowHint')}
        </p>
      )}
    </div>
  );
}
