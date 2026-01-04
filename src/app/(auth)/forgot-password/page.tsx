'use client';

import { Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { useForgotPassword, useOTP } from '../hooks';
import AuthForm from '../components/AuthForm';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const {
    step,
    setStep,
    email,
    setEmail,
    isLoading,
    error,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    sendCode: sendCodeAction,
    verifyOtp: verifyOtpAction,
    setNewPassword: setNewPasswordAction,
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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await sendCodeAction();
    if (result) {
      resetOtp();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOtpAction(otp.join(''));
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await setNewPasswordAction();
  };

  const handleResendCode = async () => {
    const result = await sendCodeAction();
    if (result) {
      resetOtp();
    }
  };

  // STEP 1: Request OTP via Email
  if (step === 'identify') {
    return (
      <AuthForm
        title="إعادة تعيين كلمة المرور"
        subtitle="أدخل بريدك الإلكتروني لنرسل لك كود التحقق"
        onSubmit={handleSendCode}
        error={error}
        isSubmitting={isLoading}
        submitButtonText="إرسال الكود"
        submitButtonLoadingText="جارٍ الإرسال..."
        switchGoTo="signin"
        showSwitch={false}
      >
        <div>
          <label htmlFor="email" className="block font-medium text-[16px] mb-1">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className="w-full border border-[#CED4DA] rounded-lg py-2.5 px-3 pr-10 text-[18px]"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Mail size={20} />
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          تذكّرت كلمة المرور؟{' '}
          <Link href="/signin" className="text-primary hover:underline">
            سجّل الدخول
          </Link>
        </p>
      </AuthForm>
    );
  }

  // STEP 2: Verify OTP
  if (step === 'otp') {
    return (
      <AuthForm
        title="أدخل كود التحقق"
        subtitle="أدخل الكود المرسل إلى بريدك الإلكتروني"
        onSubmit={handleVerifyOtp}
        error={error}
        isSubmitting={isLoading}
        submitButtonText="تحقّق"
        submitButtonLoadingText="جارٍ التحقق..."
        switchGoTo="signin"
        showSwitch={false}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <span className="text-sm text-gray-600">
              أدخل الكود المرسل إلى بريدك
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
                className="w-12 h-12 text-center text-lg border border-[#CED4DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={isLoading}
            className="w-full text-sm text-primary hover:underline disabled:opacity-60"
          >
            إعادة إرسال الكود
          </button>

          <button
            type="button"
            onClick={() => setStep('identify')}
            className="mx-auto flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للخطوة السابقة
          </button>
        </div>
      </AuthForm>
    );
  }

  // STEP 3: Reset Password
  return (
    <AuthForm
      title="تعيين كلمة مرور جديدة"
      subtitle="قم بتعيين كلمة مرور قوية وسهلة التذكّر"
      onSubmit={handleResetPassword}
      error={error}
      isSubmitting={isLoading}
      submitButtonText="تعيين كلمة المرور"
      submitButtonLoadingText="جارٍ الحفظ..."
      switchGoTo="signin"
      showSwitch={false}
    >
      <div>
        <label htmlFor="password" className="block font-medium text-[16px] mb-1">
          كلمة المرور الجديدة
        </label>
        <div className="relative">
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-[#CED4DA] rounded-lg py-2.5 px-3 pr-10 text-[18px]"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Lock size={20} />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          8 حروف/أرقام على الأقل.
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block font-medium text-[16px] mb-1">
          تأكيد كلمة المرور
        </label>
        <div className="relative">
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-[#CED4DA] rounded-lg py-2.5 px-3 pr-10 text-[18px]"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Lock size={20} />
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">
        تذكّرت كلمة المرور؟{' '}
        <Link href="/signin" className="text-primary hover:underline">
          سجّل الدخول
        </Link>
      </p>
    </AuthForm>
  );
}
