'use client';

import { useParams } from 'next/navigation';
import useEmployeeById from './hooks/useEmployeeById';
import EmployeeForm from './components/EmployeeForm';
import useUpdateEmployee from './hooks/useUpdateEmployee';

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
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error?.message}</p>;
  if (!employee) return <p>No employee found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>
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
