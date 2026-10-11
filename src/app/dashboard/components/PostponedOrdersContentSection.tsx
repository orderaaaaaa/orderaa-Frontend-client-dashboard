'use client';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { PostponedOrderContentItem } from '../types';
import { ErrorState } from '@/components/ui/state-panels';
import type { QuerySectionState } from '../hooks';

interface PostponedOrdersContentSectionProps {
  data: PostponedOrderContentItem[];
  isLoading: boolean;
  error?: QuerySectionState;
}

const columns: DataTableColumn<PostponedOrderContentItem>[] = [
  {
    key: 'productName',
    header: 'المنتج',
    render: (_value, row) => {
      const item = row as unknown as PostponedOrderContentItem;
      const variants = [item.variant1, item.variant2].filter(Boolean).join(' / ');
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{item.productName}</span>
          {variants && (
            <span className="text-sm text-gray-500">{variants}</span>
          )}
        </div>
      );
    },
  },
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
  error,
}: PostponedOrdersContentSectionProps) {
  if (error?.isError) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">محتوي الطلبات المؤجلة</h2>
        <ErrorState
          error={error.error}
          fallback="تعذّر تحميل محتوى الطلبات المؤجلة"
          onRetry={error.refetch}
        />
      </section>
    );
  }

  if (!isLoading && data.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">محتوي الطلبات المؤجلة</h2>
        <p className="py-12 text-center text-gray-500">لا توجد بيانات</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-primary">محتوي الطلبات المؤجلة</h2>
      <DataTable columns={columns} data={data} isLoading={isLoading} />
    </section>
  );
}
