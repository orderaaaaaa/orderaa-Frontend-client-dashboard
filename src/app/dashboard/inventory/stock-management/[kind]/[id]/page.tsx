'use client';

import { Suspense, useMemo } from 'react';
import PageLoading from '@/components/ui/page-loading';
import {
  StockManagementContent,
  StockScopeNotFound,
} from '../../components';
import { STOCK_SCOPE_KINDS } from '../../constants';
import type { StockScope } from '../../types';

interface ScopedStockPageProps {
  params: { kind: string; id: string };
}

function parseScope(kind: string, id: string): StockScope | null {
  if (!/^\d+$/.test(id)) return null;
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) return null;
  if (kind === STOCK_SCOPE_KINDS.PHYSICAL) {
    return { kind: STOCK_SCOPE_KINDS.PHYSICAL, id: numericId };
  }
  if (kind === STOCK_SCOPE_KINDS.VIRTUAL) {
    return { kind: STOCK_SCOPE_KINDS.VIRTUAL, id: numericId };
  }
  return null;
}

export default function ScopedStockPage({ params }: ScopedStockPageProps) {
  const scope = useMemo(
    () => parseScope(params.kind, params.id),
    [params.kind, params.id]
  );

  if (!scope) {
    return <StockScopeNotFound />;
  }

  return (
    <Suspense
      fallback={<PageLoading message="جاري تحميل بيانات المخزن..." />}
    >
      <StockManagementContent scope={scope} />
    </Suspense>
  );
}
