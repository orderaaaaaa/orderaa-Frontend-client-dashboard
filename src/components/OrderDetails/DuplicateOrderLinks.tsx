'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CopyableCode from '@/components/ui/copyable-code';
import type { Order } from '@/types/orders';

interface DuplicateOrderLinksProps {
  order: Pick<Order, 'duplicateOf' | 'duplicates'>;
}

export function DuplicateOrderLinks({ order }: DuplicateOrderLinksProps) {
  const router = useRouter();
  const duplicateOf = order.duplicateOf ?? null;
  const duplicates = order.duplicates ?? [];

  if (!duplicateOf && duplicates.length === 0) return null;

  const openOrder = (id: number) => router.push(`/dashboard/orders/${id}`);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
      {duplicateOf && (
        <>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            طلب مكرر من <CopyableCode value={duplicateOf.code} label="نسخ كود الطلب">#{duplicateOf.code}</CopyableCode>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => openOrder(duplicateOf.id)}
          >
            الطلب الأصلي
          </Button>
        </>
      )}
      {duplicates.length > 0 && (
        <>
          <span className="text-sm font-medium text-amber-700">طلبات مكررة</span>
          {duplicates.map((item) => (
            <CopyableCode key={item.id} value={item.code} label="نسخ كود الطلب">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => openOrder(item.id)}
              >
                {item.code}
              </Button>
            </CopyableCode>
          ))}
        </>
      )}
    </div>
  );
}
