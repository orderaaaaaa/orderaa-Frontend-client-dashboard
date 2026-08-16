'use client';

import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import OrderCard from '@/app/dashboard/orders/allOrders/components/OrderCard';
import { mapOrderProductToVariantInfo } from '@/types/orders';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { useOrderStatusesQuery } from '@/services/orders';
import {
  useDelayedOrdersQuery,
  useMarkDelayedOrder,
  type DelayedMarksMode,
} from '@/services/delayedOrders';
import { DelaySettingsModal } from './components/DelaySettingsModal';

const MARK_MODES: { value: DelayedMarksMode; label: string }[] = [
  { value: 'default', label: 'النشطة' },
  { value: 'followedUp', label: 'تمت متابعتها' },
  { value: 'notFollowedUp', label: 'بدون متابعة' },
  { value: 'withDone', label: 'الكل (شامل المنتهية)' },
];

const DAY_OPTIONS = [
  { value: '', label: 'حسب الإعدادات' },
  { value: '1440', label: 'يوم' },
  { value: '2880', label: 'يومان' },
  { value: '4320', label: '٣ أيام' },
  { value: '10080', label: 'أسبوع' },
];

const describeElapsed = (minutes: number) => {
  const days = Math.floor(minutes / 1440);
  if (days >= 1) return `${days} يوم`;
  const hours = Math.floor(minutes / 60);
  if (hours >= 1) return `${hours} ساعة`;

  return `${minutes} دقيقة`;
};

export default function DelayedOrdersPage() {
  const [status, setStatus] = useState('');
  const [minMinutes, setMinMinutes] = useState('');
  const [marks, setMarks] = useState<DelayedMarksMode>('default');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { getStatusLabel } = useStatusLabel();
  const { data: statuses } = useOrderStatusesQuery();
  const { mutate: mark } = useMarkDelayedOrder();

  const { data, isLoading } = useDelayedOrdersQuery({
    status: status || undefined,
    minMinutes: minMinutes ? Number(minMinutes) : undefined,
    marks,
    page: 1,
    limit: 50,
  });

  const orders = data?.data ?? [];

  return (
    <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            الطلبات المتأخرة
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            طلبات لم تتحرك من حالتها الحالية خلال المدة المحددة
          </p>
        </div>

        <Button
          variant="outline"
          className="w-fit rounded-full font-semibold flex items-center gap-2"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings2 className="w-4 h-4" />
          إعدادات التأخير
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="">كل الحالات</option>
          {(statuses?.allStatuses ?? []).map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={minMinutes}
          onChange={(e) => setMinMinutes(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
        >
          {DAY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {MARK_MODES.map((m) => (
            <Button
              key={m.value}
              variant={marks === m.value ? 'default' : 'outline'}
              size="sm"
              className="rounded-full text-xs px-3"
              onClick={() => setMarks(m.value)}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <PageLoading message="جاري تحميل الطلبات المتأخرة..." />
      ) : orders.length === 0 ? (
        // "Nothing is delayed" and "nothing is configured" look identical on an
        // empty page and mean completely different things.
        <p className="text-sm text-gray-500 text-center py-12">
          {data?.thresholdsConfigured === 0
            ? 'لم يتم ضبط أي مدة تأخير بعد — افتح إعدادات التأخير وحدد المدة لكل حالة'
            : 'لا توجد طلبات متأخرة'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
                  متأخر {describeElapsed(order.delayedMinutes)} في{' '}
                  {getStatusLabel(order.delayedInStatus)}
                </span>
                {order.marks.followedUp && (
                  <span className="bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                    تمت المتابعة
                  </span>
                )}
                {order.marks.done && (
                  <span className="bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full">
                    منتهي
                  </span>
                )}

                <div className="flex gap-2 mr-auto">
                  <Button
                    size="sm"
                    variant={order.marks.followedUp ? 'outline' : 'default'}
                    className="rounded-full text-xs px-4"
                    onClick={() =>
                      mark({
                        orderId: order.id,
                        kind: 'FOLLOWED_UP',
                        undo: !!order.marks.followedUp,
                      })
                    }
                  >
                    {order.marks.followedUp ? 'إلغاء المتابعة' : 'متابعة'}
                  </Button>
                  <Button
                    size="sm"
                    variant={order.marks.done ? 'outline' : 'default'}
                    className="rounded-full text-xs px-4"
                    onClick={() =>
                      mark({
                        orderId: order.id,
                        kind: 'DONE',
                        undo: !!order.marks.done,
                      })
                    }
                  >
                    {order.marks.done ? 'إلغاء الإنهاء' : 'انتهاء'}
                  </Button>
                </div>
              </div>

              {/* The All Orders card, reused rather than rebuilt. */}
              <OrderCard
                id={order.id}
                code={order.code}
                name={order.customers?.name ?? ''}
                phoneNumbers={order.customers?.phone_numbers ?? []}
                government={order.governorate ?? ''}
                city={order.city ?? ''}
                address={order.address ?? ''}
                items={(order.order_products ?? []).map((p) => p.products?.name ?? '')}
                productVariants={(order.order_products ?? []).map((op) =>
                  mapOrderProductToVariantInfo(op),
                )}
                price={order.totalCost}
                trys={order.numberOfTriesToReach ?? 0}
                alert={0}
                // This page is a work list: selection and bulk actions belong
                // to All Orders, and status changes stay on the order page.
                select={false}
                status={order.status}
                createdAt={order.createdAt}
                collectedAmount={order.collectedAmount}
                isCollected={order.isCollected}
                isPartiallyPaid={order.isPartiallyPaid}
                disableNavigation={false}
              />
            </div>
          ))}
        </div>
      )}

      <DelaySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
