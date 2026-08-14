import React from 'react';
import {
  LiaCheckSolid,
  LiaComment,
  LiaEllipsisHSolid,
  LiaAngleLeftSolid,
  LiaAngleRightSolid,
  LiaStopCircleSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { useDropdownState } from '@/hooks/OrderDetails/useDropdownState';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { FollowUpDropdown } from './FollowUpDropdown';
import { ActionsDropdown } from './ActionsDropdown';
import { STOP_OPERATION_STATUSES } from './constants';

export interface OrderActionsFooterProps {
  orderStatus: string;
  lastEventStatus?: string;
  onConfirm: () => void;
  onFollowUpClick: (label: string, action: string) => void;
  onActionClick: (label: string, action: string) => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  isNavigatingNext?: boolean;
  isNavigatingPrevious?: boolean;
}

export function OrderActionsFooter({
  orderStatus,
  lastEventStatus,
  onConfirm,
  onFollowUpClick,
  onActionClick,
  onNavigateNext,
  onNavigatePrevious,
  isNavigatingNext = false,
  isNavigatingPrevious = false,
}: OrderActionsFooterProps) {
  // Confirm / follow-up / the actions menu all mutate the order: everything but
  // `cancel` patches it (`orders:update`), cancel posts to /cancel.
  const { hasPermission } = usePermissionCheck();
  const canUpdate = hasPermission('orders:update');
  const canCancel = hasPermission('orders:cancel');
  const showActionsMenu = canUpdate || canCancel;

  const showStopOperation = STOP_OPERATION_STATUSES.has(orderStatus) && canUpdate;
  const followUpDropdown = useDropdownState();
  const actionsDropdown = useDropdownState();

  const handleFollowUpToggle = () => {
    followUpDropdown.toggle();
    if (actionsDropdown.isOpen) actionsDropdown.close();
  };

  const handleActionsToggle = () => {
    actionsDropdown.toggle();
    if (followUpDropdown.isOpen) followUpDropdown.close();
  };

  return (
    <div
      className="fixed bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-4 px-4 font-sans"
    >
      <Button
        variant="ghost"
        onClick={onNavigatePrevious}
        disabled={isNavigatingPrevious || !onNavigatePrevious}
        className="w-9 h-9 rounded-full border border-gray-300 bg-white shadow-sm hover:bg-gray-50 text-purple-700"
      >
        <LiaAngleRightSolid className="w-6 h-6" />
      </Button>

      {showStopOperation ? (
        <Button
          variant="default"
          onClick={() => onActionClick('وقف التشغيل', 'stop_operation')}
          className="bg-red-600 rounded-full px-8 h-13 shadow-2xl text-white text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-3"
        >
          <LiaStopCircleSolid className="w-5 h-5" />
          وقف التشغيل
        </Button>
      ) : showActionsMenu ? (
        <div className="bg-[#6320EE] rounded-full px-8 h-13 flex items-center gap-8 shadow-2xl relative">
          {canUpdate && orderStatus !== 'CONFIRMED' && (
            <Button
              variant="ghost"
              onClick={onConfirm}
              className="relative top-[-6px] flex flex-col items-center gap-[2px] text-white transition-opacity h-auto p-0 hover:bg-transparent"
            >
              <div className="w-8 h-8 rounded-full border-3 bg-primary border-white flex items-center justify-center">
                <LiaCheckSolid className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">تأكيد</span>
            </Button>
          )}

          {canUpdate && (
            <div className="relative top-[-6px]" ref={followUpDropdown.ref}>
              <Button
                variant="ghost"
                onClick={handleFollowUpToggle}
                className="flex flex-col items-center gap-[2px] text-white transition-opacity h-auto p-0 hover:bg-transparent"
              >
                <div className="w-8 h-8 rounded-full border-3 bg-primary border-white flex items-center justify-center">
                  <LiaComment className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">متابعة</span>
              </Button>

              <div className="absolute bottom-full mb-4 right-[-50px]">
                <FollowUpDropdown
                  isOpen={followUpDropdown.isOpen}
                  onClick={(l, a) => {
                    followUpDropdown.close();
                    onFollowUpClick(l, a);
                  }}
                />
              </div>
            </div>
          )}

          <div className="relative top-[-6px]" ref={actionsDropdown.ref}>
            <Button
              variant="ghost"
              onClick={handleActionsToggle}
              className="flex flex-col items-center gap-[2px] text-white transition-opacity h-auto p-0 hover:bg-transparent"
            >
              <div className="w-8 h-8 rounded-full border-3 bg-primary border-white flex items-center justify-center">
                <LiaEllipsisHSolid className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">اخري</span>
            </Button>

            <div className="absolute bottom-full mb-4 left-30">
              <ActionsDropdown
                isOpen={actionsDropdown.isOpen}
                orderStatus={orderStatus}
                lastEventStatus={lastEventStatus}
                onActionClick={(label, action) => {
                  actionsDropdown.close();
                  onActionClick(label, action);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <Button
        variant="ghost"
        onClick={onNavigateNext}
        disabled={isNavigatingNext || !onNavigateNext}
        className="w-9 h-9 rounded-full border border-gray-300 bg-white shadow-sm hover:bg-gray-50 text-purple-700"
      >
        <LiaAngleLeftSolid className="w-6 h-6" />
      </Button>
    </div>
  );
}
