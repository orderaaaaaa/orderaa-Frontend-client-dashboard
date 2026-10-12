'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Employee } from '../types/employee';
import {
  editEmployeeSchema,
  EMPLOYEE_FORM_DEFAULTS,
  type EmployeeFormData,
} from '@/schemas/employee.schema';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import SearchableSelect from '@/components/ui/SearchableSelect';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import WorkHoursTimePicker from '@/components/ui/WorkHoursTimePicker';
import { StickyFormFooter } from '@/components/ui/sticky-form-footer';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
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
import { Label } from '../../../add-employee/components/Label';

const EMPLOYEES_HREF = '/dashboard/employees';
const DIRTY_VALID = { shouldValidate: true, shouldDirty: true } as const;

interface EmployeeFormProps {
  employee: Employee;
  onSubmit: (
    data: Partial<Employee>,
    roleIds: number[],
    rolesDirty: boolean,
  ) => void;
  isLoading?: boolean;
}

const sameIds = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join(',') === [...b].sort().join(',');

const toFormValues = (employee: Employee): EmployeeFormData => ({
  ...EMPLOYEE_FORM_DEFAULTS,
  accessLevel: employee.accessLevel ?? '',
  department: employee.department ?? '',
  fullName: employee.fullName ?? '',
  phoneNumber: employee.phoneNumber ?? '',
  email: employee.email ?? '',
  address: employee.address ?? '',
  governorate: employee.governorate ?? '',
  workingHours: employee.workingHours ?? '',
});

