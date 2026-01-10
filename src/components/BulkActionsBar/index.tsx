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
} from 'react-icons/lia';
import type { Order } from '@/types/orders';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { OrderStatusItem } from '@/types/orders';

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
}) => {
  if (selectedOrders.length === 0 && !isAllSelected) {
    return null;
  }

  const positionClasses = {
    fixed: 'fixed bottom-0 left-0 right-0 z-50',
    sticky: 'sticky bottom-0 z-10',
    absolute: 'absolute bottom-0 left-0 right-0 z-10',
  }[position];

  const handleStatusSelect = (statusKey: string) => {
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
    >
      <div className="mx-auto overflow-x-auto scrollbar-hide">
        <div className="pb-2 flex flex-row gap-2 items-center justify-center max-w-7xl w-max mx-auto">
          {/* Status Dropdown using Select */}
          {/* <Select onValueChange={handleStatusSelect}>
            <SelectTrigger className="group flex items-center gap-2 px-4 py-2 rounded-3xl !bg-white border border-primary !text-primary hover:!bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap w-auto h-auto focus:ring-0 focus:ring-offset-0 ring-offset-0">
              <Edit className="h-4 w-4 group-hover:text-white" />
              <span className="group-hover:text-white">
                تعديل الحالة ({selectedCount})
              </span>
            </SelectTrigger>
            <SelectContent align="end" className="max-h-[300px]">
              {statusOptions.length > 0 ? (
                statusOptions.map((status) => (
                  <SelectItem
                    key={status.key}
                    value={status.key}
                    className="cursor-pointer justify-end  hover:!text-white hover:!bg-primary "
                  >
                    {status.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-gray-500">
                  لا توجد حالات متاحة
                </div>
              )}
            </SelectContent>
          </Select> */}


          <Button
            variant="outline"
            className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
            onClick={onExportExcel}
          >
            <LiaFileExcelSolid className="size-5" />
            <span>مشاركة شيت اكسيل</span>
          </Button>

          <Button
            variant="outline"
            className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
            onClick={onShareWhatsApp}
          >
            <LiaWhatsapp className="size-5" />
            <span>مشاركة واتساب</span>
          </Button>

          <Button
            variant="outline"
            className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
            onClick={onShipping}
          >
            <LiaTruckSolid className="size-5" />
            <span>شحن</span>
          </Button>

          <Button
            variant="outline"
            className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
            onClick={onOther}
          >
            <LiaEllipsisHSolid className="size-5" />
            <span>اخرى</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;
