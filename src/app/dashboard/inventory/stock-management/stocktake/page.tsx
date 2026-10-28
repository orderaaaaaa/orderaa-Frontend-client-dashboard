'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { StocktakeListContent } from '../components/stocktake/StocktakeListContent';

export default function StocktakeListPage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden p-4">
      <Suspense fallback={<PageLoading message="جاري تحميل جلسات الجرد..." />}>
        <StocktakeListContent />
      </Suspense>
    </div>
  );
}
