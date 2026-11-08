import React from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import type { OrderPrepaid } from '@/types/orders';

export function PrepaidBadge({ prepaid }: { prepaid: OrderPrepaid | null | undefined }) {
  const { t } = useI18n();
  if (!prepaid) return null;
  if (prepaid.state === 'FULL') {
    return (
      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
        {t('prepaid.badge.full', { amount: prepaid.amount })}
      </span>
    );
  }
  return (
    <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
      {t('prepaid.badge.partial', { amount: prepaid.amount })}
    </span>
  );
}
