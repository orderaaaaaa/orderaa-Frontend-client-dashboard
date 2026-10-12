'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  accountSecuritySchema,
  AccountSecurityFormData,
} from '@/schemas/accountSecurity.schema';
import Input from '@/components/ui/Input';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import { Button } from '@/components/ui/button';
import { LiaLockSolid, LiaShieldAltSolid } from 'react-icons/lia';
import useChangePassword from '../hooks/useChangePassword';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

export default function AccountSecurity() {
  const { changePassword, isLoading, isSuccess } = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<AccountSecurityFormData>({
    resolver: zodResolver(accountSecuritySchema),
    defaultValues: {
      oldPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const oldPassword = watch('oldPassword');
  const confirmPassword = watch('confirmPassword');

  const hasAllValues = Boolean(
    oldPassword?.trim() && password?.trim() && confirmPassword?.trim()
  );
  const guard = useUnsavedChangesGuard(isDirty && !isLoading && !isSuccess);

  const onSubmit = async (data: AccountSecurityFormData) => {
    changePassword({
      currentPassword: data.oldPassword,
      newPassword: data.password,
      confirmPassword: data.confirmPassword,
    });
  };

  useEffect(() => {
    if (isSuccess) reset();
  }, [isSuccess, reset]);

  const inputClassName =
    'text-base text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-colors';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm" dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-lg">
          <LiaShieldAltSolid className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">أمان الحساب</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5 md:w-[70%]">
          <div className="space-y-2">
            <label htmlFor="security-old-password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaLockSolid className="w-5 h-5 text-primary !cursor-pointer" />
              <span>كلمة المرور الحالية</span>
            </label>
            <Input
              label=""
              id="security-old-password"
              autoComplete="current-password"
              name="oldPassword"
              type="password"
              placeholder="أدخل كلمة المرور الحالية"
              register={register}
              error={errors.oldPassword?.message}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="security-new-password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaLockSolid className="w-5 h-5 text-primary !cursor-pointer" />
              <span>كلمة المرور الجديدة</span>
            </label>
            <Input
              label=""
              id="security-new-password"
              autoComplete="new-password"
              name="password"
              type="password"
              placeholder="أدخل كلمة المرور الجديدة"
              register={register}
              error={errors.password?.message}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="security-confirm-password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaLockSolid className="w-5 h-5 text-primary !cursor-pointer" />
              <span>تأكيد كلمة المرور الجديدة</span>
            </label>
            <Input
              label=""
              id="security-confirm-password"
              autoComplete="new-password"
              name="confirmPassword"
              type="password"
              placeholder="أعد إدخال كلمة المرور الجديدة"
              register={register}
              error={errors.confirmPassword?.message}
              className={inputClassName}
            />
          </div>

          <div className="pt-2">
            <PasswordStrengthIndicator password={password || ''} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
          <Button
            type="submit"
            size="lg"
            className="min-h-10"
            disabled={!hasAllValues || isLoading}
            loading={isLoading}
            loadingText="جاري التحديث..."
            aria-describedby={hasAllValues ? undefined : 'security-submit-hint'}
          >
            تحديث كلمة المرور
          </Button>
          {!hasAllValues && (
            <span id="security-submit-hint" className="text-sm text-gray-500">
              أدخل كلمة المرور الحالية والجديدة وتأكيدها لتفعيل الزر
            </span>
          )}
        </div>
      </form>
      <UnsavedChangesDialog
        isOpen={guard.pendingHref !== null}
        onStay={guard.cancelLeave}
        onLeave={guard.confirmLeave}
      />
    </div>
  );
}
