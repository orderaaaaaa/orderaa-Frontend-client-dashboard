import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'identify' | 'otp' | 'reset';
type Mode = 'email' | 'phone';

export function useForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('identify');
  const [mode, setMode] = useState<Mode>('email');
  const [identity, setIdentity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      return true;
    } catch {
      setError('فشل إرسال الكود. حاول مرة لاحقًا.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      setError('أدخل كود مكوّن من 6 أرقام.');
      return false;
    }
    setError('');
    setIsLoading(true);
    try {
      // محاكاة: استدعاء API للتحقق
      await new Promise((res) => setTimeout(res, 600));
      setStep('reset');
      setPassword('');
      setConfirmPassword('');
      return true;
    } catch {
      setError('كود غير صحيح. حاول مرة أخرى.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setNewPassword = async () => {
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 حروف/أرقام على الأقل.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return false;
    }
    setError('');
    setIsLoading(true);
    try {
      // محاكاة: استدعاء API لتعيين كلمة المرور الجديدة
      await new Promise((res) => setTimeout(res, 600));
      router.push('/signin');
      return true;
    } catch {
      setError('تعذّر تعيين كلمة المرور الآن. حاول لاحقًا.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    setStep,
    mode,
    setMode,
    identity,
    setIdentity,
    isLoading,
    error,
    setError,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    sendCode,
    verifyOtp,
    setNewPassword,
  };
}
