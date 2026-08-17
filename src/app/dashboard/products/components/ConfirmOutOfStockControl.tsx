'use client';

import { toast } from 'react-toastify';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { getApiErrorMessage } from '@/utils/apiError';
import { useUpdateProductConfirmOutOfStock } from '../hooks/useProduct';

interface Props {
  productId: number;
  value: boolean | null;
  /** the store-level rule, so "اتبع المتجر" can say what it resolves to */
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
  const { mutate, isPending } = useUpdateProductConfirmOutOfStock(productId);

  const options = [
    {
      key: 'INHERIT',
      // Spelling out what inheriting currently resolves to — otherwise nobody
      // can tell what "follow the store" actually means for this product.
      value: `اتبع المتجر (${storeDefault ? 'مسموح' : 'ممنوع'})`,
    },
    { key: 'ALLOW', value: 'مسموح' },
    { key: 'FORBID', value: 'ممنوع' },
  ];

  return (
    <SearchableSelect
      options={options}
      value={toChoice(value)}
      disabled={isPending}
      onValueChange={(next) =>
        mutate(fromChoice(next as ScopeChoice), {
          onSuccess: () => toast.success('تم حفظ إعداد التأكيد'),
          onError: (error: unknown) =>
            toast.error(getApiErrorMessage(error, 'تعذر حفظ الإعداد')),
        })
      }
      placeholder="تأكيد بدون مخزون"
      triggerClassName="h-9 text-xs"
    />
  );
}
