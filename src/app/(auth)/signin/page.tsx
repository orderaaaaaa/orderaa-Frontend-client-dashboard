'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInSchema } from './schema';
import { fetchMe, signIn } from '@/lib/api/auth';

import { Lock, User } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import Input from '../../../components/ui/Input';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();

  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = async (values: SignInSchema) => {
    setError('');
    try {
      const data = (await signIn(values)) as any;

      if (data?.access_token) {
        setToken(data.access_token);

        const userData = (await fetchMe(data.access_token)) as any;

        setUser(userData);

        router.push('/dashboard');
      } else {
        setError('خطأ في بيانات تسجيل الدخول.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول.');
    }
  };

  return (
    <AuthForm
      title="أهلاً بك من جديد!"
      subtitle="سجّل دخولك للمتابعة مع Orderaa"
      onSubmit={handleSubmit(onSubmit)}
      error={error}
      isSubmitting={isSubmitting}
      submitButtonText="تسجيل الدخول"
      submitButtonLoadingText="جاري تسجيل الدخول..."
      switchGoTo="signup"
    >
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
    </AuthForm>
  );
}
