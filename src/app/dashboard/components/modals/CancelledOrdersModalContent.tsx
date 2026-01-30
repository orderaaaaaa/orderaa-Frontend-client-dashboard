'use client';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { ColumnChart } from '@/components/ui/charts/ColumnChart';
import type { FollowUpModalData, CancelledOrderDetail } from '../../types';

interface CancelledOrdersModalContentProps {
  summaryData: FollowUpModalData[];
  orderDetails: CancelledOrderDetail[];
}

const summaryColumns: DataTableColumn<FollowUpModalData>[] = [
  {
    key: 'status',
    header: 'الحاله',
  },
  {
    key: 'count',
    header: 'العدد',
  },
  {
    key: 'percentage',
    header: 'النسبه',
  },
];

const orderDetailsColumns: DataTableColumn<CancelledOrderDetail>[] = [
  {
    key: 'orderCode',
    header: 'كود الطلب',
    className: 'font-medium',
  },
  {
    key: 'customerName',
    header: 'اسم العميل',
  },
  {
    key: 'cancelReason',
    header: 'سبب الالغاء',
  },
  {
    key: 'notes',
    header: 'الملاحظات',
    className: 'text-gray-600',
  },
];

export function CancelledOrdersModalContent({
  summaryData,
  orderDetails,
}: CancelledOrdersModalContentProps) {
  return (
    <div className="space-y-6">
      <DataTable
        columns={summaryColumns}
        data={summaryData}
        keyField="id"
        headerClassName="bg-[#E5E5E5]"
      />
      <ColumnChart
        categories={summaryData.map((item) => item.status)}
        series={[
          {
            name: 'العدد',
            data: summaryData.map((item) => item.count),
          },
        ]}
        height={300}
      />
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          تفاصيل الطلبات الملغاة
        </h3>
        <DataTable
          columns={orderDetailsColumns}
          data={orderDetails}
          keyField="id"
          headerClassName="bg-[#E5E5E5]"
        />
      </div>
    </div>
  );
}
