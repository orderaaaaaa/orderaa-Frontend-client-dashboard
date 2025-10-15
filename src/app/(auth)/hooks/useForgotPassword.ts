import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'identify' | 'otp' | 'reset';

export function useForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('identify');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = () => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) return 'من فضلك أدخل بريدًا إلكترونيًا صحيحًا.';
    return '';
  };

  const sendCode = async () => {
    const v = validateEmail();
    if (v) {
      setError(v);
      return false;
    }
    setError('');
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/forgot-password/send-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      // if (!response.ok) throw new Error('Failed to send OTP');
      
      // Temporary: Store email for next step
      localStorage.setItem('fp_email', email);
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
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/forgot-password/verify-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, otp: otpCode }),
      // });
      // if (!response.ok) throw new Error('Invalid OTP');
      
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
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/forgot-password/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // if (!response.ok) throw new Error('Failed to reset password');
      
      localStorage.removeItem('fp_email');
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
    email,
    setEmail,
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
