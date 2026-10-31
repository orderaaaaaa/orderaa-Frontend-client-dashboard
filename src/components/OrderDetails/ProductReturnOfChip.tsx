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
      className="inline-flex items-center gap-1.5 self-start rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Link2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
      {t('customerReturn.productSource', { code: orderCode })}
    </Link>
  );
}