export default function EmployeeForm({
  employee,
  onSubmit,
  isLoading = false,
}: EmployeeFormProps) {
  const { data: governorates = [] } = useGovernoratesQuery();
  const { data: departments = [], isLoading: isDepartmentsLoading } =
    useDepartmentsQuery();
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
  const rolesDirtyRef = useRef(false);

  const serverRoleIds = employee.roles?.map((role) => String(role.id)) ?? [];
  const serverRoleKey = [...serverRoleIds].sort().join(',');

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
    formState: { errors, isDirty },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(editEmployeeSchema),
    mode: 'onTouched',
    defaultValues: toFormValues(employee),
  });

  const accessLevel = watch('accessLevel');
  const department = watch('department');
  const governorate = watch('governorate');
  const workingHours = watch('workingHours');

  const rolesChanged =
    rolesDirtyRef.current && !sameIds(roleIds, serverRoleIds);
  const hasUnsavedChanges = isDirty || rolesChanged;
  const guard = useUnsavedChangesGuard(hasUnsavedChanges && !isLoading);

  const onSubmitHandler = (data: EmployeeFormData) => {
    const pickedGovernorate = data.governorate?.trim() ?? '';
    const governorateUpdate: Pick<Partial<Employee>, 'governorate'> =
      pickedGovernorate
        ? { governorate: pickedGovernorate }
        : employee.governorate
          ? { governorate: null }
          : {};
    const email = data.email?.trim() ?? '';

    const updateData: Partial<Employee> = {
      accessLevel: data.accessLevel,
      department: data.department,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      ...(email ? { email } : {}),
      ...governorateUpdate,
      workingHours: data.workingHours ?? undefined,
      ...(data.password?.trim() ? { password: data.password } : {}),
    };

    onSubmit(updateData, roleIds.map(Number), rolesDirtyRef.current);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow"
      dir="rtl"
      noValidate
    >
      {canAssignRoles && (
        <div className="w-full flex flex-col gap-2">
          <Label
            htmlFor="edit-employee-roles"
            icon={<LiaUserShieldSolid className="w-6 h-6 text-primary" />}
            text="أدوار الموظف"
          />
          <MultiSelectDropdown
            id="edit-employee-roles"
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

      {!canAssignRoles && (employee.roles?.length ?? 0) > 0 && (
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1 justify-start w-full">
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
          <Label
            htmlFor="edit-employee-full-name"
            required
            icon={<LiaUserSolid className="w-6 h-6 text-primary" />}
            text="الاسم الكامل"
          />
          <Input
            id="edit-employee-full-name"
            name="fullName"
            type="text"
            placeholder="أدخل الاسم الكامل"
            register={register}
            error={errors.fullName?.message}
          />
        </div>
        <div>
          <Label
            htmlFor="edit-employee-phone"
            required
            icon={<LiaPhoneSolid className="w-6 h-6 text-primary" />}
            text="رقم الهاتف"
          />
          <Input
            id="edit-employee-phone"
            name="phoneNumber"
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="off"
            placeholder="01234567890"
            register={register}
            error={errors.phoneNumber?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label
            htmlFor="edit-employee-email"
            icon={<LiaEnvelopeSolid className="w-6 h-6 text-primary" />}
            text="البريد الإلكتروني"
          />
          <Input
            id="edit-employee-email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="off"
            placeholder="example@domain.com"
            register={register}
            error={errors.email?.message}
          />
        </div>
        <div>
          <Label
            htmlFor="edit-employee-governorate"
            icon={<LiaMapMarkerAltSolid className="w-6 h-6 text-primary" />}
            text="المحافظة"
          />
          <SearchableSelect
            id="edit-employee-governorate"
            value={governorate || ''}
            onChange={(v) => setValue('governorate', v, DIRTY_VALID)}
            options={governorates}
            placeholder="اختر المحافظة"
            widthClass="w-full"
            clearable
            error={errors.governorate?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label
            htmlFor="edit-employee-password"
            icon={<LiaLockSolid className="w-6 h-6 text-primary" />}
            text="كلمة المرور الجديدة"
          />
          <Input
            id="edit-employee-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="اتركها فارغة للإبقاء على الحالية"
            register={register}
            error={errors.password?.message}
          />
        </div>
        <div>
          <Label
            htmlFor="edit-employee-confirm-password"
            icon={<LiaLockSolid className="w-6 h-6 text-primary" />}
            text="تأكيد كلمة المرور"
          />
          <Input
            id="edit-employee-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="تأكيد كلمة المرور"
            register={register}
            error={errors.confirmPassword?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label
            htmlFor="edit-employee-working-hours"
            icon={<LiaClockSolid className="w-6 h-6 text-primary" />}
            text="ساعات العمل"
          />
          <WorkHoursTimePicker
            id="edit-employee-working-hours"
            value={workingHours || ''}
            onChange={(value) => setValue('workingHours', value, DIRTY_VALID)}
            error={errors.workingHours?.message}
            placeholder="9 : AM - 5 : PM"
          />
        </div>
      </div>

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
            <label htmlFor="edit-employee-access-level" className="text-sm text-gray-600">
              مستوى الوظيفة <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              id="edit-employee-access-level"
              value={accessLevel || ''}
              onChange={(value) => setValue('accessLevel', value, DIRTY_VALID)}
              options={ACCESS_LEVEL_OPTIONS}
              placeholder="اختر مستوى الوظيفة"
              widthClass="w-full"
              error={errors?.accessLevel?.message}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="edit-employee-department" className="text-sm text-gray-600">
              قسم الموظف <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              id="edit-employee-department"
              value={department || ''}
              onChange={(value) => setValue('department', value, DIRTY_VALID)}
              options={departmentOptions}
              loading={isDepartmentsLoading}
              placeholder="اختر القسم"
              widthClass="w-full"
              error={errors?.department?.message}
            />
          </div>
        </div>
      </div>

      <StickyFormFooter isDirty={hasUnsavedChanges} isSaving={isLoading}>
        <Button
          type="button"
          variant="outline"
          className="min-h-10 rounded-full px-6"
          disabled={isLoading}
          onClick={() => guard.requestNavigation(EMPLOYEES_HREF)}
        >
          رجوع
        </Button>
        <Button
          type="submit"
          className="min-h-10 rounded-full px-8 font-semibold"
          disabled={!hasUnsavedChanges || isLoading}
          loading={isLoading}
          loadingText="جاري الحفظ..."
        >
          حفظ التغييرات
        </Button>
      </StickyFormFooter>

      <UnsavedChangesDialog
        isOpen={guard.pendingHref !== null}
        onStay={guard.cancelLeave}
        onLeave={guard.confirmLeave}
      />
    </form>
  );
}
