import React from 'react';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
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
} from '@/app/dashboard/employees/constants/employeesFormOptions';
import { EmployeeFormFieldsProps } from '../types/employee.types';
import { Label } from './Label';

export default function EmployeeFormFields({
  register,
  errors,
  watch,
  setValue,
}: EmployeeFormFieldsProps) {
  const accessLevel = watch('accessLevel');
  const department = watch('department');
  const address = watch('address');
  const workingHours = watch('workingHours');
  const { data: governorates = [] } = useGovernoratesQuery();

  return (
    <div
      className="px-4 md:px-8 lg:px-[165px] py-6 md:py-[34px] w-full"
      dir="rtl"
    >
      {/* Main Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {/*  Employee Access (Full Width) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Label
            icon={<User className="w-6 h-6 text-primary" />}
            text="صلاحية الموظف"
          />
          <SearchableSelect
            value={accessLevel || ''}
            onChange={(v) =>
              setValue('accessLevel', v, { shouldValidate: true })
            }
            options={ACCESS_LEVEL_OPTIONS}
            placeholder="اختر صلاحية الموظف"
            widthClass="w-full"
            error={errors?.accessLevel?.message}
            triggerClassName={`w-full bg-[rgba(234,234,234,0.25)] border px-3 py-2 text-lg ${
              errors?.accessLevel ? 'border-red-500' : 'border-black/16'
            } rounded text-right`}
          />
        </div>

        {/*  Employee Department (Full Width) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Label
            icon={<User className="w-6 h-6 text-primary" />}
            text="قسم الموظف"
          />
          <SearchableSelect
            value={department || ''}
            onChange={(v) =>
              setValue('department', v, { shouldValidate: true })
            }
            options={DEPARTMENT_OPTIONS}
            placeholder="اختر القسم"
            widthClass="w-full"
            error={errors?.department?.message}
            triggerClassName={`w-full bg-[rgba(234,234,234,0.25)] border px-3 py-2 text-lg ${
              errors?.department ? 'border-red-500' : 'border-black/16'
            } rounded text-right`}
          />
        </div>

        {/*  Name & Phone */}
        <div className="flex flex-col gap-4">
          <Label
            icon={<Briefcase className="w-6 h-6 text-primary" />}
            text="الاسم الكامل للموظف"
          />
          <Input
            name="fullName"
            placeholder="أدخل الاسم الكامل"
            register={register}
            error={errors.fullName?.message}
            className="!h-[46px] !px-4 !border-black/16 text-right"
          />
        </div>

        <div className="flex flex-col gap-4">
          <Label
            icon={<Phone className="w-6 h-6 text-primary" />}
            text="رقم الهاتف"
          />
          <Input
            name="phoneNumber"
            placeholder="01234567890"
            register={register}
            registerOptions={{
              validate: (val: string) =>
                validateEgyptianPhoneNumber(val) ||
                getPhoneNumberErrorMessage(val),
            }}
            error={errors.phoneNumber?.message}
            className="!h-[46px] !px-4 !border-black/16 text-right"
          />
        </div>

        {/*  Email & Address */}
        <div className="flex flex-col gap-4">
          <Label
            icon={<Mail className="w-6 h-6 text-primary" />}
            text="البريد الإلكتروني"
          />
          <Input
            name="email"
            type="email"
            placeholder="example@domain.com"
            register={register}
            error={errors.email?.message}
            className="!h-[46px] !px-4 !border-black/16 text-right"
          />
        </div>

        <div className="flex flex-col gap-4 mr-3">
          <Label
            icon={<MapPin className="w-6 h-6 text-primary" />}
            text="العنوان"
          />
          <SearchableSelect
            value={address || ''}
            onChange={(v) => setValue('address', v, { shouldValidate: true })}
            options={governorates}
            placeholder="المحافظة"
            widthClass="!w-[99%]"
            error={errors.address?.message}
          />
        </div>

        {/*  Password & Confirm Password */}
        <div className="flex flex-col gap-4">
          <Label
            icon={<Lock className="w-6 h-6 text-primary" />}
            text="كلمة المرور"
          />
          <Input
            name="password"
            type="password"
            placeholder="كلمة المرور"
            register={register}
            error={errors.password?.message}
            className="!h-[46px] !px-4 !border-black/16 text-right"
          />
        </div>

        <div className="flex flex-col gap-4">
          <Label
            icon={<Lock className="w-6 h-6 text-primary" />}
            text="تأكيد كلمة المرور"
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="أعد كتابة كلمة المرور"
            register={register}
            error={errors.confirmPassword?.message}
            className="!h-[46px] !px-4 !border-black/16 text-right"
          />
        </div>

        {/*  Working Hours */}
        <div className="flex flex-col gap-4">
          <Label
            icon={<Clock className="w-6 h-6 text-primary" />}
            text="ساعات العمل"
          />
          <WorkHoursTimePicker
            value={workingHours || ''}
            onChange={(v) =>
              setValue('workingHours', v, { shouldValidate: true })
            }
            error={errors.workingHours?.message}
            placeholder="9 : AM - 5 : PM"
          />
        </div>
      </div>
    </div>
  );
}
