'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageLoading from '@/components/ui/page-loading';
import { shippingCompanyIdOf } from '@/lib/shippingCompanies';
import { InProcessShipmentsContent } from '../../components/InProcessShipmentsContent';

function InProcessShipmentsLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري التحميل..." />
    </div>
  );
}

function InProcessShipmentsPage() {
  const { key } = useParams<{ key: string }>();
  const shippingCompanyId = shippingCompanyIdOf(decodeURIComponent(key));

  if (shippingCompanyId === null) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="sm:px-8 py-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-gray-500">جهة الشحن غير موجودة</p>
          <Link
            href="/dashboard/shipping-providers"
            className="text-xs text-primary hover:underline"
          >
            رجوع إلى جهات الشحن
          </Link>
        </div>
      </div>
    );
  }

  return <InProcessShipmentsContent shippingCompanyId={shippingCompanyId} />;
}

export default function Page() {
  return (
    <Suspense fallback={<InProcessShipmentsLoading />}>
      <InProcessShipmentsPage />
    </Suspense>
  );
}
