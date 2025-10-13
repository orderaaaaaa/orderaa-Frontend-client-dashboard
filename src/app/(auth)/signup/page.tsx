'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpSchema } from './schema';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getCategories, getGovernorates, getCities } from '@/lib/api/lookups';
import Drobdown from '../components/Drobdown';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthHeader from '../components/AuthHeader';
import Input from '../components/Input';
import AuthSwitch from '../components/AuthSwitch';
import { signUp } from '@/lib/api/auth';

export default function SignUpForm() {
  const router = useRouter();

  const [categories, setCategories] = useState<
    { key: string; value: string }[]
  >([]);

  const [governorates, setGovernorates] = useState<
    { key: string; value: string }[]
  >([]);

  const [cities, setCities] = useState<{ key: string; value: string }[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  const { register, handleSubmit, setValue, watch, formState } = form;
  const { errors, isSubmitting } = formState;
  const selectedGovernorate = watch('governorate');

  /** Load categories + governorates on mount */
  useEffect(() => {
    Promise.all([getCategories(), getGovernorates()])
      .then(([cats, govs]) => {
        setCategories(cats as { key: string; value: string }[]);
        setGovernorates(govs as { key: string; value: string }[]);
      })
      .catch(() => setError('حدث خطأ أثناء تحميل البيانات.'));
  }, []);

  /** Load cities when governorate changes */
  useEffect(() => {
    if (!selectedGovernorate) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    getCities(selectedGovernorate)
      .then((cities) => setCities(cities as { key: string; value: string }[]))
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [selectedGovernorate]);

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
    <div className="min-h-screen flex items-center justify-center mt-10 mb-10">
      <section className="flex flex-col justify-center items-center p-12 border border-[#52525214] rounded-lg shadow-lg shadow-[#212121]">
        <AuthHeader
          title="انشاء حساب جديد"
          subtitle="ادخل معلوماتك للمتابعة مع Orderaa"
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full max-w-lg space-y-5 mx-auto mt-10"
          dir="rtl"
        >
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name */}
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <Input
              label="اسم صاحب المتجر"
              name="username"
              placeholder="أدخل اسمك"
              error={errors.username?.message}
              register={register}
            />

            <Input
              label="أسم المتجر"
              name="merchantName"
              placeholder="أسم المتجر..."
              error={errors.merchantName?.message}
              register={register}
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
            <p className="text-xs text-red-500 mt-1">
              {errors.category.message}
            </p>
          )}

          {/* Email + Mobile */}
          <Input
            label="البريد الالكتروني"
            name="email"
            placeholder="أدخل بريدك الالكتروني..."
            error={errors.email?.message}
            register={register}
          />

          <Input
            label="رقم الهاتف"
            name="phoneNumber"
            placeholder="أدخل رقم الهاتف"
            error={errors.phoneNumber?.message}
            register={register}
          />

          {/* Governorate + City */}
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <Drobdown
              value={watch('governorate')}
              onChange={(val) => setValue('governorate', val)}
              options={governorates}
              placeholder="اختر المحافظة"
              label="المحافظة"
            />

            <Drobdown
              value={watch('city')}
              onChange={(val) => setValue('city', val)}
              options={
                loadingCities ? [{ key: '', value: 'جار التحميل...' }] : cities
              }
              placeholder="اختر المدينة"
              label="المدينة"
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
            />

            <Input
              label="تأكيد كلمة المرور"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              error={errors?.confirmPassword?.message}
              register={register}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#5D24E1] text-white py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <AuthSwitch goTo="signin" />
      </section>
    </div>
  );
}
