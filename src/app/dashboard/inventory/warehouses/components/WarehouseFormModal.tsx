'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';
import { useI18n } from '@/i18n/I18nProvider';
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
  isActive: true,
};

export function WarehouseFormModal({
  isOpen,
  onClose,
  warehouse,
  rootOptions,
}: WarehouseFormModalProps) {
  const isEdit = !!warehouse;
  const { t } = useI18n();

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
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const branch = watch('branch');
  const parentWarehouseId = watch('parentWarehouseId');
  const isActive = watch('isActive');
  const isSub = branch === WAREHOUSE_BRANCH.SUB;

  useEffect(() => {
    if (!isOpen) return;

    setDeactivateError(null);

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
        isActive: warehouse.isActive,
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

    setDeactivateError(null);

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
            parentWarehouseId: parentId,
          },
        });
        toast.success('تم تحديث المخزن بنجاح');
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          address: values.address ? values.address : undefined,
          isActive: values.isActive,
          parentWarehouseId: parentId ?? undefined,
        });
        toast.success('تم إنشاء المخزن بنجاح');
      }
      onClose();
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'تعذر حفظ المخزن');
      toast.error(message);
      // Only a deactivation attempt renders inline under the نشط switch —
      // an unrelated rejection (e.g. a parent-cycle 400) already has its own
      // field-level error and shouldn't also surface here. The toast above
      // still carries every error regardless.
      if (isEdit && values.isActive === false) setDeactivateError(message);
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

        {isEdit && (
          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">نشط</p>
              <FormSwitch
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              {t('warehouses.deactivateHint')}
            </p>
            {deactivateError && (
              <p className="mt-1.5 text-xs text-red-600">{deactivateError}</p>
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
