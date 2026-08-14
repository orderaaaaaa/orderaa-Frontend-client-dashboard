'use client';

import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import PageLoading from '@/components/ui/page-loading';
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
  } = useEmployeeById(employeeSettingId);
  const { mutate: updateEmployee, isPending } = useUpdateEmployee();
  const replaceRoles = useReplaceEmployeeRolesMutation();

  const { hasAllPermissions } = usePermissionCheck();
  const canAssignRoles = hasAllPermissions([
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_ASSIGN,
  ]);

  if (!employeeSettingId) return <p>Invalid employee ID</p>;
  if (isLoading) return <PageLoading className="h-64 mt-10" />;
  if (isError) return <p>Error: {error?.message}</p>;
  if (!employee) return <p>No employee found</p>;

  // Roles live on their own endpoint (PUT /employees/:id/roles) and are only
  // sent when they actually changed; the profile PATCH runs afterwards because
  // it redirects away on success.
  const handleSubmit = async (data: Partial<Employee>, roleIds: number[]) => {
    const currentRoleIds = employee.roles?.map((role) => role.id) ?? [];

    if (canAssignRoles && !sameRoleSet(currentRoleIds, roleIds)) {
      try {
        await replaceRoles.mutateAsync({
          employeeId: Number(employeeSettingId),
          roleIds,
        });
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, 'تعذر تحديث أدوار الموظف'));
        return;
      }
    }

    updateEmployee({ id: employeeSettingId, updates: data });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">تعديل بيانات الموظف</h1>
      <EmployeeForm
        employee={employee}
        onSubmit={handleSubmit}
        isLoading={isPending || replaceRoles.isPending}
      />
    </div>
  );
}
