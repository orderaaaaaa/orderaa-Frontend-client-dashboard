'use client';

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
import { useForgotPassword, useOTP } from '../hooks';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default function ForgotPasswordPage() {
  const {
    step,
    setStep,
    mode,
    setMode,
    identity,
    setIdentity,
    isLoading,
    error,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    sendCode: sendCodeAction,
    verifyOtp: verifyOtpAction,
    setNewPassword,
  } = useForgotPassword();

  const {
    otp,
    inputsRef,
    setInputRef,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    resetOtp,
  } = useOTP(6);

  const sendCode = async () => {
    const result = await sendCodeAction();
    if (result) {
      resetOtp();
    }
  };

  const verifyOtp = async () => {
    await verifyOtpAction(otp.join(''));
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
                  <a href="/signin" className="text-[#5D24E1] hover:underline">
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
                  <a href="/signin" className="text-[#5D24E1] hover:underline">
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
