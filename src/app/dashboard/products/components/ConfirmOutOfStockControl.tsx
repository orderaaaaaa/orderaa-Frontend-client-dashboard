'use client';

import { toast } from 'react-toastify';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useI18n } from '@/i18n/I18nProvider';
import { getApiErrorMessage } from '@/utils/apiError';
import { useUpdateProductConfirmOutOfStock } from '../hooks/useProduct';

interface Props {
  productId: number;
  value: boolean | null;
  /** the store-level rule, so "follow the store" can say what it resolves to */
  storeDefault: boolean;
}

/**
 * T27 — the product's confirm-out-of-stock override.
 *
 * THREE states, encoded as strings only because a select needs them to be:
 *   'INHERIT' → null   follow the store (the default)
 *   'ALLOW'   → true
 *   'FORBID'  → false
 *
 * `false` and `null` are DIFFERENT and must never be conflated — `false` forbids
 * even where the store allows, `null` follows whatever the store says. Any code
 * that treats them alike (`||`, a truthiness check, a plain boolean type) turns
 * "forbid" into "inherit" and the setting quietly stops working.
 */
type ScopeChoice = 'INHERIT' | 'ALLOW' | 'FORBID';

const toChoice = (value: boolean | null): ScopeChoice =>
  value === null || value === undefined
    ? 'INHERIT'
    : value
      ? 'ALLOW'
      : 'FORBID';

const fromChoice = (choice: ScopeChoice): boolean | null =>
  choice === 'INHERIT' ? null : choice === 'ALLOW';

export function ConfirmOutOfStockControl({
  productId,
  value,
  storeDefault,
}: Props) {
  const { t } = useI18n();
  const { mutate, isPending } = useUpdateProductConfirmOutOfStock(productId);

  const options = [
    {
      key: 'INHERIT',
      // Spelling out what inheriting currently resolves to — otherwise nobody
      // can tell what "follow the store" actually means for this product. The
      // resolved word is a parameter rather than a concatenation because it
      // sits inside the sentence, and each language places it differently.
      value: t('products.confirmOutOfStock.inherit', {
        value: storeDefault
          ? t('products.confirmOutOfStock.allow')
          : t('products.confirmOutOfStock.forbid'),
      }),
    },
    { key: 'ALLOW', value: t('products.confirmOutOfStock.allow') },
    { key: 'FORBID', value: t('products.confirmOutOfStock.forbid') },
  ];

  return (
    <SearchableSelect
      options={options}
      value={toChoice(value)}
      disabled={isPending}
      onValueChange={(next) =>
        mutate(fromChoice(next as ScopeChoice), {
          onSuccess: () =>
            toast.success(t('products.confirmOutOfStock.saved')),
          onError: (error: unknown) =>
            toast.error(
              getApiErrorMessage(
                error,
                t('products.confirmOutOfStock.saveFailed')
              )
            ),
        })
      }
      placeholder={t('products.confirmOutOfStock.placeholder')}
      triggerClassName="h-9 text-xs"
    />
  );
}
