'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Employee } from '../types/employee';
import { employeeSchema, EmployeeFormData } from '../schemas/employee';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import SearchableSelect from '@/components/ui/SearchableSelect';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import WorkHoursTimePicker from '@/components/ui/WorkHoursTimePicker';
import { useGovernoratesQuery, useDepartmentsQuery } from '@/services/lookups';
import { useRolesQuery } from '@/services/authorization';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';
import {
  LiaUserSolid,
  LiaPhoneSolid,
  LiaMapMarkerAltSolid,
  LiaEnvelopeSolid,
  LiaLockSolid,
  LiaClockSolid,
  LiaUserShieldSolid,
} from 'react-icons/lia';
import { ACCESS_LEVEL_OPTIONS } from '../../../constants/employeesFormOptions';

interface EmployeeFormProps {
  employee: Employee;
  /**
   * `roleIds` is the full desired set — the page sends it to
   * PUT /employees/:id/roles, but ONLY when `rolesDirty` is true. A
   * full-replace PUT built from untouched state can wipe an employee's roles.
   */
  onSubmit: (
    data: Partial<Employee>,
    roleIds: number[],
    rolesDirty: boolean,
  ) => void;
  isLoading?: boolean;
}

export default function EmployeeForm({
  employee,
  onSubmit,
  isLoading,
}: EmployeeFormProps) {
  const { data: governorates = [] } = useGovernoratesQuery();
  const { data: departments = [] } = useDepartmentsQuery();
  const departmentOptions = departments.map((d) => ({
    key: d.value,
    value: d.label,
  }));

  const { hasAllPermissions } = usePermissionCheck();
  const canAssignRoles = hasAllPermissions([
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_ASSIGN,
  ]);
  const { data: roles = [], isLoading: isRolesLoading } =
    useRolesQuery(canAssignRoles);
  const roleOptions = roles.map((role) => ({
    key: String(role.id),
    value: role.name,
  }));

  const [roleIds, setRoleIds] = useState<string[]>(
    () => employee.roles?.map((role) => String(role.id)) ?? []
  );
  // Only a real user interaction may trigger the full-replace roles PUT.
  const rolesDirtyRef = useRef(false);

  const serverRoleIds = employee.roles?.map((role) => String(role.id)) ?? [];
  const serverRoleKey = [...serverRoleIds].sort().join(',');

  // The cached employee can arrive without `roles` (the profile PATCH response
  // omits them) and be replaced by the refetched row moments later — resync
  // until the user touches the field, so we never diff against stale state.
  useEffect(() => {
    if (!rolesDirtyRef.current) {
      setRoleIds(serverRoleIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverRoleKey]);

  const handleRolesChange = (next: string[]) => {
    rolesDirtyRef.current = true;
    setRoleIds(next);
  };

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

    onSubmit(updateData, roleIds.map(Number), rolesDirtyRef.current);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="space-y-6 bg-white p-6 rounded-lg shadow"
      dir="rtl"
    >
      {canAssignRoles && (
        <div className="w-full flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <LiaUserShieldSolid className="w-6 h-6 text-primary" />
            <span className="text-base md:text-lg font-normal">
              أدوار الموظف
            </span>
          </div>
          <MultiSelectDropdown
            value={roleIds}
            onChange={handleRolesChange}
            options={roleOptions}
            loading={isRolesLoading}
            placeholder="اختر أدوار الموظف"
            emptyMessage="لا توجد أدوار — أنشئ دورًا من صفحة الأدوار والصلاحيات"
            widthClass="w-full"
          />
          <p className="w-full text-sm text-gray-500">
            الأدوار هي ما يحدد صلاحيات الموظف داخل النظام.
          </p>
        </div>
      )}

      {/* Without roles:assign the roles are still worth showing — read-only. */}
      {!canAssignRoles && (employee.roles?.length ?? 0) > 0 && (
        <div className="w-full flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 mb-2 justify-start w-full">
            <LiaUserShieldSolid className="w-6 h-6 text-primary" />
            <span className="text-base md:text-lg font-normal">
              أدوار الموظف
            </span>
          </div>
          <div className="flex w-full flex-wrap justify-start gap-2">
            {employee.roles?.map((role) => (
              <span
                key={role.id}
                className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {role.name}
              </span>
            ))}
          </div>
        </div>
      )}

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

      {/* Organisational data — the API still accepts these, but since ABAC they
          are classification/reporting only and no longer grant access. */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
        <div className="mb-3 flex items-center gap-2">
          <LiaUserSolid className="w-5 h-5 text-gray-400" />
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
            <span className="text-sm text-gray-600">
              مستوى الوظيفة <span className="text-red-500">*</span>
            </span>
            <SearchableSelect
              value={accessLevel || ''}
              onChange={(value) =>
                setValue('accessLevel', value, { shouldValidate: true })
              }
              options={ACCESS_LEVEL_OPTIONS}
              placeholder="اختر مستوى الوظيفة"
              widthClass="w-full"
              error={errors?.accessLevel?.message}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-600">
              قسم الموظف <span className="text-red-500">*</span>
            </span>
            <SearchableSelect
              value={department || ''}
              onChange={(value) =>
                setValue('department', value, { shouldValidate: true })
              }
              options={departmentOptions}
              placeholder="اختر القسم"
              widthClass="w-full"
              error={errors?.department?.message}
            />
          </div>
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
