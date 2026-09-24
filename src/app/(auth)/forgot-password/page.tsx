'use client';

import Link from 'next/link';
import { LiaLockSolid } from 'react-icons/lia';
import PageLoading from '@/components/ui/page-loading';
import AuthHeader from '../components/AuthHeader';
import { useAuthGuard } from '@/hooks/useAuthGuard';

const CONTACT_SUPPORT_MESSAGE =
  'إعادة تعيين كلمة المرور غير متاحة حاليًا. تواصل مع الدعم لتعيين كلمة مرور جديدة.';

export default function ForgotPasswordPage() {
  const { isChecking } = useAuthGuard(false);

  if (isChecking) {
    return <PageLoading className="h-64 mt-10" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-5 px-4">
      <section className="flex flex-col justify-center items-center p-7 w-full max-w-2xl border border-[#52525214] rounded-lg shadow-lg shadow-[#212121]">
        <AuthHeader
          title="إعادة تعيين كلمة المرور"
          subtitle="تواصل مع الدعم لتعيين كلمة مرور جديدة"
        />

        <div
          className="flex flex-col items-center w-full max-w-lg gap-5 mx-auto mt-6"
          dir="rtl"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600">
            <LiaLockSolid className="w-9 h-9" />
          </div>

          <p className="text-center text-base text-[#878A99]">
            {CONTACT_SUPPORT_MESSAGE}
          </p>

          <Link
            href="/signin"
            className="w-full text-center bg-primary text-white py-2.5 rounded-lg transition"
          >
            العودة لتسجيل الدخول
          </Link>
        </div>
      </section>
    </div>
  );
}
