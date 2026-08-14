'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { LiaLockSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { getApiErrorMessage } from '@/utils/apiError';
import type {
  MerchantRoleSummary,
  PermissionCatalogGroup,
} from '@/lib/api/authorization';
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from '@/services/authorization';
import { PermissionSelector } from './PermissionSelector';
import { roleFormSchema, type RoleFormData } from '../schemas/role';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** `null` opens the create form. System roles open read-only. */
  role: MerchantRoleSummary | null;
  catalog: PermissionCatalogGroup[];
  isCatalogLoading: boolean;
}

const emptyValues: RoleFormData = { name: '', description: '' };

export function RoleFormModal({
  isOpen,
  onClose,
  role,
  catalog,
  isCatalogLoading,
}: RoleFormModalProps) {
  const isEdit = !!role;
  const isReadOnly = !!role?.isSystem;

  const [permissionCodes, setPermissionCodes] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: emptyValues,
  });

  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();

  useEffect(() => {
    if (!isOpen) return;
    if (role) {
      reset({ name: role.name, description: role.description ?? '' });
      setPermissionCodes(role.permissionCodes);
    } else {
      reset(emptyValues);
      setPermissionCodes([]);
    }
  }, [isOpen, role, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (permissionCodes.length === 0) {
      toast.error('اختر صلاحية واحدة على الأقل');
      return;
    }

    const body = {
      name: values.name,
      // '' (not undefined) so a description can actually be cleared.
      description: values.description ?? '',
      permissionCodes,
    };

    try {
      if (isEdit && role) {
        await updateMutation.mutateAsync({ id: role.id, body });
        toast.success('تم تحديث الدور بنجاح');
      } else {
        await createMutation.mutateAsync(body);
        toast.success('تم إنشاء الدور بنجاح');
      }
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ الدور'));
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const title = isReadOnly
    ? `صلاحيات دور ${role?.name}`
    : isEdit
      ? 'تعديل الدور'
      : 'إضافة دور';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      confirmText="حفظ"
      onConfirm={isReadOnly ? undefined : onSubmit}
      isLoading={isSaving}
      confirmDisabled={isCatalogLoading}
      cancelText={isReadOnly ? 'إغلاق' : 'إلغاء'}
      maxWidth="md:max-w-[900px]"
    >
      <div className="space-y-5">
        {isReadOnly && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <LiaLockSolid className="mt-0.5 size-4 shrink-0" />
            <p>
              هذا دور أساسي من النظام، يمكنك الاطلاع على صلاحياته فقط. لتخصيص
              صلاحيات مختلفة أنشئ دورًا جديدًا.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="اسم الدور"
            required
            name="name"
            register={register}
            error={errors.name?.message}
            placeholder="مثال: مشرف الشحن"
            disabled={isReadOnly}
          />
          <Input
            label="الوصف"
            name="description"
            register={register}
            error={errors.description?.message}
            placeholder="وصف مختصر لمهام الدور (اختياري)"
            disabled={isReadOnly}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              الصلاحيات <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-400">
              {permissionCodes.length} صلاحية محددة
            </span>
          </div>

          {isCatalogLoading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              جاري تحميل الصلاحيات...
            </p>
          ) : (
            <PermissionSelector
              catalog={catalog}
              selected={permissionCodes}
              onChange={setPermissionCodes}
              disabled={isReadOnly}
            />
          )}
        </div>
      </div>
    </BaseModal>
  );
}
