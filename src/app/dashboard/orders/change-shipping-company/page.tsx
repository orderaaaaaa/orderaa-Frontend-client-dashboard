'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import PageLoading from '@/components/ui/page-loading';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { CHANGE_COMPANY_TEXT } from './constants/changeCompany';
import { ChangeCompanyContent } from './components/ChangeCompanyContent';

function ChangeShippingCompanyGate() {
  const canSwitch = useHasPermission(PERMISSION_CODES.ORDERS_BULK_COMPANY_SWITCH);
  if (!canSwitch) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-foreground">{CHANGE_COMPANY_TEXT.noPermission}</p>
        <Link href="/dashboard/orders/print-orders" className="w-fit text-sm text-primary-text hover:underline">
          {CHANGE_COMPANY_TEXT.backToPackaging}
        </Link>
      </div>
    );
  }
  return <ChangeCompanyContent />;
}

export default function ChangeShippingCompanyPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-full overflow-x-hidden">
          <PageLoading message="جاري تحميل الصفحة..." />
        </div>
      }
    >
      <ChangeShippingCompanyGate />
    </Suspense>
  );
}
