'use client';

import { useRouter } from 'next/navigation';
import { LiaRandomSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types/orders';

interface PartialReturnLinksProps {
  order: Pick<Order, 'returnOf' | 'partialReturns'>;
}

export function PartialReturnLinks({ order }: PartialReturnLinksProps) {
  const router = useRouter();
  const returnOf = order.returnOf ?? null;
  const partialReturns = order.partialReturns ?? [];

  if (!returnOf && partialReturns.length === 0) return null;

  const openOrder = (id: number) => router.push(`/dashboard/orders/${id}`);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
      {returnOf && (
        <>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            <LiaRandomSolid className="size-4" />
            تسليم جزئي من {returnOf.code}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => openOrder(returnOf.id)}
          >
            الطلب الأصلي
          </Button>
        </>
      )}
      {partialReturns.length > 0 && (
        <>
          <span className="text-sm font-medium text-amber-700">طلبات المرتجع</span>
          {partialReturns.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => openOrder(item.id)}
            >
              {item.code}
            </Button>
          ))}
        </>
      )}
    </div>
  );
}
