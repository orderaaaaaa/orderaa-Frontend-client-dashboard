'use client';

import { Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { useForgotPassword, useOTP } from '../hooks';
import AuthForm from '../components/AuthForm';
import Input from '../components/Input';
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
        <Input
          label="البريد الإلكتروني"
          name="email"
          type="email"
          placeholder="example@domain.com"
          icon={Mail}
          register={() => ({
            value: email,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value),
          })}
        />

        <p className="text-center text-sm text-gray-500">
          تذكّرت كلمة المرور؟{' '}
          <Link href="/signin" className="text-[#5D24E1] hover:underline">
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
            <KeyRound className="h-5 w-5 text-[#5D24E1]" />
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
            className="w-full text-sm text-[#5D24E1] hover:underline disabled:opacity-60"
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
      <Input
        label="كلمة المرور الجديدة"
        name="password"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        register={() => ({
          value: password,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value),
        })}
      />
      <p className="text-xs text-gray-500 -mt-3">
        8 حروف/أرقام على الأقل.
      </p>

      <Input
        label="تأكيد كلمة المرور"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        register={() => ({
          value: confirmPassword,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value),
        })}
      />

      <p className="text-center text-sm text-gray-500">
        تذكّرت كلمة المرور؟{' '}
        <Link href="/signin" className="text-[#5D24E1] hover:underline">
          سجّل الدخول
        </Link>
      </p>
    </AuthForm>
  );
}
