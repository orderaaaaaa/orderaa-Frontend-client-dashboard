'use client';

import { useForm } from 'react-hook-form';
import { Mail, User, Pen, Phone, MapIcon, Lock } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpSchema } from './schema';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Drobdown from '../../../components/ui/Drobdown';
import AuthForm from '../components/AuthForm';
import Input from '../../../components/ui/Input';
import { signUp } from '@/lib/api/auth';
import { useGovernorates, useCatigories, useCities } from '@/hooks';

export default function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState('');

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  const { register, handleSubmit, setValue, watch, formState } = form;
  const { errors, isSubmitting } = formState;
  const selectedGovernorate = watch('governorate');

  /** Load categories + governorates using custom hook */
  const { governorates, error: dataError } = useGovernorates();

  const { categories, error: categoryError } = useCatigories();

  /** Load cities when governorate changes using custom hook */
  const { cities, loadingCities } = useCities(selectedGovernorate);

  // Merge errors from hook
  if (dataError && categoryError && !error) {
    setError(dataError);
  }

  const onSubmit = async (values: SignUpSchema) => {
    setError('');
    try {
      const data = await signUp(values);

      if (data) router.push('/signin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب.');
    }
  };

  return (
    <AuthForm
      title="انشاء حساب جديد"
      subtitle="ادخل معلوماتك للمتابعة مع Orderaa"
      onSubmit={handleSubmit(onSubmit)}
      error={error}
      isSubmitting={isSubmitting}
      submitButtonText="إنشاء حساب"
      submitButtonLoadingText="جارٍ إنشاء الحساب..."
      switchGoTo="signin"
    >
      {/* Name */}
      <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
        <Input
          label="اسم صاحب المتجر"
          name="username"
          placeholder="أدخل اسمك"
          error={errors.username?.message}
          register={register}
          icon={User}
        />

        <Input
          label="أسم المتجر"
          name="merchantName"
          placeholder="أسم المتجر..."
          error={errors.merchantName?.message}
          register={register}
          icon={Pen}
        />
      </div>

      {/* Activity */}
      <Drobdown
        value={watch('category')}
        onChange={(val) => setValue('category', val)}
        options={categories}
        placeholder="اختر النشاط"
        label="نوع النشاط"
      />
      {errors.category && (
        <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
      )}

      {/* Email + Mobile */}
      <Input
        label="البريد الالكتروني"
        name="email"
        placeholder="أدخل بريدك الالكتروني..."
        error={errors.email?.message}
        register={register}
        icon={Mail}
      />

      <Input
        label="رقم الهاتف"
        name="phoneNumber"
        placeholder="أدخل رقم الهاتف"
        error={errors.phoneNumber?.message}
        register={register}
        icon={Phone}
      />

      {/* Governorate + City */}
      <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
        <Drobdown
          value={watch('governorate')}
          onChange={(val) => setValue('governorate', val)}
          options={governorates}
          placeholder="اختر المحافظة"
          label="المحافظة"
          icon={MapIcon}
        />

        <Drobdown
          value={watch('city')}
          onChange={(val) => setValue('city', val)}
          options={
            loadingCities ? [{ key: '', value: 'جار التحميل...' }] : cities
          }
          placeholder="اختر المدينة"
          label="المدينة"
          icon={MapIcon}
        />
      </div>

      {/* Passwords */}
      <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
        <Input
          label="كلمة المرور"
          name="password"
          type="password"
          placeholder="••••••••"
          error={errors?.password?.message}
          register={register}
          icon={Lock}
        />

        <Input
          label="تأكيد كلمة المرور"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          error={errors?.confirmPassword?.message}
          register={register}
          icon={Lock}
        />
      </div>
    </AuthForm>
  );
}
