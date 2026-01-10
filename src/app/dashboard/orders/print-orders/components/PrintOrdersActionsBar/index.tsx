'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  LiaCheckCircleSolid,
  LiaBoxSolid,
  LiaPhoneVolumeSolid,
  LiaExchangeAltSolid,
} from 'react-icons/lia';
import type { Order } from '@/types/orders';

interface PrintOrdersActionsBarProps {
  selectedOrders?: Order[];
  onPrepared?: () => void;
  onAwaitingPackaging?: () => void;
  onCallAgain?: () => void;
  onChangeProduct?: () => void;
  position?: 'fixed' | 'sticky' | 'absolute' | 'static';
  className?: string;
  isAllSelected?: boolean;
  totalStoreOrders?: number;
  isLoading?: boolean;
  forceShow?: boolean;
  disableActions?: boolean;
}

const PrintOrdersActionsBar: React.FC<PrintOrdersActionsBarProps> = ({
  selectedOrders = [],
  onPrepared,
  onAwaitingPackaging,
  onCallAgain,
  onChangeProduct,
  position = 'fixed',
  className = '',
  isAllSelected = false,
  isLoading = false,
  forceShow = false,
  disableActions = false,
}) => {
  if (!forceShow && selectedOrders.length === 0 && !isAllSelected) {
    return null;
  }

  const isDisabled = isLoading || disableActions;

  const positionClasses = {
    fixed: 'fixed bottom-0 left-0 right-0 z-50',
    sticky: 'sticky bottom-0 z-10',
    absolute: 'absolute bottom-0 left-0 right-0 z-10',
    static: '',
  }[position];

  return (
    <div
      className={`${positionClasses} bg-white border-t border-gray-200 shadow-lg py-4 px-6 ${className}`}
    >
      <div className="mx-auto overflow-x-auto scrollbar-hide">
        <div className="pb-2 flex flex-row gap-2 items-center justify-center max-w-7xl w-max mx-auto">
          <Button
            variant="outline"
            className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onPrepared}
            disabled={isDisabled}
          >
            <LiaCheckCircleSolid className="size-5" />
            <span>تم التحضير</span>
          </Button>

          <Button
            variant="outline"
            className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onAwaitingPackaging}
            disabled={isDisabled}
          >
            <LiaBoxSolid className="size-5" />
            <span>فى انتظار التغليف</span>
          </Button>

          <Button
            variant="outline"
            className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onCallAgain}
            disabled={isDisabled}
          >
            <LiaPhoneVolumeSolid className="size-5" />
            <span>اعادة اتصال</span>
          </Button>

          <Button
            variant="outline"
            className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onChangeProduct}
            disabled={isDisabled}
          >
            <LiaExchangeAltSolid className="size-5" />
            <span>تغيير المنتج</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrintOrdersActionsBar;
