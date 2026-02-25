'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LiaLockSolid } from 'react-icons/lia';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-red-50 rounded-full p-6 mb-6">
        <LiaLockSolid className="h-16 w-16 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        غير مصرح بالدخول
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        ليس لديك صلاحية للوصول إلى هذه الصفحة. يرجى التواصل مع المسؤول إذا كنت
        تعتقد أن هذا خطأ.
      </p>
      <Button asChild size="lg" className="min-w-[200px]">
        <Link href="/dashboard">العودة إلى الرئيسية</Link>
      </Button>
    </div>
  );
}
