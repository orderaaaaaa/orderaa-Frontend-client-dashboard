'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Employee } from '../types/employee';
import { employeeSchema, EmployeeFormData } from '../schemas/employee';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import SearchableSelect from '@/components/ui/SearchableSelect';
import WorkHoursTimePicker from '@/components/ui/WorkHoursTimePicker';
import { useGovernoratesQuery } from '@/services/lookups';
import {
  LiaUserSolid,
  LiaPhoneSolid,
  LiaBriefcaseSolid,
  LiaMapMarkerAltSolid,
  LiaEnvelopeSolid,
  LiaLockSolid,
  LiaClockSolid,
} from 'react-icons/lia';
import {
  ACCESS_LEVEL_OPTIONS,
  DEPARTMENT_OPTIONS,
} from '../../../constants/employeesFormOptions';

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
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee,
  });

  const accessLevel = watch('accessLevel');
  const department = watch('department');
  const address = watch('address');
  const workingHours = watch('workingHours');

  const onSubmitHandler = (data: EmployeeFormData) => {
    const { passwordConfirmation, ...rest } = data;

    const updateData: Partial<Employee> = {
      ...rest,
      address: rest.address ?? undefined,
      password: rest.password ?? undefined,
      workingHours: rest.workingHours ?? undefined,
    };

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
      <div className="w-full flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 mb-2 justify-start w-full">
          <LiaUserSolid className="w-6 h-6 text-primary" />
          <span className="text-base md:text-lg font-normal">
            صلاحية الموظف <span className="text-red-500">*</span>
          </span>
        </div>
        <SearchableSelect
          value={accessLevel || ''}
          onChange={(value) =>
            setValue('accessLevel', value, { shouldValidate: true })
          }
          options={ACCESS_LEVEL_OPTIONS}
          placeholder="اختر صلاحية الموظف"
          widthClass="w-full"
          error={errors?.accessLevel?.message}
        />
      </div>

      <div className="w-full flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 mb-2 justify-start w-full">
          <LiaBriefcaseSolid className="w-6 h-6 text-primary" />
          <span className="text-base md:text-lg font-normal">
            قسم الموظف <span className="text-red-500">*</span>
          </span>
        </div>
        <SearchableSelect
          value={department || ''}
          onChange={(value) =>
            setValue('department', value, { shouldValidate: true })
          }
          options={DEPARTMENT_OPTIONS}
          placeholder="اختر القسم"
          widthClass="w-full"
          error={errors?.department?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <LiaUserSolid className="w-6 h-6 text-primary" />
            <span className="text-base md:text-lg font-normal">
              الاسم الكامل <span className="text-red-500">*</span>
            </span>
          </div>
          <Input
            name="fullName"
            type="text"
            placeholder="أدخل الاسم الكامل"
            register={register}
            error={errors.fullName?.message}
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <LiaPhoneSolid className="w-6 h-6 text-primary" />
            <span className="text-base md:text-lg font-normal">
              رقم الهاتف <span className="text-red-500">*</span>
            </span>
          </div>
          <Input
            name="phoneNumber"
            type="text"
            placeholder="01234567890"
            register={register}
            error={errors.phoneNumber?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <LiaEnvelopeSolid className="w-6 h-6 text-primary" />
            <span className="text-base md:text-lg font-normal">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </span>
          </div>
          <Input
            name="email"
            type="email"
            placeholder="example@domain.com"
            register={register}
            error={errors.email?.message}
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <LiaMapMarkerAltSolid className="w-6 h-6 text-primary" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <LiaLockSolid className="w-6 h-6 text-primary" />
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
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <LiaLockSolid className="w-6 h-6 text-primary" />
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
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <LiaClockSolid className="w-6 h-6 text-primary" />
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

      <div className="flex justify-end gap-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'يتم الحفظ...' : 'حفظ التغيرات'}
        </Button>
      </div>
    </form>
  );
}
