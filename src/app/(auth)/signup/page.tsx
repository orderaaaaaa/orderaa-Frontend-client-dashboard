'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, User, Pen, Phone, Lock } from 'lucide-react';
import {
  LiaCheckCircleSolid,
  LiaShieldAltSolid,
  LiaStoreSolid,
  LiaMapMarkerAltSolid,
  LiaUserCircleSolid,
} from 'react-icons/lia';

import PageLoading from '@/components/ui/page-loading';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';

import Logo from '@/assets/images/Blue-logo.png';
import BrandLogo from '@/assets/images/IMG_5307.png';
import { signUp } from '@/lib/api/auth';
import { useCatigories } from '@/hooks';
import { useGovernoratesQuery, useCitiesQuery } from '@/services/lookups';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { signUpSchema, type SignUpSchema } from './schema';

const HIGHLIGHTS = [
  'إدارة كل أوردراتك من لوحة واحدة',
  'ربط فوري مع شركات الشحن والمتاجر الخارجية',
  'تقارير وتحليلات لحظية لكل قسم',
];

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

  const { data: governorates = [] } = useGovernoratesQuery();
  const { data: cities = [], isLoading: loadingCities } =
    useCitiesQuery(selectedGovernorate);
  const { categories } = useCatigories();

  if (isChecking) {
    return <PageLoading fullScreen />;
  }

  const onSubmit = async (values: SignUpSchema) => {
    setError('');
    try {
      const data = await signUp(values);
      if (data) router.push('/signin');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="min-h-screen flex flex-col lg:flex-row">
        <aside className="relative hidden lg:flex lg:w-[42%] xl:w-[40%] flex-col overflow-hidden bg-gradient-to-bl from-primary via-[#3D17A0] to-[#1E0A5C] p-12 text-white">
          <div
            aria-hidden
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] rounded-full bg-fuchsia-400/15 blur-3xl"
          />

          <div className="relative mb-8">
            <Link href="/" aria-label="Orderaa" className="inline-block">
              <Image
                src={BrandLogo}
                alt="Orderaa"
                priority
                className="h-auto w-40 xl:w-52 object-contain"
              />
            </Link>
          </div>

          <div className="relative space-y-8">
            <div>
              <p className="text-sm font-medium tracking-[0.3em] uppercase text-white/60 mb-3">
                Orderaa
              </p>
              <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
                ابدأ تشغيل متجرك
                <br />
                بكفاءة من اليوم
              </h2>
              <p className="mt-5 text-base xl:text-lg text-white/75 leading-relaxed max-w-md">
                نظام موحّد لإدارة الأوردرات، الكول سنتر، الشحن، والمخزون — كل
                شغل متجرك في مكان واحد.
              </p>
            </div>

            <ul className="space-y-3.5">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-start gap-3">
                  <span className="flex-shrink-0 grid place-items-center w-6 h-6 rounded-full bg-white/15 ring-1 ring-white/25 mt-0.5">
                    <LiaCheckCircleSolid className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-[15px] text-white/90">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-auto pt-10 flex items-center gap-3 text-xs text-white/60">
            <LiaShieldAltSolid className="w-4 h-4" />
            <span>بياناتك محمية بأعلى معايير الأمان</span>
          </div>
        </aside>

        <main className="flex-1 flex justify-center px-4 sm:px-6 py-2">
          <div className="w-full max-w-2xl">
            <div className="lg:hidden flex justify-center mb-8">
              <Image
                src={Logo}
                alt="Orderaa"
                width={140}
                priority
                className="h-auto w-32 sm:w-36"
              />
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 space-y-7"
            >
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormSection
                icon={<LiaUserCircleSolid className="w-4 h-4" />}
                title="بيانات المتجر"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="اسم صاحب المتجر"
                    name="username"
                    placeholder="أدخل اسمك"
                    error={errors.username?.message}
                    register={register}
                    icon={User}
                    inputClassName="bg-white"
                  />
                  <Input
                    label="اسم المتجر"
                    name="merchantName"
                    placeholder="مثلاً: متجر الأناقة"
                    error={errors.merchantName?.message}
                    register={register}
                    icon={Pen}
                    inputClassName="bg-white"
                  />
                </div>
                <FieldWrapper label="نوع النشاط" error={errors.category?.message}>
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
                </FieldWrapper>
              </FormSection>

              <FormSection
                icon={<LiaMapMarkerAltSolid className="w-4 h-4" />}
                title="بيانات التواصل والموقع"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="البريد الإلكتروني"
                    name="email"
                    placeholder="example@email.com"
                    error={errors.email?.message}
                    register={register}
                    icon={Mail}
                    inputClassName="bg-white"
                  />
                  <Input
                    label="رقم الهاتف"
                    name="phoneNumber"
                    placeholder="01XXXXXXXXX"
                    error={errors.phoneNumber?.message}
                    register={register}
                    icon={Phone}
                    inputClassName="bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldWrapper
                    label="المحافظة"
                    error={errors.governorate?.message}
                  >
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
                          error={errors.governorate?.message}
                          widthClass="w-full"
                        />
                      )}
                    />
                  </FieldWrapper>

                  <FieldWrapper label="المدينة" error={errors.city?.message}>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          options={cities}
                          placeholder={
                            selectedGovernorate
                              ? 'اختر المدينة'
                              : 'اختر المحافظة أولاً'
                          }
                          error={errors.city?.message}
                          widthClass="w-full"
                          disabled={!selectedGovernorate || loadingCities}
                          loading={loadingCities}
                        />
                      )}
                    />
                  </FieldWrapper>
                </div>
              </FormSection>

              <FormSection
                icon={<LiaShieldAltSolid className="w-4 h-4" />}
                title="تأمين الحساب"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="كلمة المرور"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    register={register}
                    icon={Lock}
                    inputClassName="bg-white"
                  />
                  <Input
                    label="تأكيد كلمة المرور"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    register={register}
                    icon={Lock}
                    inputClassName="bg-white"
                  />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  كلمة المرور لازم تكون 8 حروف على الأقل لضمان أمان حسابك.
                </p>
              </FormSection>

              <Button
                type="submit"
                size="xl"
                loading={isSubmitting}
                loadingText="جار إنشاء الحساب..."
                className="w-full"
              >
                إنشاء حساب
              </Button>

              <p className="text-center text-sm text-gray-500">
                مسجل بالفعل؟{' '}
                <Link
                  href="/signin"
                  className="text-primary font-medium hover:underline"
                >
                  سجل الدخول
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

function FormSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <span className="flex-1 h-px bg-gradient-to-l from-gray-200 to-transparent" />
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FieldWrapper({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="block font-medium text-base mb-2">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
