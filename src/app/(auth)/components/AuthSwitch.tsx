import Link from 'next/link';
import React from 'react';

interface AuthSwitchProps {
  goTo: 'signin' | 'signup';
}

export default function AuthSwitch({ goTo }: AuthSwitchProps) {
  return (
    <p className="text-center text-sm text-gray-500 mt-5">
      {goTo === 'signin' ? (
        <>
          مسجل بالفعل؟ {``}
          <Link href="/signin" className="text-primary hover:underline">
            سجل الدخول
          </Link>
        </>
      ) : (
        <>
          ليس لديك حساب؟ {``}
          <Link href="/signup" className="text-primary hover:underline">
            إنشاء حساب
          </Link>
        </>
      )}
    </p>
  );
}
