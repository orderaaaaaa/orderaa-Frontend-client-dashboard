'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';
import { LiaPlusSolid, LiaWarehouseSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';
import PageLoading from '@/components/ui/page-loading';
import PaginationFooter from '@/components/ui/pagination-footer';
import {
  useWarehousesQuery,
  useDeleteWarehouseMutation,
  useWarehouseOptions,
} from '@/services/warehouses';
import type { WarehouseApiItem } from '@/lib/api/warehouses';
import { WarehouseTable } from './WarehouseTable';
import { WarehouseFormModal } from './WarehouseFormModal';

export function WarehousesTab() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseApiItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WarehouseApiItem | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { data, isLoading, isFetching, isError } = useWarehousesQuery({
    page,
    limit: pageSize,
  });
  const deleteMutation = useDeleteWarehouseMutation();

  const warehouses = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Parents must come from the FULL tree (limit 1000), not the current page —
  // otherwise editing a sub-warehouse whose parent lives on another page
  // renders a raw numeric id in the picker.
  const { rootOptions } = useWarehouseOptions();

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (warehouse: WarehouseApiItem) => {
    setEditing(warehouse);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      toast.success('تم حذف المخزن بنجاح');
      setPendingDelete(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر حذف المخزن'));
    }
  };

  if (isLoading) {
    return <PageLoading size="sm" className="min-h-0 py-10" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <LiaWarehouseSolid className="mb-4 size-16 text-red-300" />
        <p className="text-lg font-medium text-red-500">
          تعذر تحميل قائمة المخازن
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {data?.total ? `${data.total} مخزن` : 'لم تقم بإنشاء مخازن بعد'}
        </p>
        <Button className="rounded-full" onClick={openCreate}>
          <LiaPlusSolid className="ml-1 size-4" />
          إضافة مخزن
        </Button>
      </div>

      {warehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <LiaWarehouseSolid className="mb-4 size-16" />
          <p className="text-lg font-medium text-gray-500">لا توجد مخازن بعد</p>
          <p className="mt-1 text-sm text-gray-400">
            أنشئ مخزنًا لتتمكن من تتبع المخزون وتحديد قواعد حركته
          </p>
          <Button className="mt-4 rounded-full" onClick={openCreate}>
            <LiaPlusSolid className="ml-1 size-4" />
            أنشئ أول مخزن
          </Button>
        </div>
      ) : (
        <div
          className={`transition-opacity ${isFetching ? 'opacity-60' : ''}`}
        >
          <WarehouseTable
            warehouses={warehouses}
            onEdit={openEdit}
            onDelete={setPendingDelete}
          />
        </div>
      )}

      {!isLoading && !isError && totalPages > 1 && (
        <PaginationFooter
          currentPage={page}
          totalPages={totalPages}
          totalItems={data?.total ?? 0}
          hasNextPage={page < totalPages}
          hasPreviousPage={page > 1}
          onPageChange={setPage}
          onPrevious={() => setPage(Math.max(1, page - 1))}
          onNext={() => setPage(Math.min(totalPages, page + 1))}
          currentPageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}

      <WarehouseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        warehouse={editing}
        rootOptions={rootOptions}
      />

      <BaseModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="حذف المخزن"
        confirmText="حذف"
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        maxWidth="md:max-w-[460px]"
      >
        <p className="text-sm text-gray-600">
          هل أنت متأكد من حذف المخزن{' '}
          <span className="font-semibold text-gray-900">
            {pendingDelete?.name}
          </span>
          ؟ لا يمكن حذف مخزن يحتوي على مخزون أو له حركات مسجلة أو مستخدم في قواعد
          حركة المخزون.
        </p>
      </BaseModal>
    </div>
  );
}
