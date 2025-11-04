'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeFormSchema, EmployeeFormData } from '@/schemas/employee.schema';
import { UserPlus, Eye, EyeOff, Lock, User, Phone, MapPin, Mail, Clock } from 'lucide-react';

interface AddEmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => void;
  isLoading?: boolean;
}

export default function AddEmployeeForm({ onSubmit, isLoading = false }: AddEmployeeFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      accessLevel: '',
      department: '',
      fullName: '',
      phoneNumber: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
      workingHours: '',
    },
  });

  const handleFormSubmit = (data: EmployeeFormData) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
      {/* Header */}
      <div className="bg-purple-50 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold text-gray-800">إضافة موظف جديد</h2>
            <p className="text-sm text-gray-600">املأ تفاصيل الموظف</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* مستوى الصلاحية */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <User className="w-4 h-4" />
            <span>مستوى الصلاحية</span>
          </label>
          <Controller
            name="accessLevel"
            control={control}
            render={({ field }) => (
              <div>
                <select
                  {...field}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.accessLevel ? 'border-red-500' : 'border-gray-300'
                  } bg-white text-right focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="">اختر مستوى الصلاحية</option>
                  <option value="موظف">موظف</option>
                  <option value="مدير">مدير</option>
                  <option value="سيرفر احمد">سيرفر احمد</option>
                  <option value="خدمن">خدمن</option>
                </select>
                {errors.accessLevel && (
                  <p className="mt-1 text-sm text-red-500 text-right">{errors.accessLevel.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* القسم الإداري */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="w-4 h-4">📋</span>
            <span>القسم الإداري</span>
          </label>
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <div>
                <select
                  {...field}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  } bg-white text-right focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="">اختر القسم</option>
                  <option value="الأقسام">الأقسام</option>
                  <option value="تنفيذ">تنفيذ</option>
                  <option value="منتجة">منتجة</option>
                  <option value="تروتج">تروتج</option>
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-500 text-right">{errors.department.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* رقم الهاتف */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Phone className="w-4 h-4" />
            <span>رقم الهاتف</span>
          </label>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <div>
                <input
                  {...field}
                  type="tel"
                  placeholder="رقم الهاتف"
                  dir="ltr"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  } bg-white text-left focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500 text-right">{errors.phoneNumber.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* البريد الإلكتروني */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Mail className="w-4 h-4" />
            <span>البريد الإلكتروني</span>
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <div>
                <input
                  {...field}
                  type="email"
                  placeholder="البريد الإلكتروني"
                  dir="ltr"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } bg-white text-left focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 text-right">{errors.email.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* العنوان */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4" />
            <span>العنوان</span>
          </label>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <div>
                <input
                  {...field}
                  type="text"
                  placeholder="العنوان"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  } bg-white text-right focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500 text-right">{errors.address.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* كلمة المرور */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Lock className="w-4 h-4" />
            <span>كلمة المرور</span>
          </label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <div>
                <div className="relative">
                  <input
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="كلمة المرور"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } bg-white text-right focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500 text-right">{errors.password.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* تأكيد كلمة المرور */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Lock className="w-4 h-4" />
            <span>تأكيد كلمة المرور</span>
          </label>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <div>
                <div className="relative">
                  <input
                    {...field}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="تأكيد كلمة المرور"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } bg-white text-right focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 text-right">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* أوقات العمل */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4" />
            <span>أوقات العمل</span>
          </label>
          <Controller
            name="workingHours"
            control={control}
            render={({ field }) => (
              <div>
                <input
                  {...field}
                  type="text"
                  placeholder="9 - AM - 5 - PM"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-left focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-6 py-3 rounded-full border-2 border-pink-500 text-pink-500 font-medium hover:bg-pink-50 transition-colors"
            disabled={isLoading}
          >
            غلق الان
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري الإضافة...</span>
              </>
            ) : (
              <>
                <span>إضافة موظف جديد</span>
                <span>+</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}



