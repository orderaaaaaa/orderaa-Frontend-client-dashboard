'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Cairo } from 'next/font/google';
import sideImage from '@/../public/premium_photo-1681488262364-8aeb1b6aac56.avif';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
});
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (email === 'Admin@gmail.com' && password === 'Admin@1234') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      router.push('/dashboard');
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    setIsLoading(false);
  };

  return (
    <div
      className={`${cairo.className} min-h-screen flex items-center justify-center bg-gray-50 p-6`}
    >
      {/* Card */}
      <div className="w-full max-w-5xl bg-white border rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: Image */}
        <div className="relative hidden md:block">
          {/* Put /public/login-illustration.jpg in your project */}
          <Image
            src={sideImage}
            alt="Welcome"
            fill
            className="object-left"
            priority
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Right: Login form */}
        {/* Right: Login form */}
        <div className="p-8 md:p-12 flex items-center">
          {/* dir="rtl" so 'start' is right side */}
          <form
            dir="rtl"
            onSubmit={handleLogin}
            className="w-full max-w-md space-y-5 mx-auto"
          >
            <div className="space-y-3">
              <Image
                className="mx-auto"
                src="/ordera.svg"
                alt="Ordera"
                width={250}
                height={109}
                priority
              />
              <h1 className="text-2xl font-bold text-center">
                أهلاً بك من جديد!
              </h1>
              <p className="text-sm text-gray-500 text-center">
                سجّل دخولك للمتابعة مع Orderaa
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Email/Phone — icon at start (right) */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  البريد الالكتروني / رقم الموبايل
                </label>
                <div className="relative">
                  {/* START (right) */}
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="username"
                    required
                    className="w-full pr-10 pl-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Password — SWAPPED: Eye at start (right), Lock at end (left) */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  {/* START (right) — Eye toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    aria-label={
                      showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {/* END (left) — Lock icon */}
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pr-10 pl-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  تذكرني
                </label>
                <a
                  href="/forgetPassword"
                  className="text-[#5D24E1] hover:underline"
                >
                  نسيت كلمة المرور؟
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5D24E1] text-white py-2.5 rounded-lg  transition disabled:opacity-60"
            >
              {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>

            <p className="text-center text-sm text-gray-500">
              ليس لديك حساب؟{' '}
              <a href="/signUp" className="text-[#5D24E1] hover:underline">
                أنشئ حسابًا
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
