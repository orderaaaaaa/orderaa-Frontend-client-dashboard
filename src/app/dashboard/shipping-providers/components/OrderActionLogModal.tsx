'use client';

import BaseModal from '@/components/ui/base-modal';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';
import { ACTION_LOG_TITLE } from './followupNotesConstants';
import { OrderActionLogPanel } from './OrderActionLogPanel';

interface OrderActionLogModalProps {
  orderId: number;
  orderCode?: string;
  onClose: () => void;
}

export function OrderActionLogModal({ orderId, orderCode, onClose }: OrderActionLogModalProps) {
  const { hasPermission } = usePermissionCheck();
  const canReadHistory = hasPermission(PERMISSIONS.ORDERS_HISTORY_READ);

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title={ACTION_LOG_TITLE}
      showFooter={false}
      maxWidth="md:max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        {orderCode && (
          <p dir="ltr" className="font-mono text-sm font-semibold text-muted-foreground">
            {orderCode}
          </p>
        )}
        <OrderActionLogPanel orderId={orderId} canReadHistory={canReadHistory} />
      </div>
    </BaseModal>
  );
}
