'use client';

import { toast } from 'react-toastify';
import type { SettlementBatchOrder } from '@/lib/api/settlement';
import { useSettlementSync } from '@/app/dashboard/orders/settlement/hooks/useSettlementQueries';
import AddSettlementOrdersDialog from './AddSettlementOrdersDialog';
import EditSettlementAmountDialog from './EditSettlementAmountDialog';
import RemoveSettlementOrderDialog from './RemoveSettlementOrderDialog';

interface SettlementBatchOrderDialogsProps {
  batchId: string;
  editTarget: SettlementBatchOrder | null;
  onEditClose: () => void;
  removeTarget: SettlementBatchOrder | null;
  onRemoveClose: () => void;
  isAddOpen: boolean;
  onAddClose: () => void;
}

export default function SettlementBatchOrderDialogs({
  batchId,
  editTarget,
  onEditClose,
  removeTarget,
  onRemoveClose,
  isAddOpen,
  onAddClose,
}: SettlementBatchOrderDialogsProps) {
  const syncSettlement = useSettlementSync();

  const handleEdited = async () => {
    await syncSettlement();
    toast.success('تم تحديث التحصيل');
  };

  return (
    <>
      <RemoveSettlementOrderDialog
        isOpen={removeTarget !== null}
        onClose={onRemoveClose}
        batchId={batchId}
        orderId={removeTarget?.orderId ?? 0}
        orderStatus={removeTarget?.currentStatus ?? ''}
        onSuccess={async () => {
          await handleEdited();
          onRemoveClose();
        }}
      />

      <EditSettlementAmountDialog
        isOpen={editTarget !== null}
        onClose={onEditClose}
        batchId={batchId}
        orderId={editTarget?.orderId ?? 0}
        currentAmount={editTarget?.amount ?? '0.00'}
        onSuccess={async () => {
          await handleEdited();
          onEditClose();
        }}
      />

      <AddSettlementOrdersDialog
        isOpen={isAddOpen}
        onClose={onAddClose}
        batchId={batchId}
        onSuccess={handleEdited}
      />
    </>
  );
}
