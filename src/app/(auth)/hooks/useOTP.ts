import { useRef, useState } from 'react';

export function useOTP(length: number = 6) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const setInputRef = (idx: number) => (el: HTMLInputElement | null) => {
    inputsRef.current[idx] = el;
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < length - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0)
      inputsRef.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1)
      inputsRef.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);
    if (!text) return;
    const arr = text.split('');
    const next = Array(length).fill('');
    arr.forEach((d, idx) => {
      next[idx] = d;
    });
    setOtp(next as string[]);
    setTimeout(
      () => inputsRef.current[Math.min(arr.length, length - 1)]?.focus(),
      0
    );
  };

  const resetOtp = () => {
    setOtp(Array(length).fill(''));
    setTimeout(() => inputsRef.current[0]?.focus(), 0);
  };

  return {
    otp,
    setOtp,
    inputsRef,
    setInputRef,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    resetOtp,
  };
}
