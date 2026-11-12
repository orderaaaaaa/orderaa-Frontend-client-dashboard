import React, { useEffect, useRef, useState } from 'react';
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
import { FollowUpDropdown } from './FollowUpDropdown';
import { ActionsDropdown, type PartialDeliveryMenuAction } from './ActionsDropdown';
import type { OrderActionAvailability } from './orderActionAvailability';
import type { OrderMenuAction } from './orderMenuItems';

const FOOTER_CLEARANCE_PX = 48;

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

export function OrderActionsFooter({
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
  const showActionsMenu = menuItems.length > 0;
  const showActionGroup = availability.confirm || availability.followUp || showActionsMenu;

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

  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const element = footerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setFooterHeight(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div aria-hidden="true" style={{ height: footerHeight + FOOTER_CLEARANCE_PX }} />
      <div
        ref={footerRef}
        className="fixed bottom-8 left-0 right-0 z-(--z-page-fixed) flex flex-col items-center gap-3 px-4 font-sans"
      >
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="ghost"
            onClick={onNavigatePrevious}
            disabled={isBusy || isNavigatingPrevious || !onNavigatePrevious}
            className="w-9 h-9 rounded-full border border-gray-300 bg-card shadow-sm hover:bg-gray-50 text-purple-700"
          >
            <LiaAngleRightSolid className="w-6 h-6" />
          </Button>

          {availability.stopBar ? (
            <Button
              variant="default"
              onClick={() => onActionClick('وقف التشغيل', 'stop_operation')}
              disabled={isBusy}
              className="bg-red-600 rounded-full px-8 h-13 shadow-2xl text-white text-sm font-bold hover:brightness-90 transition-colors flex items-center gap-3"
            >
              <LiaStopCircleSolid className="w-5 h-5" />
              وقف التشغيل
            </Button>
          ) : showActionGroup ? (
            <div className="bg-primary rounded-full px-8 h-13 flex items-center gap-8 shadow-2xl relative">
              {availability.confirm && (
                <Button
                  variant="ghost"
                  onClick={onConfirm}
                  disabled={isBusy}
                  className="relative top-[-6px] flex flex-col items-center gap-[2px] text-white transition-opacity h-auto p-0 hover:bg-transparent disabled:opacity-40"
                >
                  <div className="w-8 h-8 rounded-full border-3 bg-primary border-white flex items-center justify-center">
                    <LiaCheckSolid className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">تأكيد</span>
                </Button>
              )}

              {availability.followUp && (
                <div className="relative top-[-6px]" ref={followUpDropdown.ref}>
                  <Button
                    variant="ghost"
                    onClick={handleFollowUpToggle}
                    disabled={isBusy}
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

              {showActionsMenu && (
                <div className="relative top-[-6px]" ref={actionsDropdown.ref}>
                  <Button
                    variant="ghost"
                    onClick={handleActionsToggle}
                    disabled={isBusy}
                    aria-label="إجراءات أخرى"
                    className="flex flex-col items-center gap-[2px] text-white transition-opacity h-auto p-0 min-w-10 min-h-10 hover:bg-transparent"
                  >
                    <div className="w-8 h-8 rounded-full border-3 bg-primary border-white flex items-center justify-center">
                      <LiaEllipsisHSolid className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">أخرى</span>
                  </Button>

                  <div className="fixed inset-x-4 bottom-[6.25rem]">
                    <ActionsDropdown
                      isOpen={actionsDropdown.isOpen}
                      menuItems={menuItems}
                      partialAction={partialAction}
                      undoAction={undoAction}
                      className="max-h-[60vh] max-w-full"
                      onActionClick={(label, action) => {
                        actionsDropdown.close();
                        onActionClick(label, action);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <Button
            variant="ghost"
            onClick={onNavigateNext}
            disabled={isBusy || isNavigatingNext || !onNavigateNext}
            className="w-9 h-9 rounded-full border border-gray-300 bg-card shadow-sm hover:bg-gray-50 text-purple-700"
          >
            <LiaAngleLeftSolid className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </>
  );
}
