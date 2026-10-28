'use client';

import { useMemo } from 'react';
import { ErrorState } from '@/components/ui/state-panels';
import { StocktakeSheetContent } from '../../components/stocktake/StocktakeSheetContent';

interface StocktakeSheetPageProps {
  params: { stocktakeId: string };
}

function parseStocktakeId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export default function StocktakeSheetPage({ params }: StocktakeSheetPageProps) {
  const stocktakeId = useMemo(() => parseStocktakeId(params.stocktakeId), [params.stocktakeId]);

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4">
      {stocktakeId === null ? (
        <ErrorState error={null} fallback="رقم جلسة الجرد غير صحيح" />
      ) : (
        <StocktakeSheetContent key={stocktakeId} stocktakeId={stocktakeId} />
      )}
    </div>
  );
}
