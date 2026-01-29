'use client';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { ColumnChart } from '@/components/ui/charts/ColumnChart';
import type { FollowUpModalData } from '../../types';

interface OrderStatusModalContentProps {
  data: FollowUpModalData[];
}

const columns: DataTableColumn<FollowUpModalData>[] = [
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

export function OrderStatusModalContent({
  data,
}: OrderStatusModalContentProps) {
  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        data={data}
        keyField="id"
        headerClassName="bg-[#E5E5E5]"
      />
      <ColumnChart
        categories={data.map((item) => item.status)}
        series={[
          {
            name: 'العدد',
            data: data.map((item) => item.count),
          },
        ]}
        height={300}
      />
    </div>
  );
}
