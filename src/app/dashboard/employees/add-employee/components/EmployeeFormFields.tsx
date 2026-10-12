import React from 'react';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import WorkHoursTimePicker from '@/components/ui/WorkHoursTimePicker';
import { useDepartmentsQuery, useGovernoratesQuery } from '@/services/lookups';
import { useRolesQuery } from '@/services/authorization';
import { useCanAssignRoles } from '@/hooks/usePermissions';
import {
  User,
  Phone,
  Briefcase,
  MapPin,
  Mail,
  Lock,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

import { ACCESS_LEVEL_OPTIONS } from '@/app/dashboard/employees/constants/employeesFormOptions';
import { EmployeeFormFieldsProps } from '../types/employee.types';
import { Label } from './Label';

const INPUT_CLASS = '!h-[46px] !px-4 !border-black/16 text-right';
const DIRTY_VALID = { shouldValidate: true, shouldDirty: true } as const;

export default function EmployeeFormFields({
  register,
  errors,
  watch,
  setValue,
}: EmployeeFormFieldsProps) {
  const accessLevel = watch('accessLevel');
  const department = watch('department');
  const governorate = watch('governorate');
  const workingHours = watch('workingHours');
  const roleIds = watch('roleIds');
  const { data: governorates = [] } = useGovernoratesQuery();
  const { data: departments = [], isLoading: isDepartmentsLoading } =
    useDepartmentsQuery();
  const departmentOptions = departments.map((d) => ({
    key: d.value,
    value: d.label,
  }));

  const canAssignRoles = useCanAssignRoles();
  const { data: roles = [], isLoading: isRolesLoading } =
    useRolesQuery(canAssignRoles);

  const roleOptions = roles.map((role) => ({
    key: String(role.id),
    value: role.name,
  }));

  return (
    <div
      className="px-4 md:px-8 lg:px-[165px] py-6 md:py-[34px] w-full"
      dir="rtl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {canAssignRoles ? (
          <div className="md:col-span-2 flex flex-col gap-4">
            <Label
              htmlFor="employee-roles"
              required
              icon={<ShieldCheck className="w-6 h-6 text-primary" />}
              text="أدوار الموظف"
            />
            <MultiSelectDropdown
              id="employee-roles"
              value={roleIds ?? []}
              onChange={(v) => setValue('roleIds', v, DIRTY_VALID)}
              options={roleOptions}
              loading={isRolesLoading}
              placeholder="اختر أدوار الموظف"
              emptyMessage="لا توجد أدوار — أنشئ دورًا من صفحة الأدوار والصلاحيات"
              widthClass="w-full"
              error={errors.roleIds?.message}
            />
            <p className="text-sm text-gray-500">
              الأدوار هي ما يحدد صلاحيات الموظف داخل النظام، ويجب اختيار دور
              واحد على الأقل. يمكنك تعديلها لاحقًا من صفحة بيانات الموظف.
            </p>
          </div>
        ) : (
          <div className="md:col-span-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold">سيتم إنشاء الحساب بدون أي صلاحيات</p>
              <p>
                لا تملك صلاحية إدارة الأدوار، لذلك لا يمكن تعيين دور للموظف من
                هنا. سيستطيع الموظف تسجيل الدخول فقط، ولن يتمكن من استخدام
                النظام حتى يقوم أحد المسؤولين الذين يملكون صلاحية إدارة الأدوار
                بتعيين دور له من صفحة بيانات الموظف.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Label
            htmlFor="employee-full-name"
            required
            icon={<Briefcase className="w-6 h-6 text-primary" />}
            text="الاسم الكامل للموظف"
          />
          <Input
            id="employee-full-name"
            name="fullName"
            placeholder="أدخل الاسم الكامل"
            register={register}
            error={errors.fullName?.message}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Label
            htmlFor="employee-phone"
            required
            icon={<Phone className="w-6 h-6 text-primary" />}
            text="رقم الهاتف"
          />
          <Input
            id="employee-phone"
            name="phoneNumber"
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="off"
            placeholder="01234567890"
            register={register}
            error={errors.phoneNumber?.message}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Label
            htmlFor="employee-email"
            icon={<Mail className="w-6 h-6 text-primary" />}
            text="البريد الإلكتروني"
          />
          <Input
            id="employee-email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="off"
            placeholder="example@domain.com"
            register={register}
            error={errors.email?.message}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Label
            htmlFor="employee-governorate"
            icon={<MapPin className="w-6 h-6 text-primary" />}
            text="المحافظة"
          />
          <SearchableSelect
            id="employee-governorate"
            value={governorate || ''}
            onChange={(v) => setValue('governorate', v, DIRTY_VALID)}
            options={governorates}
            placeholder="المحافظة"
            widthClass="w-full"
            clearable
            error={errors.governorate?.message}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Label
            htmlFor="employee-password"
            required
            icon={<Lock className="w-6 h-6 text-primary" />}
            text="كلمة المرور"
          />
          <Input
            id="employee-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="6 أحرف على الأقل"
            register={register}
            error={errors.password?.message}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Label
            htmlFor="employee-confirm-password"
            required
            icon={<Lock className="w-6 h-6 text-primary" />}
            text="تأكيد كلمة المرور"
          />
          <Input
            id="employee-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="أعد كتابة كلمة المرور"
            register={register}
            error={errors.confirmPassword?.message}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Label
            htmlFor="employee-working-hours"
            icon={<Clock className="w-6 h-6 text-primary" />}
            text="ساعات العمل"
          />
          <WorkHoursTimePicker
            id="employee-working-hours"
            value={workingHours || ''}
            onChange={(v) => setValue('workingHours', v, DIRTY_VALID)}
            error={errors.workingHours?.message}
            placeholder="9 : AM - 5 : PM"
          />
        </div>

        <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <h4 className="text-sm font-semibold text-gray-700">
                بيانات تنظيمية
              </h4>
              <p className="text-xs text-gray-400">
                للتصنيف والتقارير فقط — الصلاحيات تُحدَّد من الأدوار.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="employee-access-level" className="text-sm text-gray-600">
                مستوى الوظيفة <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                id="employee-access-level"
                value={accessLevel || ''}
                onChange={(v) => setValue('accessLevel', v, DIRTY_VALID)}
                options={ACCESS_LEVEL_OPTIONS}
                placeholder="اختر مستوى الوظيفة"
                widthClass="w-full"
                error={errors?.accessLevel?.message}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="employee-department" className="text-sm text-gray-600">
                قسم الموظف <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                id="employee-department"
                value={department || ''}
                onChange={(v) => setValue('department', v, DIRTY_VALID)}
                options={departmentOptions}
                loading={isDepartmentsLoading}
                placeholder="اختر القسم"
                widthClass="w-full"
                error={errors?.department?.message}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
