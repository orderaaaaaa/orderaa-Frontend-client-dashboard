'use client';

import { StocktakeAccessDenied } from '../components/stocktake/StocktakeAccessDenied';
import { useCanTransferStock } from '../hooks/useCanTransferStock';
import { TransferContent } from './components/TransferContent';

export default function StockTransferPage() {
  const canTransfer = useCanTransferStock();

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden p-4">
      {canTransfer ? (
        <TransferContent />
      ) : (
        <StocktakeAccessDenied title="ليس لديك صلاحية نقل المخزون" />
      )}
    </div>
  );
}
