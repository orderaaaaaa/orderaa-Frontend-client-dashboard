'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { LiaLockSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/state-panels';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
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
  catalogError?: unknown;
  onRetryCatalog?: () => void;
}

const emptyValues: RoleFormData = { name: '', description: '' };

const EMPTY_PERMISSIONS_MESSAGE = 'اختر صلاحية واحدة على الأقل';

const sameCodes = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((code) => set.has(code));
};

export function RoleFormModal({
  isOpen,
  onClose,
  role,
  catalog,
  isCatalogLoading,
  catalogError,
  onRetryCatalog,
}: RoleFormModalProps) {
  const isEdit = !!role;
  const isReadOnly = !!role?.isSystem;

  const [permissionCodes, setPermissionCodes] = useState<string[]>([]);
  const [initialCodes, setInitialCodes] = useState<string[]>([]);
  const [permissionsError, setPermissionsError] = useState<string | null>(
    null
  );
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const permissionsErrorRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: emptyValues,
  });

  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();

  useEffect(() => {
    if (!isOpen) return;
    setPermissionsError(null);
    setIsDiscardOpen(false);
    if (role) {
      reset({ name: role.name, description: role.description ?? '' });
      setPermissionCodes(role.permissionCodes);
      setInitialCodes(role.permissionCodes);
    } else {
      reset(emptyValues);
      setPermissionCodes([]);
      setInitialCodes([]);
    }
  }, [isOpen, role, reset]);

  const handlePermissionsChange = (next: string[]) => {
    setPermissionCodes(next);
    if (next.length > 0) setPermissionsError(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (permissionCodes.length === 0) {
      setPermissionsError(EMPTY_PERMISSIONS_MESSAGE);
      requestAnimationFrame(() =>
        permissionsErrorRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      );
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
  const hasUnsavedChanges =
    !isReadOnly && (isDirty || !sameCodes(permissionCodes, initialCodes));

  const requestClose = () => {
    if (isSaving) return;
    if (hasUnsavedChanges) {
      setIsDiscardOpen(true);
      return;
    }
    onClose();
  };

  const discardChanges = () => {
    setIsDiscardOpen(false);
    onClose();
  };

  const isCatalogUnavailable = isCatalogLoading || catalogError != null;

  const title = isReadOnly
    ? `صلاحيات دور ${role?.name}`
    : isEdit
      ? 'تعديل الدور'
      : 'إضافة دور';

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={requestClose}
        title={title}
        confirmText="حفظ"
        onConfirm={isReadOnly ? undefined : onSubmit}
        isLoading={isSaving}
        confirmDisabled={isCatalogUnavailable}
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
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-700">
                الصلاحيات <span className="text-red-500">*</span>
              </span>
              <span className="text-xs text-gray-500">
                {permissionCodes.length} صلاحية محددة
              </span>
            </div>

            {permissionsError && (
              <p
                ref={permissionsErrorRef}
                role="alert"
                className="mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
              >
                {permissionsError}
              </p>
            )}

            {isCatalogLoading ? (
              <p className="py-8 text-center text-sm text-gray-500">
                جاري تحميل الصلاحيات...
              </p>
            ) : catalogError != null ? (
              <ErrorState
                error={catalogError}
                fallback="تعذر تحميل قائمة الصلاحيات"
                onRetry={onRetryCatalog}
                className="py-8"
              />
            ) : (
              <PermissionSelector
                catalog={catalog}
                selected={permissionCodes}
                onChange={handlePermissionsChange}
                disabled={isReadOnly}
              />
            )}
          </div>
        </div>
      </BaseModal>

      <UnsavedChangesDialog
        isOpen={isDiscardOpen}
        onStay={() => setIsDiscardOpen(false)}
        onLeave={discardChanges}
        message="إذا أغلقت النافذة الآن ستفقد التعديلات التي لم تحفظها على هذا الدور."
        leaveText="تجاهل"
      />
    </>
  );
}
