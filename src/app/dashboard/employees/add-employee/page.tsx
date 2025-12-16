'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  employeeSchema,
  type EmployeeFormData,
} from '@/schemas/employee.schema';
import { employeesApi } from '@/services/employees.api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import EmployeeFormHeader from './EmployeeFormHeader';
import EmployeeFormFields from './EmployeeFormFields';

export default function EmployeesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: EmployeeFormData) => {
    if (!token) {
      toast.error('يرجى تسجيل الدخول أولاً');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await employeesApi.create(token, data);
      toast.success('تم إضافة الموظف بنجاح');
      reset();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'حدث خطأ أثناء إضافة الموظف';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = () => {
    reset();
  };

  return (
    <div
      className="w-full max-w-[1242px] mx-auto px-4 md:px-6 lg:px-0"
      dir="rtl"
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ direction: 'rtl' }}>
        {/* Main Container */}
        <div className="bg-white border border-black/8 shadow-[0px_4px_22px_rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
          <EmployeeFormHeader />
          <EmployeeFormFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>

        {/* Action Buttons - outside card */}
        <div
          className="w-full flex flex-row items-center justify-center sm:justify-start gap-4  mt-4 md:mt-6"
          style={{ direction: 'rtl' }}
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-auto px-4 sm:px-8 py-1 bg-[#5D24E1] cursor-pointer rounded-full text-white text-base md:text-lg font-semibold hover:bg-[#682fee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="text-right" style={{ textAlign: 'right' }}>
              {isSubmitting ? 'جاري الإضافة...' : 'إضافة موظف جديد'}
            </span>
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="w-auto px-4 sm:px-8 py-1 bg-white border cursor-pointer border-[#5D24E1] text-[#5D24E1] rounded-full text-base md:text-lg font-semibold hover:bg-[#5D24E1]/5 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5 flex-shrink-0" />
            <span className="text-right" style={{ textAlign: 'right' }}>
              مسح الكل
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
