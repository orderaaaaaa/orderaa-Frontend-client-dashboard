import React from 'react';
import { Button } from '@/components/ui/button';
import {
  LiaFileExcelSolid,
  LiaWhatsapp,
  LiaTruckSolid,
  LiaEllipsisHSolid,
  LiaCheckCircleSolid,
  LiaBoxSolid,
  LiaPhoneVolumeSolid,
  LiaExchangeAltSolid,
  LiaEditSolid,
} from 'react-icons/lia';
import type { Order } from '@/types/orders';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { OrderStatusItem } from '@/types/orders';
import { Can } from '@/components/Can';
import { PERMISSION_CODES } from '@/lib/permissions';
import { FIXED_BOTTOM_BAR_CLASS } from '@/constants/dashboard-layout';
import { ScrollEndFade } from '@/components/ui/scroll-end-fade';
import { useScrollEndFade } from '@/hooks/useScrollEndFade';

interface BulkActionsBarProps {
  selectedOrders: Order[];
  onEditStatus?: (statusKey: string) => void;
  statusOptions?: OrderStatusItem[];
  onExportExcel?: () => void;
  onShareWhatsApp?: () => void;
  onShipping?: () => void;
  onOther?: () => void;
  onPrepared?: () => void;
  onAwaitingPackaging?: () => void;
  onCallAgain?: () => void;
  onChangeProduct?: () => void;
  position?: 'fixed' | 'sticky' | 'absolute';
  className?: string;
  isAllSelected?: boolean;
  totalStoreOrders?: number;
  isLoading?: boolean;
  disabled?: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedOrders,
  onEditStatus,
  statusOptions = [],
  onExportExcel,
  onShareWhatsApp,
  onShipping,
  onOther,
  onPrepared,
  onAwaitingPackaging,
  onCallAgain,
  onChangeProduct,
  position = 'fixed',
  className = '',
  isAllSelected = false,
  totalStoreOrders = 0,
  isLoading = false,
  disabled = false,
}) => {
  const { ref: scrollRef, hasMoreAtEnd } = useScrollEndFade<HTMLDivElement>();

  if (selectedOrders.length === 0 && !isAllSelected) {
    return null;
  }

  const positionClasses = {
    fixed: FIXED_BOTTOM_BAR_CLASS,
    sticky: 'sticky bottom-0 z-10',
    absolute: 'absolute bottom-0 left-0 right-0 z-10',
  }[position];

  const isDisabled = isLoading || disabled;

  const handleStatusSelect = (statusKey: string) => {
    if (isDisabled) return;
    if (onEditStatus) {
      onEditStatus(statusKey);
    }
  };

  const selectedCount = isAllSelected
    ? totalStoreOrders
    : selectedOrders.length;

  return (
    <div
      className={`${positionClasses} bg-white border-t border-gray-200 shadow-lg py-4 px-6 ${className}`}
      aria-busy={isLoading || undefined}
    >
      <div className="relative">
        <div
          ref={scrollRef}
          className="mx-auto overflow-x-auto [scrollbar-width:thin] sm:[scrollbar-width:none] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 sm:[&::-webkit-scrollbar]:hidden"
        >
          <div className="pb-1 sm:pb-2 flex flex-row gap-2 items-center justify-center max-w-7xl w-max mx-auto">
            <Can code={PERMISSION_CODES.ORDERS_BULK_UPDATE}>
              <Select
                value=""
                onValueChange={handleStatusSelect}
                disabled={isDisabled}
              >
                <SelectTrigger className="group flex items-center gap-2 px-4 pl-10 py-2 rounded-3xl bg-white border-primary !text-primary enabled:hover:bg-primary enabled:hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap w-auto h-10 focus:ring-0 focus:ring-offset-0 ring-offset-0">
                  {isLoading ? (
                    <span
                      aria-hidden
                      className="size-5 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin"
                    />
                  ) : (
                    <LiaEditSolid className="size-5 shrink-0 group-enabled:group-hover:text-white" />
                  )}
                  <span className="group-enabled:group-hover:text-white">
                    {isLoading
                      ? `جاري تعديل الحالة (${selectedCount})`
                      : `تعديل الحالة (${selectedCount})`}
                  </span>
                </SelectTrigger>
                <SelectContent align="end" side="top" className="max-h-[300px] min-w-[180px]">
                  {statusOptions.length > 0 ? (
                    statusOptions.map((status) => (
                      <SelectItem
                        key={status.key}
                        value={status.key}
                        className="cursor-pointer justify-end hover:!text-white hover:!bg-primary"
                      >
                        {status.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm">
                      لا توجد حالات متاحة
                    </div>
                  )}
                </SelectContent>
              </Select>
            </Can>


            <Button
              variant="outline"
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
              onClick={onExportExcel}
              disabled={isDisabled}
            >
              <LiaFileExcelSolid className="size-5" />
              <span>مشاركة شيت اكسيل</span>
            </Button>

            <Button
              variant="outline"
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
              onClick={onShareWhatsApp}
              disabled={isDisabled}
            >
              <LiaWhatsapp className="size-5" />
              <span>مشاركة واتساب</span>
            </Button>

            <Button
              variant="outline"
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
              onClick={onShipping}
              disabled={isDisabled}
            >
              <LiaTruckSolid className="size-5" />
              <span>شحن</span>
            </Button>

            <Button
              variant="outline"
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
              onClick={onOther}
              disabled={isDisabled}
            >
              <LiaEllipsisHSolid className="size-5" />
              <span>اخرى</span>
            </Button>
          </div>
        </div>
        <ScrollEndFade visible={hasMoreAtEnd} />
      </div>
    </div>
  );
};

export default BulkActionsBar;
