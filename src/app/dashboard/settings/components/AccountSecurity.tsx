'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  accountSecuritySchema,
  AccountSecurityFormData,
} from '@/schemas/accountSecurity.schema';
import Input from '@/components/ui/Input';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import { LiaLockSolid } from 'react-icons/lia';
import { FaShieldAlt } from 'react-icons/fa';
import api from '@/lib/api';

export default function AccountSecurity() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
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

  // Check if all fields have values
  const hasAllValues = Boolean(
    oldPassword?.trim() && password?.trim() && confirmPassword?.trim()
  );

  const onSubmit = async (data: AccountSecurityFormData) => {
    try {
      await api.patch('/settings/account-security', {
        oldPassword: data.oldPassword,
        newPassword: data.password,
      });

      // Handle success (you can add toast notification here)
      console.log('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      // Handle error (you can add toast notification here)
    }
  };

  return (
    <div className="bg-white rounded-lg p-6" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-[#5D24E114] rounded flex items-center justify-center relative">
          <FaShieldAlt className="w-5 h-5 text-[#5D24E1]" />
        </div>
        <h2 className="text-2xl font-medium text-right">امان الحساب</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6  md:w-[85%]">
          {/* Old Password Field */}
          <div className="flex flex-col items-end gap-4">
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <LiaLockSolid className="w-6 h-6 text-[#5D24E1] flex-shrink-0" />
              <span
                className="text-base md:text-xl font-medium text-right"
                style={{ textAlign: 'right' }}
              >
                كلمة المرور القديمة
              </span>
            </div>
            <div className="w-full">
              <Input
                label=""
                name="oldPassword"
                type="password"
                placeholder="كلمة المرور القديمة"
                register={register}
                error={errors.oldPassword?.message}
                className="!h-[46px] !px-4 !py-0 rounded-sm bg-[rgba(234,234,234,0.25)] !border-black/16 text-right text-base font-normal text-black placeholder:text-black/60 placeholder:font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col items-end gap-4">
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <LiaLockSolid className="w-6 h-6 text-[#5D24E1] flex-shrink-0" />
              <span
                className="text-base md:text-xl font-medium text-right"
                style={{ textAlign: 'right' }}
              >
                كلمة المرور
              </span>
            </div>
            <div className="w-full">
              <Input
                label=""
                name="password"
                type="password"
                placeholder="كلمة المرور"
                register={register}
                error={errors.password?.message}
                className="!h-[46px] !px-4 !py-0 rounded-sm bg-[rgba(234,234,234,0.25)] !border-black/16 text-right text-base font-normal text-black placeholder:text-black/60 placeholder:font-medium"
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col items-end gap-4">
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <LiaLockSolid className="w-6 h-6 text-[#5D24E1] flex-shrink-0" />
              <span
                className="text-base md:text-xl font-medium text-right"
                style={{ textAlign: 'right' }}
              >
                تأكيد كلمة المرور
              </span>
            </div>
            <div className="w-full">
              <Input
                label=""
                name="confirmPassword"
                type="password"
                placeholder="تأكيد كلمة المرور"
                register={register}
                error={errors.confirmPassword?.message}
                className="!h-[46px] !px-4 !py-0 rounded-sm bg-[rgba(234,234,234,0.25)] !border-black/16 text-right text-base font-normal text-black placeholder:text-black/60 placeholder:font-medium"
              />
            </div>
          </div>

          {/* Password Strength Indicator */}
          <div className="flex flex-col items-start gap-4">
            <PasswordStrengthIndicator password={password || ''} />
          </div>
        </div>

        {/* Update Password Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={!hasAllValues}
            className={`px-12 py-2 text-lg rounded-lg font-medium transition-colors ${
              hasAllValues
                ? 'bg-[#5D24E1] text-white cursor-pointer'
                : 'bg-[#c4c4c4] text-white cursor-not-allowed'
            }`}
          >
            تحديث كلمة المرور
          </button>
        </div>
      </form>
    </div>
  );
}
