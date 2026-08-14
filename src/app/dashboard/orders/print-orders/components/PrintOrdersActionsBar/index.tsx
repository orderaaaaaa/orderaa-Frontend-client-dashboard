'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  LiaCheckCircleSolid,
  LiaBoxSolid,
  LiaPhoneVolumeSolid,
  LiaExchangeAltSolid,
} from 'react-icons/lia';
import { PrintOrdersActionsBarProps } from '../../types';
import { usePermissionCheck } from '@/hooks/usePermissions';

function Spinner() {
  return (
    <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
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
  isChangeProductMode = false,
  hideAwaitingPackaging = false,
}) => {
  // Each button maps to the endpoint that backs it:
  // تم التحضير → POST /orders/prepare, فى انتظار التغليف → POST /orders/waiting-for-packaging,
  // اعادة اتصال / تغيير المنتج → POST /orders/call-again.
  const { hasPermission } = usePermissionCheck();
  const canPrepare = hasPermission('orders:prepare');
  const canAwaitPackaging =
    !hideAwaitingPackaging && hasPermission('orders:waiting-for-packaging');
  const canCallAgain = hasPermission('orders:call-again');
  const hasAnyAction = canPrepare || canAwaitPackaging || canCallAgain;

  if (!forceShow && selectedOrders.length === 0 && !isAllSelected) {
    return null;
  }

  if (isChangeProductMode ? !canCallAgain : !hasAnyAction) {
    return null;
  }

  const isDisabled = isLoading || disableActions;

  const positionClasses = {
    fixed: 'fixed bottom-0 left-0 right-0 z-50',
    sticky: 'sticky bottom-0 z-10',
    absolute: 'absolute bottom-0 left-0 right-0 z-10',
    static: '',
  }[position];

  if (isChangeProductMode) {
    return (
      <div
        className={`${positionClasses} bg-white border-t border-gray-200 shadow-lg py-4 px-6 ${className}`}
      >
        <div className="mx-auto overflow-x-auto scrollbar-hide">
          <div className="pb-2 flex flex-row gap-2 items-center justify-center max-w-7xl w-max mx-auto">
            <Button
              variant="outline"
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-primary border-primary text-white hover:bg-[#4B1BC4] transition-colors cursor-pointer whitespace-nowrap h-10 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onChangeProduct}
              disabled={isDisabled}
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <LiaExchangeAltSolid className="size-5" />
              )}
              <span>تغيير المنتج</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${positionClasses} bg-white border-t border-gray-200 shadow-lg py-4 px-6 ${className}`}
    >
      <div className="mx-auto overflow-x-auto scrollbar-hide">
        <div className="pb-2 flex flex-row gap-2 items-center justify-center max-w-7xl w-max mx-auto">
          {canPrepare && (
            <Button
              variant="outline"
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onPrepared}
              disabled={isDisabled}
            >
              {isLoading ? <Spinner /> : <LiaCheckCircleSolid className="size-5" />}
              <span>تم التحضير</span>
            </Button>
          )}

          {canAwaitPackaging && (
            <Button
              variant="outline"
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onAwaitingPackaging}
              disabled={isDisabled}
            >
              {isLoading ? <Spinner /> : <LiaBoxSolid className="size-5" />}
              <span>فى انتظار التغليف</span>
            </Button>
          )}

          {canCallAgain && (
            <Button
              variant="outline"
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onCallAgain}
              disabled={isDisabled}
            >
              {isLoading ? <Spinner /> : <LiaPhoneVolumeSolid className="size-5" />}
              <span>اعادة اتصال</span>
            </Button>
          )}

          {canCallAgain && (
            <Button
              variant="outline"
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onChangeProduct}
              disabled={isDisabled}
            >
              {isLoading ? <Spinner /> : <LiaExchangeAltSolid className="size-5" />}
              <span>تغيير المنتج</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintOrdersActionsBar;
