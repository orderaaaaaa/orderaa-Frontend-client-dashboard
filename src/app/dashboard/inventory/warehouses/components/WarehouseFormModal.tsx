'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { FormSwitch } from '@/components/ui/form-switch';
import {
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  type WarehouseOption,
} from '@/services/warehouses';
import type { WarehouseApiItem } from '@/lib/api/warehouses';
import {
  warehouseFormSchema,
  WAREHOUSE_BRANCH,
  type WarehouseFormData,
} from '../schemas';
import { WAREHOUSE_BRANCH_OPTIONS } from '../constants';

interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse?: WarehouseApiItem | null;
  rootOptions: WarehouseOption[];
}

const emptyValues: WarehouseFormData = {
  name: '',
  branch: WAREHOUSE_BRANCH.MAIN,
  parentWarehouseId: '',
  address: '',
  isDefault: false,
  isActive: true,
  countsAsAvailable: true,
};

export function WarehouseFormModal({
  isOpen,
  onClose,
  warehouse,
  rootOptions,
}: WarehouseFormModalProps) {
  const isEdit = !!warehouse;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: emptyValues,
  });

  const createMutation = useCreateWarehouseMutation();
  const updateMutation = useUpdateWarehouseMutation();

  const branch = watch('branch');
  const parentWarehouseId = watch('parentWarehouseId');
  const isDefault = watch('isDefault');
  const isActive = watch('isActive');
  const countsAsAvailable = watch('countsAsAvailable');
  const isSub = branch === WAREHOUSE_BRANCH.SUB;

  useEffect(() => {
    if (!isOpen) return;

    if (warehouse) {
      reset({
        name: warehouse.name,
        branch: warehouse.parentWarehouseId
          ? WAREHOUSE_BRANCH.SUB
          : WAREHOUSE_BRANCH.MAIN,
        parentWarehouseId: warehouse.parentWarehouseId
          ? String(warehouse.parentWarehouseId)
          : '',
        address: warehouse.address ?? '',
        isDefault: warehouse.isDefault,
        isActive: warehouse.isActive,
        countsAsAvailable: warehouse.countsAsAvailable,
      });
    } else {
      reset(emptyValues);
    }
  }, [isOpen, warehouse, reset]);

  const parentOptions = rootOptions.filter(
    (option) => option.key !== String(warehouse?.id)
  );

  const onSubmit = handleSubmit(async (values) => {
    const parentId =
      values.branch === WAREHOUSE_BRANCH.SUB && values.parentWarehouseId
        ? Number(values.parentWarehouseId)
        : null;

    try {
      if (isEdit && warehouse) {
        await updateMutation.mutateAsync({
          id: warehouse.id,
          body: {
            name: values.name,
            // '' (not undefined) so an address can actually be cleared —
            // undefined means "leave unchanged" on the backend.
            address: values.address ?? '',
            isActive: values.isActive,
            isDefault: parentId ? false : values.isDefault,
            countsAsAvailable: values.countsAsAvailable,
            parentWarehouseId: parentId,
          },
        });
        toast.success('تم تحديث المخزن بنجاح');
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          address: values.address ? values.address : undefined,
          isActive: values.isActive,
          isDefault: parentId ? false : values.isDefault,
          countsAsAvailable: values.countsAsAvailable,
          parentWarehouseId: parentId ?? undefined,
        });
        toast.success('تم إنشاء المخزن بنجاح');
      }
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ المخزن'));
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'تعديل المخزن' : 'إضافة مخزن'}
      confirmText="حفظ"
      onConfirm={onSubmit}
      isLoading={isSaving}
      maxWidth="md:max-w-[560px]"
    >
      <div className="space-y-4">
        <Input
          label="اسم المخزن"
          required
          name="name"
          register={register}
          error={errors.name?.message}
          placeholder="مثال: المخزن الرئيسي"
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            فرع المخزن <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={WAREHOUSE_BRANCH_OPTIONS}
            value={branch}
            onValueChange={(next) => {
              setValue('branch', next as 'main' | 'sub', {
                shouldValidate: true,
              });
              if (next === WAREHOUSE_BRANCH.MAIN) {
                setValue('parentWarehouseId', '', { shouldValidate: true });
              } else {
                setValue('isDefault', false);
              }
            }}
            placeholder="اختر نوع الفرع"
            error={errors.branch?.message}
          />
        </div>

        {isSub && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              المخزن الرئيسي <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={parentOptions}
              value={parentWarehouseId ?? ''}
              onValueChange={(next) =>
                setValue('parentWarehouseId', next, { shouldValidate: true })
              }
              placeholder="اختر المخزن الرئيسي"
              emptyMessage="لا توجد مخازن رئيسية"
              error={errors.parentWarehouseId?.message}
            />
          </div>
        )}

        <Input
          label="العنوان"
          name="address"
          register={register}
          error={errors.address?.message}
          placeholder="عنوان المخزن (اختياري)"
        />

        {!isSub && (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">
                المخزن الافتراضي
              </p>
              <p className="text-xs text-gray-400">
                يستقبل الوارد من الموردين عند عدم تحديد مخزن
              </p>
            </div>
            <FormSwitch
              checked={isDefault}
              onCheckedChange={(checked) => setValue('isDefault', checked)}
            />
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-700">
              يُحتسب ضمن المخزون المتاح
            </p>
            <p className="text-xs text-gray-400">
              أوقفه لمخازن المُسلَّم والمرتجعات حتى لا تُحتسب كمياتها ضمن
              المخزون القابل للبيع
            </p>
          </div>
          <FormSwitch
            checked={countsAsAvailable}
            onCheckedChange={(checked) =>
              setValue('countsAsAvailable', checked)
            }
          />
        </div>

        {isEdit && (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <p className="text-sm font-medium text-gray-700">نشط</p>
            <FormSwitch
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>
        )}
      </div>
    </BaseModal>
  );
}
