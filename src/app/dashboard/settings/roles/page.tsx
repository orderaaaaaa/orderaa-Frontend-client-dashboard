'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { RolesContent } from './components';

function RolesLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري التحميل..." />
    </div>
  );
}

export default function RolesPage() {
  return (
    <Suspense fallback={<RolesLoading />}>
      <RolesContent />
    </Suspense>
  );
}
