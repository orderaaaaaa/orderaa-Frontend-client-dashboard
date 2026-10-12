'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  buildCreateEmployeeSchema,
  EMPLOYEE_FORM_DEFAULTS,
  type EmployeeFormData,
} from '@/schemas/employee.schema';
import { useCanAssignRoles } from '@/hooks/usePermissions';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { Button } from '@/components/ui/button';
import { StickyFormFooter } from '@/components/ui/sticky-form-footer';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import { useCreateEmployee } from './hooks/useCreateEmployee';
import EmployeeFormHeader from './components/EmployeeFormHeader';
import EmployeeFormFields from './components/EmployeeFormFields';
import { useRouter } from 'next/navigation';

const EMPLOYEES_HREF = '/dashboard/employees';

export default function EmployeesPage() {
  const canAssignRoles = useCanAssignRoles();
  const schema = React.useMemo(
    () => buildCreateEmployeeSchema(canAssignRoles),
    [canAssignRoles]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: EMPLOYEE_FORM_DEFAULTS,
  });

  const createEmployee = useCreateEmployee();
  const router = useRouter();
  const isSaving = createEmployee.isPending;
  const guard = useUnsavedChangesGuard(isDirty && !isSaving);

  const onSubmit = (data: EmployeeFormData) => {
    createEmployee.mutate(data, {
      onSuccess: () => {
        reset();
        router.push(EMPLOYEES_HREF);
      },
    });
  };

  return (
    <div
      className="w-full max-w-[1242px] mx-auto px-4 md:px-6 lg:px-0"
      dir="rtl"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="bg-white border border-black/8 shadow-[0px_4px_22px_rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
          <EmployeeFormHeader />
          <EmployeeFormFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>

        <StickyFormFooter
          isDirty={isDirty}
          isSaving={isSaving}
          status={
            isSaving
              ? 'جاري إضافة الموظف...'
              : isDirty
                ? 'لم تتم إضافة الموظف بعد'
                : 'املأ بيانات الموظف ثم اضغط إضافة'
          }
        >
          <Button
            type="button"
            variant="outline"
            className="min-h-10 rounded-full px-6"
            disabled={isSaving}
            onClick={() => guard.requestNavigation(EMPLOYEES_HREF)}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            className="min-h-10 rounded-full px-8 font-semibold"
            disabled={isSaving}
            loading={isSaving}
            loadingText="جاري الإضافة..."
          >
            إضافة موظف جديد
          </Button>
        </StickyFormFooter>
      </form>

      <UnsavedChangesDialog
        isOpen={guard.pendingHref !== null}
        onStay={guard.cancelLeave}
        onLeave={guard.confirmLeave}
      />
    </div>
  );
}
