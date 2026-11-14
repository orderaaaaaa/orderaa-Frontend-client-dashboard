'use client';

import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { Button } from '@/components/ui/button';
import { stocktakeTargetLabel } from '../../utils/stocktakeTypes';
import type { StocktakeSummaryDto } from '../../types/stocktake';
import { stocktakeSessionBreadcrumbs } from './stocktakeRoutes';

interface StocktakeItemsStepProps {
  stocktakeId: number;
  summary: StocktakeSummaryDto;
  onNext: () => void;
}

export function StocktakeItemsStep({ stocktakeId, summary, onNext }: StocktakeItemsStepProps) {
  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden pb-4">
      <StockPageHeader
        title={`جلسة جرد #${stocktakeId}`}
        subtitle={stocktakeTargetLabel(summary)}
        breadcrumbs={stocktakeSessionBreadcrumbs(stocktakeId)}
        actions={<Button onClick={onNext}>التالي</Button>}
      />
    </div>
  );
}
