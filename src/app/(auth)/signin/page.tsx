'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInSchema } from './schema';
import { signIn } from '@/lib/api/auth';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, User } from 'lucide-react';
import AuthHeader from '../components/AuthHeader';
import Input from '../components/Input';
import AuthSwitch from '../components/AuthSwitch';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = async (values: SignInSchema) => {
    setError('');
    try {
      const data = await signIn(values);
      if (data) router.push('/dashboard');
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

          <Input
            label="الهاتف/البريد الالكتروني"
            name="emailOrPhoneNumber"
            placeholder="أدخل هاتفك او بريدك الالكتروني..."
            error={errors.emailOrPhoneNumber?.message}
            register={register}
            icon={User}
          />

          <Input
            label="كلمة المرور"
            name="password"
            type="password"
            placeholder="••••••••"
            error={errors?.password?.message}
            register={register}
            icon={Lock}
          />

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <label htmlFor="remember-me" className="text-sm">
                تذكرني
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-[#5D24E1] hover:underline"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#5D24E1] text-white py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <AuthSwitch goTo="signup" />
      </section>
    </div>
  );
}
