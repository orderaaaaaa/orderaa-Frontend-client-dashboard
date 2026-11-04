import React, { useMemo } from 'react';
import {
  LiaBoltSolid,
  LiaBanSolid,
  LiaTimesCircleSolid,
  LiaHourglassSolid,
  LiaCalendarAltSolid,
  LiaWhatsapp,
  LiaStopCircleSolid,
  LiaLockSolid,
  LiaExchangeAltSolid,
  LiaUndoAltSolid,
  LiaRedoAltSolid,
  LiaClockSolid,
  LiaBoxOpenSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { POST_SHIPPING_STATUSES } from '@/types/logistics';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { PARTIAL_DELIVERY_CODES, partialDeliveryBlockReasonOf } from '@/utils/partialDelivery/partialDeliveryGate';
import { cn } from '@/lib/utils';

interface ActionOption {
  label: string;
  action: string;
  icon: React.ReactNode;
}

const arrowOptions: ActionOption[] = [
  { label: 'مستعجل', action: 'urgent', icon: <LiaBoltSolid className="w-5 h-5" /> },
  { label: 'الغاء', action: 'cancel', icon: <LiaBanSolid className="w-5 h-5" /> },
  { label: 'رفض التعديل', action: 'reject_modification', icon: <LiaTimesCircleSolid className="w-5 h-5" /> },
  { label: 'تأجيل ساعات', action: 'postpone_hours', icon: <LiaHourglassSolid className="w-5 h-5" /> },
  { label: 'تأجيل أيام', action: 'postpone_days', icon: <LiaCalendarAltSolid className="w-5 h-5" /> },
  { label: 'متابعة واتساب', action: 'whatsapp', icon: <LiaWhatsapp className="w-5 h-5" /> },
  { label: 'تسليم جزئي', action: 'partial_delivery', icon: <LiaBoxOpenSolid className="w-5 h-5" /> },
  { label: 'وقف التشغيل', action: 'stop_operation', icon: <LiaStopCircleSolid className="w-5 h-5" /> },
  { label: 'في انتظار الدفع', action: 'waiting_payment', icon: <LiaLockSolid className="w-5 h-5" /> },
];

const postShippingOptions: ActionOption[] = [
  { label: 'استبدال', action: 'exchange', icon: <LiaExchangeAltSolid className="w-5 h-5" /> },
  { label: 'مرتجع', action: 'return_refund', icon: <LiaUndoAltSolid className="w-5 h-5" /> },
  { label: 'إعادة إرسال', action: 'resend', icon: <LiaRedoAltSolid className="w-5 h-5" /> },
  { label: 'متأخر', action: 'late', icon: <LiaClockSolid className="w-5 h-5" /> },
];

export interface ActionsDropdownProps {
  isOpen: boolean;
  orderStatus: string;
  lastEventStatus?: string;
  className?: string;
  onActionClick: (label: string, action: string) => void;
}

export function ActionsDropdown({ isOpen, orderStatus, lastEventStatus, className, onActionClick }: ActionsDropdownProps) {
  const isPostShipping = POST_SHIPPING_STATUSES.has(orderStatus);
  // `cancel` posts to /orders/:id/cancel, every other action patches the order.
  const { hasPermission, hasAllPermissions } = usePermissionCheck();
  const canCancel = hasPermission(PERMISSION_CODES.ORDERS_CANCEL);
  const canUpdate = hasPermission(PERMISSION_CODES.ORDERS_UPDATE);

  const filteredOptions = useMemo(() => {
    const base = arrowOptions.filter((option) => {
      if (option.action === 'cancel') {
        return canCancel;
      }
      if (!canUpdate) {
        return false;
      }
      if (option.action === 'partial_delivery') {
        return (
          hasAllPermissions(PARTIAL_DELIVERY_CODES) &&
          partialDeliveryBlockReasonOf({ locked: false, status: orderStatus }) === null
        );
      }
      if (option.action === 'stop_operation') {
        return orderStatus === 'CONFIRMED';
      }
      if (option.action === 'urgent') {
        return orderStatus !== 'CONFIRMED';
      }
      if (option.action === 'waiting_payment') {
        return lastEventStatus !== 'WAITING_FOR_PAYMENT';
      }
      return true;
    });

    if (isPostShipping && canUpdate) {
      return [...base, ...postShippingOptions];
    }

    return base;
  }, [orderStatus, lastEventStatus, isPostShipping, canCancel, canUpdate, hasAllPermissions]);

  if (!isOpen || filteredOptions.length === 0) return null;

  return (
    <div
      className={cn(
        'absolute bottom-full mb-2 right-0 min-w-[200px] bg-card border border-gray-200 rounded-lg shadow-lg overflow-y-auto z-(--z-inpage-popup)',
        className,
      )}
      dir="rtl"
    >
      {filteredOptions.map((option) => (
        <Button
          key={option.action}
          variant="ghost"
          onClick={() => onActionClick(option.label, option.action)}
          className="w-full px-4 py-3 text-sm font-bold text-foreground hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 justify-start"
        >
          <div className="flex flex-row items-center gap-2">
            {option.icon}
            {option.label}
          </div>
        </Button>
      ))}
    </div>
  );
}
