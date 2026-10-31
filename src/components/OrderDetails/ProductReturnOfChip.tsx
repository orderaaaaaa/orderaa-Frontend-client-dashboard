'use client';

import { useRouter } from 'next/navigation';
import { LiaRandomSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
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
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-auto self-start rounded-full border-border bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/80"
      onClick={() => router.push(`/dashboard/orders/${orderId}`)}
    >
      <LiaRandomSolid
        className="size-3.5 text-muted-foreground"
        aria-hidden="true"
      />
      {t('customerReturn.productSource', { code: orderCode })}
    </Button>
  );
}
