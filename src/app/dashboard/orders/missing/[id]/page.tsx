'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb } from '@/components/dashboard-layout';
import PageLoading from '@/components/ui/page-loading';
import { Button } from '@/components/ui/button';
import { useMissingOrderQuery } from '@/services/missingOrders';
import { MISSING_ORDER_STATUS_LABELS } from '@/constants/missingOrders';
import { MissingOrderHeader } from './components/MissingOrderHeader';
import { RawStoreDataCard } from './components/RawStoreDataCard';
import { RecoverOrderForm } from './components/RecoverOrderForm';

export default function MissingOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: row, isLoading, isError, error, refetch } = useMissingOrderQuery(id);

  if (isLoading) {
    return <PageLoading message="جاري التحميل..." />;
  }

  const status = (error as any)?.response?.status;

  if (isError && status === 404) {
    return (
      <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4">
        <p className="text-sm text-gray-500 text-center py-12">هذا الطلب غير موجود</p>
      </div>
    );
  }

  if (isError || !row) {
    return (
      <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-12 flex flex-col items-center gap-3">
        <p className="text-sm text-gray-500">تعذر تحميل الطلب</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
      <Breadcrumb
        items={[
          { title: 'الطلبات' },
          { title: 'قائمة المفقودات', href: '/dashboard/orders/missing' },
          { title: 'استعادة طلب مفقود' },
        ]}
      />

      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">استعادة طلب مفقود</h1>
      </div>

      <MissingOrderHeader row={row} />
      <RawStoreDataCard row={row} />

      {row.status === 'OPEN' ? (
        <RecoverOrderForm id={id} row={row} />
      ) : (
        <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
          <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm flex flex-col gap-3">
            <div>
              <span className="block text-xs text-gray-500">الحالة</span>
              <span className="font-semibold">{MISSING_ORDER_STATUS_LABELS[row.status]}</span>
            </div>
            {row.handledBy && (
              <div>
                <span className="block text-xs text-gray-500">تمت المعالجة بواسطة</span>
                <span className="font-semibold">{row.handledBy.name ?? '—'}</span>
              </div>
            )}
            {row.recoveredOrder && (
              <div>
                <span className="block text-xs text-gray-500">الطلب</span>
                <Link
                  href={`/dashboard/orders/allOrders?search=${row.recoveredOrder.code}`}
                  className="text-primary hover:underline font-semibold"
                >
                  {row.recoveredOrder.code}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
