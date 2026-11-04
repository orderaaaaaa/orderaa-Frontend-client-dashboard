'use client';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { LiaExclamationTriangleSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { useHasPermission } from '@/hooks/usePermissions';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { PERMISSION_CODES } from '@/lib/permissions';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import { useRepairOrderStockMutation } from '@/services/orderStockSync';
import {
  getApiErrorMessage,
  getOutOfStockBlock,
  outOfStockBlockText,
} from '@/utils/apiError';

interface OrderStockReturnRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  message: string;
}

const REPAIR_EXPLANATION =
  'هذا الطلب يحجز مخزوناً خارج موضع الإنشاء. اضغط «مزامنة المخزون» لإرجاعه، ثم أعد التعديل.';
const REPAIR_PERMISSION_NOTICE = 'تحتاج صلاحية مزامنة المخزون';

export default function OrderStockReturnRequiredModal({
  isOpen,
  onClose,
  orderId,
  message,
}: OrderStockReturnRequiredModalProps) {
  const canRepair = useHasPermission(PERMISSION_CODES.STOCK_MOVEMENTS_REPAIR_ORDER);
  const queryClient = useQueryClient();
  const repair = useRepairOrderStockMutation();

  const handleSync = async () => {
    try {
      await repair.mutateAsync(orderId);
    } catch (err: unknown) {
      const block = getOutOfStockBlock(err);
      if (block) {
        toast.error(outOfStockBlockText(block));
        return;
      }
      toast.error(getApiErrorMessage(err, 'تعذرت مزامنة مخزون الطلب'));
      return;
    }
    await invalidateAndWait(queryClient, [
      [QUERY_KEYS.ORDER_DETAILS],
      [QUERY_KEYS.ORDER_STOCK_AVAILABILITY],
    ]);
    toast.success('تمت مزامنة المخزون، أعد التعديل');
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="التعديل يتطلب مزامنة المخزون"
      onConfirm={canRepair ? handleSync : undefined}
      confirmText="مزامنة المخزون"
      cancelText="إغلاق"
      isLoading={repair.isPending}
      maxWidth="md:max-w-[480px]"
    >
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <LiaExclamationTriangleSolid className="w-8 h-8 text-amber-600" />
        </div>

        <p className="text-lg font-bold text-foreground">{message}</p>

        <p className="text-base text-foreground">
          {canRepair ? REPAIR_EXPLANATION : REPAIR_PERMISSION_NOTICE}
        </p>
      </div>
    </BaseModal>
  );
}
