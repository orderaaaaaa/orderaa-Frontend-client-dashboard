'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { LiaPlusSolid, LiaUndoSolid, LiaUserShieldSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BaseModal from '@/components/ui/base-modal';
import PageLoading from '@/components/ui/page-loading';
import { Can } from '@/components/Can';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';
import { getApiErrorMessage } from '@/utils/apiError';
import type { MerchantRoleSummary } from '@/lib/api/authorization';
import {
  useDeleteRoleMutation,
  usePermissionCatalogQuery,
  useResetAllRolesMutation,
  useResetRoleToTemplateMutation,
  useRolesQuery,
} from '@/services/authorization';
import { RolesTable } from './RolesTable';
import { RoleFormModal } from './RoleFormModal';

export function RolesContent() {
  const canReadRoles = useHasPermission(PERMISSIONS.ROLES_READ);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<MerchantRoleSummary | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MerchantRoleSummary | null>(
    null
  );
  /** Flipped by a 409 from the backend: the role is still assigned. */
  const [forceDelete, setForceDelete] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [pendingReset, setPendingReset] = useState<MerchantRoleSummary | null>(
    null
  );
  const [isResetAllOpen, setIsResetAllOpen] = useState(false);

  const {
    data: roles = [],
    isLoading,
    isError,
  } = useRolesQuery(canReadRoles);
  const { data: catalog = [], isLoading: isCatalogLoading } =
    usePermissionCatalogQuery(canReadRoles);
  const deleteMutation = useDeleteRoleMutation();
  const resetMutation = useResetRoleToTemplateMutation();
  const resetAllMutation = useResetAllRolesMutation();
  const customRolesWithoutLock = roles.filter(
    (role) =>
      !role.isSystem &&
      role.templateKey === null &&
      !role.permissionCodes.includes(PERMISSIONS.ORDERS_LOCK_ACQUIRE)
  );

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (role: MerchantRoleSummary) => {
    setEditing(role);
    setIsFormOpen(true);
  };

  const openDelete = (role: MerchantRoleSummary) => {
    setForceDelete(false);
    setConflictMessage(null);
    setPendingDelete(role);
  };

  const closeDelete = () => {
    setPendingDelete(null);
    setForceDelete(false);
    setConflictMessage(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync({
        id: pendingDelete.id,
        force: forceDelete,
      });
      toast.success('تم حذف الدور بنجاح');
      closeDelete();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;

      // 409 = still assigned to employees. Keep the dialog open and offer the
      // force path, which also unassigns them.
      if (status === 409 && !forceDelete) {
        setForceDelete(true);
        setConflictMessage(
          getApiErrorMessage(err, 'هذا الدور مسند إلى موظفين حاليًا')
        );
        return;
      }

      toast.error(getApiErrorMessage(err, 'تعذر حذف الدور'));
    }
  };

  const confirmReset = async () => {
    if (!pendingReset) return;
    try {
      await resetMutation.mutateAsync(pendingReset.id);
      toast.success('تمت إعادة الدور للقالب');
      setPendingReset(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذرت إعادة التعيين'));
    }
  };

  const confirmResetAll = async () => {
    try {
      const result = await resetAllMutation.mutateAsync();
      toast.success(
        `تمت إعادة تعيين ${result.resetRoleIds.length} دور وإنشاء ${result.createdRoleIds.length} دور`
      );
      if (result.skippedRoleIds.length > 0) {
        toast.warn('بعض الأدوار لم تتم إعادتها لأن قوالبها لم تعد متاحة');
      }
      if (result.nameConflicts.length > 0) {
        const list = result.nameConflicts
          .map(
            (conflict) =>
              `${conflict.roleName} («${conflict.conflictingRoleName}»)`
          )
          .join('، ');
        toast.warn(
          `لم تتم إعادة ${result.nameConflicts.length} دور لأن أسماء قوالبها مستخدمة: ${list}`
        );
      }
      setIsResetAllOpen(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذرت إعادة التعيين'));
    }
  };

  if (!canReadRoles) {
    return (
      <div className="w-full max-w-full overflow-x-hidden p-4">
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <LiaUserShieldSolid className="mb-4 size-16" />
          <p className="text-lg font-medium text-gray-500">
            ليس لديك صلاحية لعرض الأدوار
          </p>
          <p className="mt-1 text-sm text-gray-400">
            تواصل مع صاحب الحساب لمنحك صلاحية إدارة الأدوار.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">
          الأدوار والصلاحيات
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          أنشئ أدوارًا تحدد ما يستطيع كل موظف رؤيته والقيام به، ثم أسندها للموظفين
          من صفحة بيانات الموظف.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <PageLoading size="sm" className="min-h-0 py-10" />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <LiaUserShieldSolid className="mb-4 size-16 text-red-300" />
              <p className="text-lg font-medium text-red-500">
                تعذر تحميل قائمة الأدوار
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {roles.length ? `${roles.length} دور` : 'لا توجد أدوار بعد'}
                </p>
                <div className="flex items-center gap-2">
                  <Can code={PERMISSIONS.ROLES_CREATE}>
                    <Button className="rounded-full" onClick={openCreate}>
                      <LiaPlusSolid className="ml-1 size-4" />
                      إضافة دور
                    </Button>
                  </Can>
                  {roles.length > 0 && (
                    <Can code={PERMISSIONS.ROLES_UPDATE}>
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setIsResetAllOpen(true)}
                      >
                        <LiaUndoSolid className="ml-1 size-4" />
                        إعادة تعيين الكل
                      </Button>
                    </Can>
                  )}
                </div>
              </div>

              {customRolesWithoutLock.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                  <p>
                    صلاحية «قفل الطلب عند فتحه» جديدة. الأدوار المخصصة لا تحصل
                    عليها تلقائيًا، لذلك لن يقفل موظفوها الطلبات حتى تفعّلها
                    لهم.
                  </p>
                  <p className="mt-1 text-sm">
                    {customRolesWithoutLock
                      .map((role) => role.name)
                      .join('، ')}
                  </p>
                </div>
              )}

              {roles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <LiaUserShieldSolid className="mb-4 size-16" />
                  <p className="text-lg font-medium text-gray-500">
                    لا توجد أدوار بعد
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    أنشئ دورًا وحدد صلاحياته لتتمكن من إسناده للموظفين
                  </p>
                  <Can code={PERMISSIONS.ROLES_CREATE}>
                    <Button className="mt-4 rounded-full" onClick={openCreate}>
                      <LiaPlusSolid className="ml-1 size-4" />
                      أنشئ أول دور
                    </Button>
                  </Can>
                </div>
              ) : (
                <RolesTable
                  roles={roles}
                  onEdit={openEdit}
                  onDelete={openDelete}
                  onReset={setPendingReset}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <RoleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        role={editing}
        catalog={catalog}
        isCatalogLoading={isCatalogLoading}
      />

      <BaseModal
        isOpen={!!pendingDelete}
        onClose={closeDelete}
        title="حذف الدور"
        confirmText={forceDelete ? 'حذف وإلغاء الإسناد' : 'حذف'}
        confirmButtonClassName="bg-red-600 hover:bg-red-700 w-[170px] h-[33px] sm:w-[200px] sm:h-[37px] border-[1.5px] border-red-600 rounded-[28px] flex items-center justify-center"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        maxWidth="md:max-w-[460px]"
      >
        <div className="space-y-3 text-sm">
          <p className="text-gray-600">
            هل أنت متأكد من حذف الدور{' '}
            <span className="font-semibold text-gray-900">
              {pendingDelete?.name}
            </span>
            ؟
          </p>

          {conflictMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <p>{conflictMessage}</p>
              <p className="mt-1 text-xs text-red-600">
                المتابعة ستحذف الدور وتلغي إسناده من هؤلاء الموظفين، وقد تفقدهم
                صلاحيات يعتمدون عليها.
              </p>
            </div>
          ) : (
            pendingDelete !== null &&
            pendingDelete.assigneeCount > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                هذا الدور مسند حاليًا إلى {pendingDelete.assigneeCount} موظف.
              </div>
            )
          )}
        </div>
      </BaseModal>

      <BaseModal
        isOpen={!!pendingReset}
        onClose={() => setPendingReset(null)}
        title="إعادة الدور للقالب"
        confirmText="إعادة للقالب"
        onConfirm={confirmReset}
        isLoading={resetMutation.isPending}
        maxWidth="md:max-w-[460px]"
      >
        <p className="text-sm text-gray-600">
          سيتم استبدال اسم الدور{' '}
          <span className="font-semibold text-gray-900">
            {pendingReset?.name}
          </span>{' '}
          ووصفه وصلاحياته بما في القالب الأصلي. سيتم فقدان أي تعديل قمت به على
          هذا الدور.
        </p>
      </BaseModal>

      <BaseModal
        isOpen={isResetAllOpen}
        onClose={() => setIsResetAllOpen(false)}
        title="إعادة تعيين كل الأدوار"
        confirmText="إعادة تعيين الكل"
        onConfirm={confirmResetAll}
        isLoading={resetAllMutation.isPending}
        maxWidth="md:max-w-[460px]"
      >
        <p className="text-sm text-gray-600">
          سيتم إرجاع اسم ووصف وصلاحيات كل الأدوار المأخوذة من القوالب إلى
          القالب، وإعادة إنشاء الأدوار الافتراضية المحذوفة. الأدوار المخصصة لن
          تتغير.
        </p>
      </BaseModal>
    </div>
  );
}
