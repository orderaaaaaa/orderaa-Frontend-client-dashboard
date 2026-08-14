import React from 'react';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import WorkHoursTimePicker from '@/components/ui/WorkHoursTimePicker';
import { useGovernoratesQuery } from '@/services/lookups';
import { useRolesQuery } from '@/services/authorization';
import { useCanAssignRoles } from '@/hooks/usePermissions';
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
  ShieldCheck,
  ShieldAlert,
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
  const roleIds = watch('roleIds');
  const { data: governorates = [] } = useGovernoratesQuery();

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
      {/* Main Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {/*  Roles — the only thing that actually grants access. An employee
             created with zero roles can sign in but is refused on every
             request, so the field is required whenever it is rendered. */}
        {canAssignRoles ? (
          <div className="md:col-span-2 flex flex-col gap-4">
            <Label
              icon={<ShieldCheck className="w-6 h-6 text-primary" />}
              text="أدوار الموظف"
            />
            <MultiSelectDropdown
              value={roleIds ?? []}
              onChange={(v) => setValue('roleIds', v, { shouldValidate: true })}
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
          /*  The creator cannot see or assign roles — warn instead of silently
              producing an account that 403s on everything. */
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

        {/*  Organisational data — kept because the API still accepts it, but
             it no longer decides what the employee can do. */}
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
              <span className="text-sm text-gray-600">مستوى الوظيفة</span>
              <SearchableSelect
                value={accessLevel || ''}
                onChange={(v) =>
                  setValue('accessLevel', v, { shouldValidate: true })
                }
                options={ACCESS_LEVEL_OPTIONS}
                placeholder="اختر مستوى الوظيفة"
                widthClass="w-full"
                error={errors?.accessLevel?.message}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-600">قسم الموظف</span>
              <SearchableSelect
                value={department || ''}
                onChange={(v) =>
                  setValue('department', v, { shouldValidate: true })
                }
                options={DEPARTMENT_OPTIONS}
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
