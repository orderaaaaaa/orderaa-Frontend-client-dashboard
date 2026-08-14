'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { LiaTruckSolid } from 'react-icons/lia';
import { useHasPermission } from '@/hooks/usePermissions';

function Spinner() {
  return (
    <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
}

type PositionType = 'fixed' | 'sticky' | 'absolute' | 'static';

interface ShippingActionsBarProps {
  onShip: () => void;
  position?: PositionType;
  className?: string;
  isLoading?: boolean;
  forceShow?: boolean;
  disableActions?: boolean;
  selectedCount?: number;
}

export function ShippingActionsBar({
  onShip,
  position = 'fixed',
  className = '',
  isLoading = false,
  forceShow = false,
  disableActions = false,
  selectedCount = 0,
}: ShippingActionsBarProps) {
  // "شحن" posts to /orders/submit-for-approval.
  const canSubmitForApproval = useHasPermission('orders:submit-for-approval');

  if (!canSubmitForApproval) {
    return null;
  }

  if (!forceShow && selectedCount === 0) {
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
            className="grid grid-cols-[auto_1fr] items-center gap-2 px-6 py-2 rounded-3xl bg-primary border-primary text-white hover:bg-[#4B1BC4] transition-colors cursor-pointer whitespace-nowrap h-10 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white"
            onClick={onShip}
            disabled={isDisabled}
          >
            {isLoading ? <Spinner /> : <LiaTruckSolid className="size-5" />}
            <span>شحن</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ShippingActionsBar;
