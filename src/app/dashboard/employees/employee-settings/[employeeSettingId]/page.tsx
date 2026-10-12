'use client';

import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import PageLoading from '@/components/ui/page-loading';
import { ErrorState } from '@/components/ui/state-panels';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';
import { useReplaceEmployeeRolesMutation } from '@/services/authorization';
import { getApiErrorMessage } from '@/utils/apiError';
import useEmployeeById from './hooks/useEmployeeById';
import EmployeeForm from './components/EmployeeForm';
import useUpdateEmployee from './hooks/useUpdateEmployee';
import type { Employee } from './types/employee';

/** Order-insensitive comparison of the assigned role sets. */
const sameRoleSet = (current: number[], next: number[]) =>
  current.length === next.length &&
  [...current].sort().join(',') === [...next].sort().join(',');

export default function Page() {
  const { employeeSettingId } = useParams<{ employeeSettingId: string }>();
  const {
    data: employee,
    isLoading,
    isError,
    error,
    refetch,
  } = useEmployeeById(employeeSettingId);
  const { mutate: updateEmployee, isPending } = useUpdateEmployee();
  const replaceRoles = useReplaceEmployeeRolesMutation();

  const { hasAllPermissions } = usePermissionCheck();
  const canAssignRoles = hasAllPermissions([
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_ASSIGN,
  ]);

  if (!employeeSettingId) {
    return <p className="p-6 text-gray-600">رابط الموظف غير صالح</p>;
  }
  if (isLoading) return <PageLoading className="h-64 mt-10" />;
  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState
          error={error}
          fallback="تعذّر تحميل بيانات الموظف"
          onRetry={() => refetch()}
        />
      </div>
    );
  }
  if (!employee) return <p className="p-6 text-gray-600">لم يتم العثور على الموظف</p>;

  const handleSubmit = async (
    data: Partial<Employee>,
    roleIds: number[],
    rolesDirty: boolean,
  ) => {
    const currentRoleIds = employee.roles?.map((role) => role.id) ?? [];
    let rolesSaved = false;

    if (canAssignRoles && rolesDirty && !sameRoleSet(currentRoleIds, roleIds)) {
      try {
        await replaceRoles.mutateAsync({
          employeeId: Number(employeeSettingId),
          roleIds,
        });
        rolesSaved = true;
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, 'تعذر تحديث أدوار الموظف'));
        return;
      }
    }

    updateEmployee({ id: employeeSettingId, updates: data, rolesSaved });
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">تعديل بيانات الموظف</h1>
      <EmployeeForm
        employee={employee}
        onSubmit={handleSubmit}
        isLoading={isPending || replaceRoles.isPending}
      />
    </div>
  );
}
