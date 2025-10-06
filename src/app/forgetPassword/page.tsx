'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Cairo } from 'next/font/google';
import sideImage from '@/../public/premium_photo-1681488262364-8aeb1b6aac56.avif';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
});

type Step = 'identify' | 'otp' | 'reset';
type Mode = 'email' | 'phone';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('identify');
  const [mode, setMode] = useState<Mode>('email');

  // identify
  const [identity, setIdentity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // otp
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const setInputRef = (idx: number) => (el: HTMLInputElement | null) => {
    inputsRef.current[idx] = el;
  };

  // reset
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // helpers
  const validateIdentity = () => {
    if (mode === 'email') {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity);
      if (!ok) return 'من فضلك أدخل بريدًا إلكترونيًا صحيحًا.';
    } else {
      const digits = identity.replace(/\D/g, '');
      const ok = /^\d{10,15}$/.test(digits);
      if (!ok) return 'رقم الموبايل يجب أن يكون من 10 إلى 15 رقمًا.';
    }
    return '';
  };

  const sendCode = async () => {
    const v = validateIdentity();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      // محاكاة: استدعاء API لإرسال الكود
      localStorage.setItem('fp_identity', JSON.stringify({ mode, identity }));
      await new Promise((res) => setTimeout(res, 600));
      setStep('otp');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputsRef.current[0]?.focus(), 0);
    } catch {
      setError('فشل إرسال الكود. حاول مرة لاحقًا.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0)
      inputsRef.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const arr = text.split('');
    const next = Array(6).fill('');
    arr.forEach((d, idx) => {
      next[idx] = d;
    });
    setOtp(next as string[]);
    setTimeout(() => inputsRef.current[Math.min(arr.length, 5)]?.focus(), 0);
  };

  const verifyOtp = async () => {
    if (otp.join('').length !== 6) {
      setError('أدخل كود مكوّن من 6 أرقام.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      // محاكاة: استدعاء API للتحقق
      await new Promise((res) => setTimeout(res, 600));
      setStep('reset');
      setPassword('');
      setConfirmPassword('');
    } catch {
      setError('كود غير صحيح. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const setNewPassword = async () => {
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 حروف/أرقام على الأقل.');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      // محاكاة: استدعاء API لتعيين كلمة المرور الجديدة
      await new Promise((res) => setTimeout(res, 600));
      router.push('/');
    } catch {
      setError('تعذّر تعيين كلمة المرور الآن. حاول لاحقًا.');
    } finally {
      setIsLoading(false);
    }
  };

  const Title = () => {
    if (step === 'identify') return 'إعادة تعيين كلمة المرور';
    if (step === 'otp') return 'أدخل كود التحقق';
    return 'تعيين كلمة مرور جديدة';
  };

  return (
    <div
      className={`${cairo.className} min-h-screen flex items-center justify-center bg-gray-50 p-6`}
    >
      <div className="w-full max-w-5xl bg-white border rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left: Image */}
        <div className="relative hidden md:block">
          <Image
            src={sideImage}
            alt="Forgot Password"
            fill
            className="object-left"
            priority
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Right: Form */}
        <div className="p-8 md:p-12 flex items-center">
          <div dir="rtl" className="w-full max-w-lg space-y-5 mx-auto">
            <div className="space-y-3">
              <Image
                className="mx-auto"
                src="/ordera.svg"
                alt="Ordera"
                width={250}
                height={109}
                priority
              />
              <h1 className="text-2xl font-extrabold text-center">
                {' '}
                {Title()}{' '}
              </h1>
              <p className="text-sm text-gray-500 text-center">
                {step === 'identify' &&
                  'اختر طريقة الاسترجاع وأدخل بياناتك لنرسل لك كود التحقق.'}
                {/* {step === "otp" && "من فضلك أدخل الكود المرسل إليك."} */}
                {step === 'reset' && 'قم بتعيين كلمة مرور قوية وسهلة التذكّر.'}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* STEP 1: IDENTIFY */}
            {step === 'identify' && (
              <div className="space-y-5">
                {/* Switch: Email / Phone */}
                <div className="flex items-center justify-center">
                  <div className="inline-flex rounded-full border p-1 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setMode('email')}
                      className={`px-4 py-1.5 text-sm rounded-full transition ${
                        mode === 'email'
                          ? 'bg-[#5D24E1] text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      بالبريد
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('phone')}
                      className={`px-4 py-1.5 text-sm rounded-full transition ${
                        mode === 'phone'
                          ? 'bg-[#5D24E1] text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      بالموبايل
                    </button>
                  </div>
                </div>

                {/* Single Input */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {mode === 'email' ? 'البريد الإلكتروني' : 'رقم الموبايل'}
                  </label>
                  <div className="relative">
                    {mode === 'email' ? (
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    ) : (
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    )}
                    <input
                      dir="rtl"
                      type={mode === 'email' ? 'email' : 'tel'}
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      placeholder={
                        mode === 'email'
                          ? 'example@domain.com'
                          : 'مثال: 01123456789'
                      }
                      inputMode={mode === 'email' ? 'email' : 'numeric'}
                      className="w-full pr-10 pl-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
                    />
                  </div>
                  {mode === 'phone' && (
                    <p className="text-xs text-gray-500 mt-1">
                      من 10 إلى 15 رقمًا بدون مسافات أو فواصل.
                    </p>
                  )}
                </div>

                <button
                  onClick={sendCode}
                  disabled={isLoading}
                  className="w-full bg-[#5D24E1] text-white py-2.5 rounded-lg transition disabled:opacity-60"
                >
                  {isLoading ? 'جارٍ الإرسال...' : 'إرسال الكود'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  تذكّرت كلمة المرور؟{' '}
                  <a href="/" className="text-[#5D24E1] hover:underline">
                    سجّل الدخول
                  </a>
                </p>
              </div>
            )}

            {/* STEP 2: OTP */}
            {step === 'otp' && (
              <div className="space-y-5">
                <div className="flex items-center justify-center gap-2">
                  <KeyRound className="h-5 w-5 text-[#5D24E1]" />
                  <span className="text-sm text-gray-600">
                    أدخل الكود المرسل إلى{' '}
                    {mode === 'email' ? 'بريدك' : 'موبايلك'}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {[5, 4, 3, 2, 1, 0].map((i) => (
                    <input
                      key={i}
                      ref={setInputRef(i)}
                      value={otp[i]}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      maxLength={1}
                      inputMode="numeric"
                      className="w-12 h-12 text-center text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={verifyOtp}
                    disabled={isLoading}
                    className="flex-1 bg-[#5D24E1] text-white py-2.5 rounded-lg transition disabled:opacity-60"
                  >
                    {isLoading ? 'جارٍ التحقق...' : 'تحقّق'}
                  </button>
                  <button
                    onClick={sendCode}
                    disabled={isLoading}
                    className="px-4 py-2.5 border rounded-lg"
                  >
                    إعادة إرسال
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('identify')}
                  className="mx-auto flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <ArrowRight className="h-4 w-4" />
                  تغيير الطريقة
                </button>
              </div>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 'reset' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
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
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      className="w-full pr-10 pl-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    8 حروف/أرقام على الأقل.
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      aria-label={
                        showConfirmPassword
                          ? 'إخفاء كلمة المرور'
                          : 'إظهار كلمة المرور'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      className="w-full pr-10 pl-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <button
                  onClick={setNewPassword}
                  disabled={isLoading}
                  className="w-full bg-[#5D24E1] text-white py-2.5 rounded-lg transition disabled:opacity-60"
                >
                  {isLoading ? 'جارٍ الحفظ...' : 'تعيين كلمة المرور'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  تذكّرت كلمة المرور؟{' '}
                  <a href="/" className="text-[#5D24E1] hover:underline">
                    سجّل الدخول
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
