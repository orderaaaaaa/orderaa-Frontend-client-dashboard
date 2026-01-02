'use client';

import { useForm } from 'react-hook-form';
import { Employee } from '../types/employee';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import SearchableSelect from '@/app/dashboard/orders/allOrders/components/FilterSection/SearchableSelect';
import WorkHoursTimePicker from '@/components/ui/WorkHoursTimePicker';
import { useGovernoratesQuery } from '@/services/lookups';
import {
  validateEgyptianPhoneNumber,
  getPhoneNumberErrorMessage,
} from '@/utils/validators/phoneValidator';
import {
  User,
  Phone,
  Briefcase,
  MapPin,
  Mail,
  Lock,
  Clock,
} from 'lucide-react';
import {
  ACCESS_LEVEL_OPTIONS,
  DEPARTMENT_OPTIONS,
} from '../../../constants/employeesFormOptions';
import { toast } from 'react-toastify';

interface EmployeeFormProps {
  employee: Employee;
  onSubmit: (data: Partial<Employee>) => void;
  isLoading?: boolean;
}

export default function EmployeeForm({
  employee,
  onSubmit,
  isLoading,
}: EmployeeFormProps) {
  const { data: governorates = [] } = useGovernoratesQuery();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Employee & { passwordConfirmation?: string }>({
    defaultValues: employee,
  });

  const accessLevel = watch('accessLevel');
  const department = watch('department');
  const address = watch('address');
  const workingHours = watch('workingHours');

  const onSubmitHandler = (data: any) => {
    if (data.password && data.password !== data.passwordConfirmation) {
      setError('passwordConfirmation', {
        type: 'manual',
        message: 'الباسورد غير متطابق',
      });
      toast.error('الباسورد غير متطابق');
      return;
    }

    clearErrors('passwordConfirmation');

    const updateData = { ...data };

    delete updateData.passwordConfirmation;
    delete updateData.id;

    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    }

    onSubmit(updateData);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="space-y-6 bg-white p-6 rounded-lg shadow"
      dir="rtl"
    >
      {/* Access Level */}
      <div className="w-full flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 mb-2 justify-start w-full">
          <User className="w-6 h-6 text-[#5D24E1]" strokeWidth={1.5} />
          <span className="text-base md:text-lg font-normal">
            صلاحية الموظف
          </span>
        </div>
        <Dropdown
          value={accessLevel || ''}
          onChange={(value) =>
            setValue('accessLevel', value, { shouldValidate: true })
          }
          options={ACCESS_LEVEL_OPTIONS}
          placeholder="اختر صلاحية الموظف"
          selectClassName={`w-full bg-[rgba(234,234,234,0.25)] border px-3 py-2 text-lg ${
            errors?.accessLevel ? 'border-red-500' : 'border-black/16'
          } rounded text-right`}
        />
        {errors.accessLevel && (
          <p className="text-red-500 text-sm mt-1">
            {errors.accessLevel.message}
          </p>
        )}
      </div>

      {/* Department */}
      <div className="w-full flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 mb-2 justify-start w-full">
          <Briefcase className="w-6 h-6 text-[#5D24E1]" strokeWidth={1.5} />
          <span className="text-base md:text-lg font-normal">قسم الموظف</span>
        </div>
        <Dropdown
          value={department || ''}
          onChange={(value) =>
            setValue('department', value, { shouldValidate: true })
          }
          options={DEPARTMENT_OPTIONS}
          placeholder="اختر القسم"
          selectClassName={`w-full bg-[rgba(234,234,234,0.25)] border px-3 py-2 text-lg ${
            errors?.department ? 'border-red-500' : 'border-black/16'
          } rounded text-right`}
        />
        {errors.department && (
          <p className="text-red-500 text-sm mt-1">
            {errors.department.message}
          </p>
        )}
      </div>

      {/* Full Name & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <User className="w-6 h-6 text-[#5D24E1]" strokeWidth={1.5} />
            <span className="text-base md:text-lg font-normal">
              الاسم الكامل
            </span>
          </div>
          <Input
            name="fullName"
            type="text"
            placeholder="أدخل الاسم الكامل"
            register={register}
            error={errors.fullName?.message}
            className="!h-[46px] !px-4 bg-[rgba(234,234,234,0.25)] !border-black/16 text-right"
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <Phone className="w-6 h-6 text-[#5D24E1]" strokeWidth={1.5} />
            <span className="text-base md:text-lg font-normal">رقم الهاتف</span>
          </div>
          <Input
            name="phoneNumber"
            type="text"
            placeholder="01234567890"
            register={register}
            registerOptions={{
              // required: 'رقم الهاتف مطلوب',
              validate: (val: string) =>
                validateEgyptianPhoneNumber(val) ||
                getPhoneNumberErrorMessage(val),
            }}
            error={errors.phoneNumber?.message}
            className="!h-[46px] !px-4 bg-[rgba(234,234,234,0.25)] !border-black/16 text-right"
          />
        </div>
      </div>

      {/* Email & Governorate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <Mail className="w-6 h-6 text-[#5D24E1]" strokeWidth={1.5} />
            <span className="text-base md:text-lg font-normal">
              البريد الإلكتروني
            </span>
          </div>
          <Input
            name="email"
            type="email"
            placeholder="example@domain.com"
            register={register}
            registerOptions={{
              required: 'البريد الإلكتروني مطلوب',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'البريد الإلكتروني غير صحيح',
              },
            }}
            error={errors.email?.message}
            className="!h-[46px] !px-4 bg-[rgba(234,234,234,0.25)] !border-black/16 text-right"
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <MapPin className="w-6 h-6 text-[#5D24E1]" strokeWidth={1.5} />
            <span className="text-base md:text-lg font-normal">المحافظة</span>
          </div>
          <SearchableSelect
            value={address || ''}
            onChange={(v) => setValue('address', v, { shouldValidate: true })}
            options={governorates}
            placeholder="اختر المحافظة"
            widthClass="w-full"
            error={errors.address?.message}
          />
        </div>
      </div>

      {/* Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <Lock className="w-6 h-6 text-[#5D24E1]" strokeWidth={1.5} />
            <span className="text-base md:text-lg font-normal">
              كلمة المرور
            </span>
          </div>
          <Input
            name="password"
            type="password"
            placeholder="كلمة المرور"
            register={register}
            error={errors.password?.message}
            className="!h-[46px] !px-4 !pr-12 bg-[rgba(234,234,234,0.25)] !border-black/16 text-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <Lock className="w-6 h-6 text-[#5D24E1]" strokeWidth={1.5} />
            <span className="text-base md:text-lg font-normal">
              تاكيد كلمة المرور
            </span>
          </div>
          <Input
            name="passwordConfirmation"
            type="password"
            placeholder="تأكيد كلمة المرور"
            register={register}
            error={errors.passwordConfirmation?.message}
            className="!h-[46px] !px-4 !pr-12 bg-[rgba(234,234,234,0.25)] !border-black/16 text-right"
          />
        </div>
      </div>

      {/* Working Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <Clock className="w-6 h-6 text-[#5D24E1]" strokeWidth={1.5} />
            <span className="text-base md:text-lg font-normal">
              ساعات العمل
            </span>
          </div>
          <WorkHoursTimePicker
            value={workingHours || ''}
            onChange={(value) =>
              setValue('workingHours', value, { shouldValidate: true })
            }
            error={errors.workingHours?.message}
            placeholder="9 : AM - 5 : PM"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-[#5D24E1] text-white rounded-md cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'يتم الحفظ...' : 'حفظ التغيرات'}
        </button>
      </div>
    </form>
  );
}
