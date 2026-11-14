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
  LiaTruckSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';
import type { OrderMenuAction } from './orderMenuItems';

interface ActionOption {
  label: string;
  action: string;
  icon: React.ReactNode;
}

const arrowOptions: ActionOption[] = [
  { label: 'مستعجل', action: 'urgent', icon: <LiaBoltSolid className="w-5 h-5" /> },
  { label: 'إلغاء', action: 'cancel', icon: <LiaBanSolid className="w-5 h-5" /> },
  { label: 'رفض التعديل', action: 'reject_modification', icon: <LiaTimesCircleSolid className="w-5 h-5" /> },
  { label: 'تأجيل ساعات', action: 'postpone_hours', icon: <LiaHourglassSolid className="w-5 h-5" /> },
  { label: 'تأجيل أيام', action: 'postpone_days', icon: <LiaCalendarAltSolid className="w-5 h-5" /> },
  { label: 'متابعة واتساب', action: 'whatsapp', icon: <LiaWhatsapp className="w-5 h-5" /> },
  { label: 'تسليم جزئي', action: 'partial_delivery', icon: <LiaBoxOpenSolid className="w-5 h-5" /> },
  { label: 'وقف التشغيل', action: 'stop_operation', icon: <LiaStopCircleSolid className="w-5 h-5" /> },
  { label: 'في انتظار الدفع', action: 'waiting_payment', icon: <LiaLockSolid className="w-5 h-5" /> },
  { label: 'تحديث حالة الشحن', action: 'shipping_move', icon: <LiaTruckSolid className="w-5 h-5" /> },
];

const postShippingOptions: ActionOption[] = [
  { label: 'استبدال', action: 'exchange', icon: <LiaExchangeAltSolid className="w-5 h-5" /> },
  { label: 'مرتجع', action: 'return_refund', icon: <LiaUndoAltSolid className="w-5 h-5" /> },
  { label: 'إعادة إرسال', action: 'resend', icon: <LiaRedoAltSolid className="w-5 h-5" /> },
  { label: 'متأخر', action: 'late', icon: <LiaClockSolid className="w-5 h-5" /> },
];

export type PartialDeliveryMenuAction = { visible: boolean; blockedReason: string | null };

export interface ActionsDropdownProps {
  isOpen: boolean;
  menuItems: OrderMenuAction[];
  partialAction: PartialDeliveryMenuAction;
  undoAction: PartialDeliveryMenuAction;
  className?: string;
  onActionClick: (label: string, action: string) => void;
}

export function ActionsDropdown({
  isOpen,
  menuItems,
  partialAction,
  undoAction,
  className,
  onActionClick,
}: ActionsDropdownProps) {
  const { blockedReason: partialBlockedReason } = partialAction;
  const { blockedReason: undoBlockedReason } = undoAction;
  const { t } = useI18n();

  const optionByAction = useMemo(() => {
    const undoOption: ActionOption = {
      label: t('partialDelivery.undo.title'),
      action: 'undo_partial_delivery',
      icon: <LiaUndoAltSolid className="w-5 h-5" />,
    };
    const options = [...arrowOptions, ...postShippingOptions, undoOption];
    return new Map<string, ActionOption>(
      options.map((option): [string, ActionOption] => [option.action, option])
    );
  }, [t]);

  const filteredOptions = menuItems.flatMap((action) => {
    const option = optionByAction.get(action);
    return option ? [option] : [];
  });

  if (!isOpen || filteredOptions.length === 0) return null;

  return (
    <div
      className={cn(
        'absolute bottom-full mb-2 right-0 min-w-[200px] bg-card border border-gray-200 rounded-lg shadow-lg overflow-y-auto z-(--z-inpage-popup)',
        className,
      )}
      dir="rtl"
    >
      {filteredOptions.map((option) => {
        const blockedReason =
          option.action === 'partial_delivery'
            ? partialBlockedReason
            : option.action === 'undo_partial_delivery'
              ? undoBlockedReason
              : null;
        return (
          <Button
            key={option.action}
            variant="ghost"
            disabled={blockedReason !== null}
            onClick={() => onActionClick(option.label, option.action)}
            className="h-auto min-h-11 w-full px-4 py-2.5 sm:h-auto sm:py-2.5 items-start whitespace-normal text-start text-sm font-bold text-foreground hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 flex gap-3 justify-start"
          >
            <span className="flex shrink-0 mt-0.5">{option.icon}</span>
            <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <span>{option.label}</span>
              {blockedReason !== null && (
                <span className="text-xs leading-5 font-normal whitespace-normal break-words text-gray-500">{blockedReason}</span>
              )}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
