'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
  LiaBoxesSolid,
  LiaEditSolid,
  LiaLayerGroupSolid,
  LiaPlusSolid,
  LiaTrashSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { useHasPermission } from '@/hooks/usePermissions';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { PERMISSION_CODES } from '@/lib/permissions';
import type { VirtualWarehouse } from '@/lib/api/virtualWarehouses';
import {
  useDeleteVirtualWarehouseMutation,
  useVirtualWarehousesQuery,
} from '@/services/virtualWarehouses';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatVirtualFormula } from '../utils/formatVirtualFormula';
import { VirtualWarehouseFormModal } from './VirtualWarehouseFormModal';

type VirtualWarehouseRow = VirtualWarehouse & Record<string, unknown>;

export interface VirtualWarehouseFormState {
  isOpen: boolean;
  warehouse: VirtualWarehouse | null;
}

export function VirtualWarehousesTab() {
  const canManage = useHasPermission(PERMISSION_CODES.VIRTUAL_WAREHOUSES_MANAGE);
  const { getStatusLabel } = useStatusLabel();
  const { data, isLoading, isFetching, isError, refetch } =
    useVirtualWarehousesQuery();
  const deleteMutation = useDeleteVirtualWarehouseMutation();

  const [formState, setFormState] = useState<VirtualWarehouseFormState>({
    isOpen: false,
    warehouse: null,
  });
  const [pendingDelete, setPendingDelete] = useState<VirtualWarehouse | null>(
    null
  );

  const openCreate = () => setFormState({ isOpen: true, warehouse: null });
  const openEdit = (warehouse: VirtualWarehouse) =>
    setFormState({ isOpen: true, warehouse });

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      toast.success('تم حذف المخزن الافتراضي');
      setPendingDelete(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر حذف المخزن الافتراضي'));
    }
  };

  const columns = useMemo<DataTableColumn<VirtualWarehouseRow>[]>(
    () => [
      {
        key: 'name',
        header: 'الاسم',
        className: 'text-right font-semibold text-gray-900',
      },
      {
        key: 'terms',
        header: 'المعادلة',
        className: 'text-right text-sm text-gray-700',
        render: (_val, row) => formatVirtualFormula(row.terms, getStatusLabel),
      },
      {
        key: 'isActive',
        header: 'الحالة',
        className: 'text-center',
        render: (_val, row) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              row.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {row.isActive ? 'نشط' : 'غير نشط'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'الإجراءات',
        className: 'text-center',
        render: (_val, row) => (
          <div className="flex items-center justify-center gap-1">
            <Button variant="ghost" size="sm" asChild className="text-primary">
              <Link
                href={`/dashboard/inventory/stock-management/virtual/${row.id}`}
              >
                <LiaBoxesSolid className="ml-1 size-4" />
                عرض المخزون
              </Link>
            </Button>
            {canManage && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => openEdit(row)}
                >
                  <LiaEditSolid className="ml-1 size-4" />
                  تعديل
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setPendingDelete(row)}
                >
                  <LiaTrashSolid className="ml-1 size-4" />
                  حذف
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [canManage, getStatusLabel]
  );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <LiaLayerGroupSolid className="mb-4 size-16 text-red-300" />
        <p className="text-lg font-medium text-red-500">
          تعذر تحميل المخازن الافتراضية
        </p>
        <Button
          variant="outline"
          className="mt-4 rounded-full"
          onClick={() => refetch()}
        >
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const warehouses = (data ?? []) as VirtualWarehouseRow[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          مخازن محسوبة من أرصدة المخازن وحالات الطلبات، لا تحتفظ بمخزون فعلي
        </p>
        {canManage && (
          <Button className="rounded-full" onClick={openCreate}>
            <LiaPlusSolid className="ml-1 size-4" />
            إضافة مخزن افتراضي
          </Button>
        )}
      </div>

      {!isLoading && warehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <LiaLayerGroupSolid className="mb-4 size-16" />
          <p className="text-lg font-medium text-gray-500">
            لا توجد مخازن افتراضية بعد
          </p>
          {canManage && (
            <Button className="mt-4 rounded-full" onClick={openCreate}>
              <LiaPlusSolid className="ml-1 size-4" />
              إضافة مخزن افتراضي
            </Button>
          )}
        </div>
      ) : (
        <div className={`transition-opacity ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
          <DataTable<VirtualWarehouseRow>
            columns={columns}
            data={warehouses}
            isLoading={isLoading}
            skeletonRows={3}
          />
        </div>
      )}

      <VirtualWarehouseFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, warehouse: null })}
        warehouse={formState.warehouse}
      />

      <BaseModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="حذف المخزن الافتراضي"
        confirmText="حذف"
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        maxWidth="md:max-w-[460px]"
      >
        <p className="text-sm text-gray-600">
          هل أنت متأكد من حذف المخزن الافتراضي{' '}
          <span className="font-semibold text-gray-900">
            {pendingDelete?.name}
          </span>
          ؟ لا يؤثر الحذف على أرصدة المخازن الفعلية.
        </p>
      </BaseModal>
    </div>
  );
}
