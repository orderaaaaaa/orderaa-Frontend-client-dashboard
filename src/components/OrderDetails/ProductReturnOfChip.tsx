'use client';

import Link from 'next/link';
import { Link2 } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

type ProductReturnOfChipProps = {
  orderId: number;
  orderCode: string;
};

export default function ProductReturnOfChip({
  orderId,
  orderCode,
}: ProductReturnOfChipProps) {
  const { t } = useI18n();

  return (
    <Link
      href={`/dashboard/orders/${orderId}`}
      className="inline-flex items-center gap-1.5 self-start rounded-sm text-xs font-medium text-primary-text underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Link2 className="size-3.5 text-primary-text" aria-hidden="true" />
      {t('customerReturn.productSource', { code: orderCode })}
    </Link>
  );
}
