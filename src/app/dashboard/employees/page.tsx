'use client';

import React, { useState } from 'react';
import { User, Phone, Briefcase, MapPin, Mail, Lock, Clock, Eye, EyeOff, ChevronDown, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, type EmployeeFormData } from '@/schemas/employee.schema';
import { employeesApi } from '@/services/employees.api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const onSubmit = async (data: EmployeeFormData) => {
    if (!token) {
      toast.error('يرجى تسجيل الدخول أولاً');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await employeesApi.create(token, data);
      toast.success('تم إضافة الموظف بنجاح');
      reset();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'حدث خطأ أثناء إضافة الموظف';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = () => {
    reset();
  };

  return (
    <div className="w-full max-w-[1242px] mx-auto" dir="rtl" style={{ direction: 'rtl' }}>
      {/* Main Container */}
      <div className="bg-white border border-black/8 shadow-[0px_4px_22px_rgba(0,0,0,0.08)] rounded-lg">
        {/* Header */}
        <div className="h-[137px] bg-[rgba(93,36,225,0.08)] flex items-center px-12" style={{ direction: 'rtl', justifyContent: 'flex-start' }}>
          <div className="flex items-center gap-5" style={{ direction: 'rtl', justifyContent: 'flex-start' }}>
            <div className="w-[53px] h-[52px] bg-[#5D24E1] shadow-[0px_4px_22px_rgba(0,0,0,0.08)] rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-end gap-1" style={{ textAlign: 'right', alignItems: 'flex-end' }}>
              <h1 className="text-2xl font-normal" style={{ fontFamily: 'Janna LT', textAlign: 'right', width: '100%' }}>
                إضافة موظف جديد
              </h1>
              <p className="text-base font-normal text-black" style={{ fontFamily: 'Janna LT', textAlign: 'right', width: '100%' }}>
                املأ جميع البيانات لإضافة الموظف
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-[165px] py-[34px]" style={{ direction: 'rtl' }}>
          <div className="flex flex-col items-end gap-6" style={{ direction: 'rtl' }}>
            {/* صلاحية الموظف */}
            <div className="w-full flex flex-col items-end gap-4" style={{ direction: 'rtl' }}>
              <div className="w-full flex items-center gap-2" style={{ direction: 'rtl', justifyContent: 'flex-start', width: '100%', alignItems: 'center' }}>
                <User className="w-6 h-6 text-[#5D24E1] flex-shrink-0" strokeWidth={1.5} />
                <span className="text-lg font-normal text-right" style={{ fontFamily: 'Janna LT', textAlign: 'right' }}>
                  صلاحية الموظف
                </span>
              </div>
              <div className="w-full h-[46px] bg-[rgba(234,234,234,0.25)] border border-black/16 rounded relative">
                <select
                  {...register('accessLevel')}
                  className="w-full h-full px-4 pr-10 bg-transparent text-right text-base font-normal text-black/60 appearance-none"
                  style={{ fontFamily: 'Janna LT', direction: 'rtl', textAlign: 'right' }}
                >
                  <option value="">اختر صلاحية الموظف</option>
                  <option value="SUPER_ADMIN">سوبر ادمن</option>
                  <option value="ADMIN">ادمن</option>
                  <option value="MANAGER">مدير</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-black/60" />
              </div>
              {errors.accessLevel && (
                <span className="text-red-500 text-sm text-right" style={{ textAlign: 'right' }}>{errors.accessLevel.message}</span>
              )}
            </div>

            {/* قسم الموظف */}
            <div className="w-full flex flex-col items-end gap-4" style={{ direction: 'rtl' }}>
              <div className="w-full flex items-center gap-2" style={{ direction: 'rtl', justifyContent: 'flex-start', width: '100%', alignItems: 'center' }}>
                <User className="w-6 h-6 text-[#5D24E1] flex-shrink-0" strokeWidth={1.5} />
                <span className="text-lg font-normal text-right" style={{ fontFamily: 'Janna LT', textAlign: 'right' }}>
                  قسم الموظف
                </span>
              </div>
              <div className="w-full h-[46px] bg-[rgba(234,234,234,0.25)] border border-black/16 rounded relative">
                <select
                  {...register('department')}
                  className="w-full h-full px-4 pr-10 bg-transparent text-right text-base font-normal text-black/60 appearance-none"
                  style={{ fontFamily: 'Janna LT', direction: 'rtl', textAlign: 'right' }}
                >
                  <option value="">اختر القسم</option>
                  <option value="CONFIRMATION">تاكيد</option>
                  <option value="FOLLOW_UP">متابعة</option>
                  <option value="RETURNS">مرتجع</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-black/60" />
              </div>
              {errors.department && (
                <span className="text-red-500 text-sm text-right" style={{ textAlign: 'right' }}>{errors.department.message}</span>
              )}
            </div>

            {/* الاسم الكامل و رقم الهاتف */}
            <div className="w-full flex items-start gap-10" style={{ direction: 'rtl' }}>
              {/* الاسم الكامل - First in RTL (right side) */}
              <div className="flex-1 flex flex-col items-end gap-4" style={{ direction: 'rtl' }}>
                <div className="w-full flex items-center gap-2" style={{ direction: 'rtl', justifyContent: 'flex-start', width: '100%', alignItems: 'center' }}>
                  <Briefcase className="w-6 h-6 text-[#5D24E1] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-lg font-normal text-right" style={{ fontFamily: 'Janna LT', textAlign: 'right' }}>
                    الاسم الكامل للموظف
                  </span>
                </div>
                <input
                  {...register('fullName')}
                  type="text"
                  placeholder="أدخل الاسم الكامل"
                  className="w-full h-[46px] px-4 bg-[rgba(234,234,234,0.25)] border border-black/16 rounded text-right text-base font-normal text-black placeholder:text-black/60"
                  style={{ fontFamily: 'Janna LT', direction: 'rtl', textAlign: 'right' }}
                />
                {errors.fullName && (
                  <span className="text-red-500 text-sm text-right" style={{ textAlign: 'right' }}>{errors.fullName.message}</span>
                )}
              </div>

              {/* رقم الهاتف - Second in RTL (left side) */}
              <div className="flex-1 flex flex-col items-end gap-4" style={{ direction: 'rtl' }}>
                <div className="w-full flex items-center gap-2" style={{ direction: 'rtl', justifyContent: 'flex-start', width: '100%', alignItems: 'center' }}>
                  <Phone className="w-6 h-6 text-[#5D24E1] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-lg font-normal text-right" style={{ fontFamily: 'Janna LT', textAlign: 'right' }}>
                    رقم الهاتف
                  </span>
                </div>
                <input
                  {...register('phoneNumber')}
                  type="text"
                  placeholder="01234567890"
                  dir="ltr"
                  className="w-full h-[46px] px-4 bg-[rgba(234,234,234,0.25)] border border-black/16 rounded text-right text-base font-normal text-black placeholder:text-black/60"
                  style={{ fontFamily: 'Janna LT', textAlign: 'right' }}
                />
                {errors.phoneNumber && (
                  <span className="text-red-500 text-sm text-right" style={{ textAlign: 'right' }}>{errors.phoneNumber.message}</span>
                )}
              </div>
            </div>

            {/* البريد الإلكتروني و العنوان */}
            <div className="w-full flex items-start gap-10" style={{ direction: 'rtl' }}>
              {/* البريد الإلكتروني - First in RTL (right side) */}
              <div className="flex-1 flex flex-col items-end gap-4" style={{ direction: 'rtl' }}>
                <div className="w-full flex items-center gap-2" style={{ direction: 'rtl', justifyContent: 'flex-start', width: '100%', alignItems: 'center' }}>
                  <Mail className="w-6 h-6 text-[#001A72] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-lg font-normal text-right" style={{ fontFamily: 'Janna LT', textAlign: 'right' }}>
                    البريد الإلكتروني
                  </span>
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="example@domain.com"
                  dir="ltr"
                  className="w-full h-[46px] px-4 bg-[rgba(234,234,234,0.25)] border border-black/16 rounded text-right text-base font-normal text-black placeholder:text-black/60"
                  style={{ fontFamily: 'Janna LT', textAlign: 'right' }}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm text-right" style={{ textAlign: 'right' }}>{errors.email.message}</span>
                )}
              </div>

              {/* العنوان - Second in RTL (left side) */}
              <div className="flex-1 flex flex-col items-end gap-4" style={{ direction: 'rtl' }}>
                <div className="w-full flex items-center gap-2" style={{ direction: 'rtl', justifyContent: 'flex-start', width: '100%', alignItems: 'center' }}>
                  <MapPin className="w-6 h-6 text-[#5D24E1] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-lg font-normal text-right" style={{ fontFamily: 'Janna LT', textAlign: 'right' }}>
                    العنوان
                  </span>
                </div>
                <input
                  {...register('address')}
                  type="text"
                  placeholder="العنوان"
                  className="w-full h-[46px] px-4 bg-[rgba(234,234,234,0.25)] border border-black/16 rounded text-right text-base font-normal text-black placeholder:text-black/60"
                  style={{ fontFamily: 'Janna LT', direction: 'rtl', textAlign: 'right' }}
                />
                {errors.address && (
                  <span className="text-red-500 text-sm text-right" style={{ textAlign: 'right' }}>{errors.address.message}</span>
                )}
              </div>
            </div>

            {/* كلمة المرور و تأكيد كلمة المرور */}
            <div className="w-full flex items-start gap-10" style={{ direction: 'rtl' }}>
              {/* كلمة المرور - First in RTL (right side) */}
              <div className="flex-1 flex flex-col items-end gap-4" style={{ direction: 'rtl' }}>
                <div className="w-full flex items-center gap-2" style={{ direction: 'rtl', justifyContent: 'flex-start', width: '100%', alignItems: 'center' }}>
                  <Lock className="w-6 h-6 text-[#5D24E1] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-lg font-normal text-right" style={{ fontFamily: 'Janna LT', textAlign: 'right' }}>
                    كلمة المرور
                  </span>
                </div>
                <div className="relative w-full">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="كلمة المرور"
                    className="w-full h-[46px] px-4 pr-12 bg-[rgba(234,234,234,0.25)] border border-black/16 rounded text-right text-base font-normal text-black placeholder:text-black/60"
                    style={{ fontFamily: 'Janna LT', direction: 'rtl', textAlign: 'right' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4 text-[#757575]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[#757575]" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-sm text-right" style={{ textAlign: 'right' }}>{errors.password.message}</span>
                )}
              </div>

              {/* تأكيد كلمة المرور - Second in RTL (left side) */}
              <div className="flex-1 flex flex-col items-end gap-4" style={{ direction: 'rtl' }}>
                <div className="w-full flex items-center gap-2" style={{ direction: 'rtl', justifyContent: 'flex-start', width: '100%', alignItems: 'center' }}>
                  <Lock className="w-6 h-6 text-[#5D24E1] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-lg font-normal text-right" style={{ fontFamily: 'Janna LT', textAlign: 'right' }}>
                    تأكيد كلمة المرور
                  </span>
                </div>
                <div className="relative w-full">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="أعد كتابة كلمة المرور"
                    className="w-full h-[46px] px-4 pr-12 bg-[rgba(234,234,234,0.25)] border border-black/16 rounded text-right text-base font-normal text-black placeholder:text-black/60"
                    style={{ fontFamily: 'Janna LT', direction: 'rtl', textAlign: 'right' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <Eye className="w-4 h-4 text-[#757575]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[#757575]" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-red-500 text-sm text-right" style={{ textAlign: 'right' }}>{errors.confirmPassword.message}</span>
                )}
              </div>
            </div>

            {/* ساعات العمل */}
            <div className="w-full flex items-start gap-10" style={{ direction: 'rtl' }}>
              {/* ساعات العمل - on the right side */}
              <div className="flex-1 flex flex-col items-end gap-4" style={{ direction: 'rtl' }}>
                <div className="w-full flex items-center gap-2" style={{ direction: 'rtl', justifyContent: 'flex-start', width: '100%', alignItems: 'center' }}>
                  <Clock className="w-6 h-6 text-[#5D24E1] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-lg font-normal text-right" style={{ fontFamily: 'Janna LT', textAlign: 'right' }}>
                    ساعات العمل
                  </span>
                </div>
                <input
                  {...register('workingHours')}
                  type="text"
                  placeholder="من 9 صباحاً إلى 5 مساءً"
                  className="w-full h-[46px] px-4 bg-[rgba(234,234,234,0.25)] border border-black/16 rounded text-right text-base font-normal text-black placeholder:text-black/60"
                  style={{ fontFamily: 'Janna LT', direction: 'rtl', textAlign: 'right' }}
                />
                {errors.workingHours && (
                  <span className="text-red-500 text-sm text-right" style={{ textAlign: 'right' }}>{errors.workingHours.message}</span>
                )}
              </div>
              <div className="flex-1"></div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex items-center justify-start gap-4 mt-8" style={{ direction: 'rtl', justifyContent: 'flex-start' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#5D24E1] text-white rounded-lg text-lg font-normal hover:bg-[#682fee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ fontFamily: 'Janna LT', direction: 'rtl' }}
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                <span className="text-right" style={{ textAlign: 'right' }}>{isSubmitting ? 'جاري الإضافة...' : 'إضافة موظف جديد'}</span>
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-8 py-3 bg-white border border-[#5D24E1] text-[#5D24E1] rounded-lg text-lg font-normal hover:bg-[#5D24E1]/5 transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Janna LT', direction: 'rtl' }}
              >
                <X className="w-5 h-5 flex-shrink-0" />
                <span className="text-right" style={{ textAlign: 'right' }}>مسح الكل</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
