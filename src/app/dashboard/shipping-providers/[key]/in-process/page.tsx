'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import PageLoading from '@/components/ui/page-loading';
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
  const carrierKey = decodeURIComponent(key);

  return <InProcessShipmentsContent carrierKey={carrierKey} />;
}

export default function Page() {
  return (
    <Suspense fallback={<InProcessShipmentsLoading />}>
      <InProcessShipmentsPage />
    </Suspense>
  );
}
