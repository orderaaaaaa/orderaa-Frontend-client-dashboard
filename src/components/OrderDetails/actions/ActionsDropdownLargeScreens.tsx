import React from 'react';
import {
  LiaCheckCircle,
  LiaCommentDotsSolid,
  LiaAngleDownSolid,
  LiaAngleLeftSolid,
  LiaAngleRightSolid,
  LiaStopCircleSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { useDropdownState } from '@/hooks/OrderDetails/useDropdownState';
import { FollowUpDropdown } from './FollowUpDropdown';
import { ActionsDropdown, type PartialDeliveryMenuAction } from './ActionsDropdown';
import type { OrderActionAvailability } from './orderActionAvailability';
import type { OrderMenuAction } from './orderMenuItems';
import { FIXED_BOTTOM_BAR_CLASS } from '@/constants/dashboard-layout';
import { useI18n } from '@/i18n/I18nProvider';

export interface OrderActionsFooterProps {
  availability: OrderActionAvailability;
  menuItems: OrderMenuAction[];
  onConfirm: () => void;
  onFollowUpClick: (label: string, action: string) => void;
  onActionClick: (label: string, action: string) => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  isNavigatingNext?: boolean;
  isNavigatingPrevious?: boolean;
  isBusy?: boolean;
  partialAction: PartialDeliveryMenuAction;
  undoAction: PartialDeliveryMenuAction;
}

export function OrderActionsFooterLargeScreens({
  availability,
  menuItems,
  onConfirm,
  onFollowUpClick,
  onActionClick,
  onNavigateNext,
  onNavigatePrevious,
  isNavigatingNext = false,
  isNavigatingPrevious = false,
  isBusy = false,
  partialAction,
  undoAction,
}: OrderActionsFooterProps) {
  const { dir } = useI18n();
  const showActionsMenu = menuItems.length > 0;
  const showActionGroup = availability.confirm || availability.followUp || showActionsMenu;

  const followUpDropdown = useDropdownState();
  const actionsDropdown = useDropdownState();

  const handleFollowUpToggle = () => {
    followUpDropdown.toggle();
    if (actionsDropdown.isOpen) {
      actionsDropdown.close();
    }
  };

  const handleActionsToggle = () => {
    actionsDropdown.toggle();
    if (followUpDropdown.isOpen) {
      followUpDropdown.close();
    }
  };

  const handleFollowUpClick = (label: string, action: string) => {
    followUpDropdown.close();
    onFollowUpClick(label, action);
  };

  const handleActionClick = (label: string, action: string) => {
    actionsDropdown.close();
    onActionClick(label, action);
  };

  return (
    <div
      className={`${FIXED_BOTTOM_BAR_CLASS} bg-card border-t border-gray-200 shadow-lg py-4 px-6`}
    >
      <div className="flex gap-2 justify-between items-center">
        <div className="flex gap-2 items-center sm:rtl:ms-14 sm:ltr:me-14">
          <Button
            variant="outline"
            onClick={onNavigatePrevious}
            disabled={isBusy || isNavigatingPrevious || !onNavigatePrevious}
            className="w-10 h-10 p-0 rounded-full border-2 border-gray-300 hover:border-primary hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="الطلب السابق"
          >
            {isNavigatingPrevious ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <LiaAngleRightSolid className="w-5 h-5 text-gray-600" />
            )}
          </Button>

          <Button
            variant="outline"
            onClick={onNavigateNext}
            disabled={isBusy || isNavigatingNext || !onNavigateNext}
            className="w-10 h-10 p-0 rounded-full border-2 border-gray-300 hover:border-primary hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="الطلب التالي"
          >
            {isNavigatingNext ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <LiaAngleLeftSolid className="w-5 h-5 text-gray-600" />
            )}
          </Button>
        </div>

        {availability.stopBar ? (
          <Button
            variant="default"
            onClick={() => onActionClick('وقف التشغيل', 'stop_operation')}
            loading={isBusy}
            className="py-2 px-10 rounded-2xl bg-red-600 text-white text-sm font-bold hover:brightness-90 transition-all duration-700 hover:scale-105 flex items-center gap-2"
          >
            <LiaStopCircleSolid className="w-5 h-5" />
            وقف التشغيل
          </Button>
        ) : showActionGroup ? (
          <div className="relative" ref={actionsDropdown.ref}>
            <div className="flex flex-row gap-2">
              {availability.confirm && (
                <Button
                  variant="default"
                  onClick={onConfirm}
                  loading={isBusy}
                  disabled={isBusy}
                  className="py-2 px-10 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-brand-hover transition-all duration-700 hover:scale-105 flex items-center gap-2 disabled:opacity-40 disabled:hover:scale-100"
                >
                  <LiaCheckCircle className="w-5 h-5" />
                  تأكيد
                </Button>
              )}

              {availability.followUp && (
                <div className="relative" ref={followUpDropdown.ref}>
                  <Button
                    variant="outline"
                    onClick={handleFollowUpToggle}
                    disabled={isBusy}
                    className="py-2 px-10 border-2 rounded-2xl border-primary text-primary-text text-sm font-bold hover:bg-purple-50 transition-colors flex items-center gap-2"
                  >
                    <LiaCommentDotsSolid className="w-5 h-5" />
                    متابعة
                  </Button>

                  <FollowUpDropdown
                    isOpen={followUpDropdown.isOpen}
                    onClick={handleFollowUpClick}
                  />
                </div>
              )}

              {showActionsMenu && (
                <Button
                  variant="ghost"
                  onClick={handleActionsToggle}
                  disabled={isBusy}
                  className="w-9 h-9 p-0 rounded-full border-2 border-primary hover:bg-purple-50 transition-colors"
                >
                  <LiaAngleDownSolid
                    className={`w-5 h-5 text-primary-text transition-all ${
                      actionsDropdown.isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              )}
            </div>

            <ActionsDropdown
              isOpen={actionsDropdown.isOpen}
              menuItems={menuItems}
              partialAction={partialAction}
              undoAction={undoAction}
              className={dir === 'rtl' ? 'right-auto left-0 min-w-[260px] max-w-[320px]' : 'min-w-[260px] max-w-[320px]'}
              onActionClick={handleActionClick}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
