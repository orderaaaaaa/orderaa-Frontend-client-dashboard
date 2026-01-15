import React from 'react';
import {
  LiaCheckCircle,
  LiaCommentDotsSolid,
  LiaAngleDownSolid,
  LiaAngleLeftSolid,
  LiaAngleRightSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { useDropdownState } from '@/hooks/OrderDetails/useDropdownState';
import { FollowUpDropdown } from './FollowUpDropdown';
import { ActionsDropdown } from './ActionsDropdown';

export interface OrderActionsFooterProps {
  orderStatus: string;
  lastEventStatus?: string;
  onConfirm: () => void;
  onFollowUpClick: (label: string, action: string) => void;
  onActionClick: (
    label: string,
    action: string,
    hasSubOptions?: boolean
  ) => void;
  onWhatsappSubOptionClick: (action: string, label: string) => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  isNavigatingNext?: boolean;
  isNavigatingPrevious?: boolean;
}

export function OrderActionsFooterLargeScreens({
  orderStatus,
  lastEventStatus,
  onConfirm,
  onFollowUpClick,
  onActionClick,
  onWhatsappSubOptionClick,
  onNavigateNext,
  onNavigatePrevious,
  isNavigatingNext = false,
  isNavigatingPrevious = false,
}: OrderActionsFooterProps) {
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

  const handleActionClick = (
    label: string,
    action: string,
    hasSubOptions?: boolean
  ) => {
    if (!hasSubOptions) {
      actionsDropdown.close();
    }
    onActionClick(label, action, hasSubOptions);
  };

  const handleWhatsappSubOptionClick = (action: string, label: string) => {
    actionsDropdown.close();
    onWhatsappSubOptionClick(action, label);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 py-4 px-6">
      <div className="flex gap-2 justify-between items-center">
        <div className="flex gap-2 items-center sm:rtl:ms-14 sm:ltr:me-14">
          <Button
            variant="outline"
            onClick={onNavigatePrevious}
            disabled={isNavigatingPrevious || !onNavigatePrevious}
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
            disabled={isNavigatingNext || !onNavigateNext}
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

        <div className="relative" ref={actionsDropdown.ref}>
          <div className="flex flex-row gap-2">
            {orderStatus !== 'CONFIRMED' && (
              <Button
                variant="default"
                onClick={onConfirm}
                className="py-2 px-10 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-[#4B1BC4] transition-all duration-700 hover:scale-105 flex items-center gap-2"
              >
                <LiaCheckCircle className="w-5 h-5" />
                تأكيد
              </Button>
            )}

            <div className="relative" ref={followUpDropdown.ref}>
              <Button
                variant="outline"
                onClick={handleFollowUpToggle}
                className="py-2 px-10 border-2 rounded-2xl border-primary text-primary text-sm font-bold hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <LiaCommentDotsSolid className="w-5 h-5" />
                متابعة
              </Button>

              <FollowUpDropdown
                isOpen={followUpDropdown.isOpen}
                onClick={handleFollowUpClick}
              />
            </div>

            <Button
              variant="ghost"
              onClick={handleActionsToggle}
              className="w-9 h-9 p-0 rounded-full border-2 border-primary hover:bg-purple-50 transition-colors"
            >
              <LiaAngleDownSolid
                className={`w-5 h-5 text-primary transition-all ${
                  actionsDropdown.isOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </div>

          <ActionsDropdown
            isOpen={actionsDropdown.isOpen}
            orderStatus={orderStatus}
            lastEventStatus={lastEventStatus}
            onActionClick={handleActionClick}
            onSubOptionClick={handleWhatsappSubOptionClick}
          />
        </div>
      </div>
    </div>
  );
}
