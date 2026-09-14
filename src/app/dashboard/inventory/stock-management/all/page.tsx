'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { StockManagementContent } from '../components';
import { STOCK_SCOPE_KINDS } from '../constants';

const ALL_SCOPE = { kind: STOCK_SCOPE_KINDS.ALL };

export default function AllWarehousesStockPage() {
  return (
    <Suspense
      fallback={<PageLoading message="جاري تحميل بيانات المخزن..." />}
    >
      <StockManagementContent scope={ALL_SCOPE} />
    </Suspense>
  );
}
