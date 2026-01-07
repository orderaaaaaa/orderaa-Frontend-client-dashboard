'use client';

import { useForm, Controller } from 'react-hook-form';
import { Mail, User, Pen, Phone, Lock } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpSchema } from './schema';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '../components/AuthForm';
import Input from '../../../components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { signUp } from '@/lib/api/auth';
import { useCatigories } from '@/hooks';
import { useGovernoratesQuery, useCitiesQuery } from '@/services/lookups';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState('');

  const { isChecking } = useAuthGuard(false);

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      merchantName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      category: '',
      governorate: '',
      city: '',
    },
  });

  const { register, handleSubmit, setValue, watch, control, formState } = form;
  const { errors, isSubmitting } = formState;
  const selectedGovernorate = watch('governorate');

  const { data: governorates = [], error: governoratesError } =
    useGovernoratesQuery();
  const { data: cities = [], isLoading: loadingCities } =
    useCitiesQuery(selectedGovernorate);
  const { categories, error: categoryError } = useCatigories();

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-64 mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Merge errors from hook
  if (governoratesError && categoryError && !error) {
    setError(governoratesError.message || 'حدث خطأ في تحميل البيانات');
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
      submitButtonLoadingText="جار إنشاء الحساب..."
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
      <div className="flex flex-col gap-1">
        <label className="block mb-1 font-medium text-[16px]">نوع النشاط</label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={categories}
              placeholder="اختر النشاط"
              error={errors.category?.message}
              clearable
            />
          )}
        />
      </div>

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
        <div className="flex flex-col gap-1 w-full">
          <label className="block mb-1 font-medium text-[16px]">المحافظة</label>
          <Controller
            name="governorate"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value || ''}
                onChange={(val) => {
                  field.onChange(val);
                  setValue('city', '', { shouldValidate: true });
                }}
                onBlur={field.onBlur}
                options={governorates}
                placeholder="اختر المحافظة"
                widthClass="w-full"
                error={errors.governorate?.message}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="block mb-1 font-medium text-[16px]">المدينة</label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={cities}
                placeholder="اختر المدينة"
                error={errors.city?.message}
                widthClass="w-full"
                disabled={!selectedGovernorate || loadingCities}
                loading={loadingCities}
              />
            )}
          />
        </div>
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
