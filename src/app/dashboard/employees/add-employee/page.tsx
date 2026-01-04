'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  employeeSchema,
  type EmployeeFormData,
} from '@/schemas/employee.schema';
import { useCreateEmployee } from './hooks/useCreateEmployee';
import EmployeeFormHeader from './components/EmployeeFormHeader';
import EmployeeFormFields from './components/EmployeeFormFields';
import { useRouter } from 'next/navigation';

export default function EmployeesPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const createEmployee = useCreateEmployee();
  const router = useRouter();

  const onSubmit = (data: EmployeeFormData) => {
    createEmployee.mutate(data, {
      onSuccess: () => {
        reset();
        router.push('/dashboard/employees');
      },
    });
  };

  return (
    <div
      className="w-full max-w-[1242px] mx-auto px-4 md:px-6 lg:px-0"
      dir="rtl"
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ direction: 'rtl' }}>
        <div className="bg-white border border-black/8 shadow-[0px_4px_22px_rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
          <EmployeeFormHeader />
          <EmployeeFormFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>

        <div className="w-full flex flex-row items-center justify-center sm:justify-start gap-4 mt-4 md:mt-6">
          <button
            type="submit"
            disabled={createEmployee.isPending}
            className="w-auto px-4 sm:px-8 py-1 bg-primary cursor-pointer rounded-full text-white text-base md:text-lg font-semibold hover:bg-[#682fee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>
              {createEmployee.isPending ? 'جاري الإضافة...' : 'إضافة موظف جديد'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
