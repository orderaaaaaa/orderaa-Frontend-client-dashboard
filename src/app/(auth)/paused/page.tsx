import Link from 'next/link';
import { LiaPauseCircleSolid } from 'react-icons/lia';
import AuthHeader from '../components/AuthHeader';

export default function PausedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-5 px-4">
      <section className="flex flex-col justify-center items-center p-7 w-full max-w-2xl border border-[#52525214] rounded-lg shadow-lg shadow-[#212121]">
        <AuthHeader title="تم إيقاف المتجر مؤقتًا" subtitle="تواصل مع الدعم لإعادة التفعيل" />

        <div
          className="flex flex-col items-center w-full max-w-lg gap-5 mx-auto mt-6"
          dir="rtl"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600">
            <LiaPauseCircleSolid className="w-9 h-9" />
          </div>

          <p className="text-center text-base text-[#878A99]">
            تم إيقاف المتجر مؤقتًا. تواصل مع الدعم.
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
