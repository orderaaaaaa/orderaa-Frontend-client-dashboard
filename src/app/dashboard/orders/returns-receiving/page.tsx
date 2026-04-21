// TODO: Permissions — when src/constants/permissions.ts lands, gate this
// route with PERMISSION_PRESETS.MANAGER_AND_ABOVE (shipping/warehouse flow).
// Also add `permission: PERMISSION_PRESETS.MANAGER_AND_ABOVE` to the matching
// navbar item in src/constants/Navbar.ts and the route entry in
// src/constants/permissions.ts:
//   '/dashboard/orders/returns-receiving': PERMISSION_PRESETS.MANAGER_AND_ABOVE,
'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { ReturnsReceivingContent } from './components/ReturnsReceivingContent';

function ReturnsReceivingLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل الصفحة..." />
    </div>
  );
}

export default function ReturnsReceivingPage() {
  return (
    <Suspense fallback={<ReturnsReceivingLoading />}>
      <ReturnsReceivingContent />
    </Suspense>
  );
}
