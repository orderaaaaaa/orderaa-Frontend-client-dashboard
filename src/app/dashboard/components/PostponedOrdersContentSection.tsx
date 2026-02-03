'use client';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { PostponedOrderContentItem } from '../types';

interface PostponedOrdersContentSectionProps {
  data: PostponedOrderContentItem[];
  isLoading: boolean;
}

const columns: DataTableColumn<PostponedOrderContentItem>[] = [
  { key: 'productName', header: 'اسم المنتج' },
  { key: 'variant1', header: 'متغير 1' },
  { key: 'variant2', header: 'متغير 2' },
  { key: 'quantity', header: 'عدد القطع' },
  {
    key: 'percentage',
    header: 'النسبه %',
    render: (value) => `${value}%`,
  },
];

export function PostponedOrdersContentSection({
  data,
  isLoading,
}: PostponedOrdersContentSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-primary">محتوي الطلبات المؤجلة</h2>
      <DataTable columns={columns} data={data} isLoading={isLoading} />
    </section>
  );
}
