import Link from 'next/link';
import React from 'react';

interface AuthSwitchProps {
  goTo: 'signin' | 'signup';
}

export default function AuthSwitch({ goTo }: AuthSwitchProps) {
  return (
    <p className="text-center text-sm text-gray-500 mt-11">
      {goTo === 'signin' ? (
        <>
          مسجل بالفعل؟ {``}
          <Link href="/signin" className="text-[#5D24E1] hover:underline">
            سجل الدخول
          </Link>
        </>
      ) : (
        <>
          ليس لديك حساب؟
          <Link href="/signup" className="text-[#5D24E1] hover:underline">
            إنشاء حساب{``}
          </Link>
        </>
      )}
    </p>
  );
}
