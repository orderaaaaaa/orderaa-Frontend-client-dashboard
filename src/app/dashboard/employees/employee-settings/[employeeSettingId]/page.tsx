'use client';

import { useParams } from 'next/navigation';
import useEmployeeById from './hooks/useEmployeeById';
import EmployeeForm from './components/EmployeeForm';
import useUpdateEmployee from './hooks/useUpdateEmployee';
import { useAuthStore } from '@/store/authStore';

export default function Page() {
  const { employeeSettingId } = useParams<{ employeeSettingId: string }>();
  const {
    data: employee,
    isLoading,
    isError,
    error,
  } = useEmployeeById(employeeSettingId);
  const { mutate: updateEmployee, isPending } = useUpdateEmployee();

  if (!employeeSettingId) return <p>Invalid employee ID</p>;
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64 mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  if (isError) return <p>Error: {error?.message}</p>;
  if (!employee) return <p>No employee found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">تعديل بيانات الموظف</h1>
      <EmployeeForm
        employee={employee}
        onSubmit={(data) =>
          updateEmployee({ id: employeeSettingId, updates: data })
        }
        isLoading={isPending}
      />
    </div>
  );
}
