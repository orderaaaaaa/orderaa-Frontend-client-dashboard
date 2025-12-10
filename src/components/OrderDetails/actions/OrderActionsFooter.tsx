import React from 'react';
import {
  LiaCheckCircle,
  LiaCommentDotsSolid,
  LiaAngleDownSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { useDropdownState } from '@/hooks/OrderDetails/useDropdownState';
import { FollowUpDropdown } from './FollowUpDropdown';
import { ActionsDropdown } from './ActionsDropdown';

export interface OrderActionsFooterProps {
  onConfirm: () => void;
  onFollowUpClick: (label: string, action: string) => void;
  onActionClick: (label: string, action: string, hasSubOptions?: boolean) => void;
  onWhatsappSubOptionClick: (action: string, label: string) => void;
}

export function OrderActionsFooter({
  onConfirm,
  onFollowUpClick,
  onActionClick,
  onWhatsappSubOptionClick,
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

  const handleActionClick = (label: string, action: string, hasSubOptions?: boolean) => {
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
      <div className="flex gap-2 justify-center items-center sm:justify-end max-w-7xl mx-auto">
        {/* Dropdowns Container */}
        <div className="relative" ref={actionsDropdown.ref}>
          <div className="flex flex-row gap-2">
            {/* Confirm Button */}
            <Button
              variant="default"
              onClick={onConfirm}
              className="py-2 px-10 rounded-2xl bg-[#5D24E1] text-white text-sm font-bold hover:bg-[#4B1BC4] transition-all duration-700 hover:scale-105 flex items-center gap-2"
            >
              <LiaCheckCircle className="w-5 h-5" />
              تأكيد
            </Button>

            {/* Follow-up Button */}
            <div className="relative" ref={followUpDropdown.ref}>
              <Button
                variant="outline"
                onClick={handleFollowUpToggle}
                className="py-2 px-10 border-2 rounded-2xl border-[#5D24E1] text-[#5D24E1] text-sm font-bold hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <LiaCommentDotsSolid className="w-5 h-5" />
                متابعة
              </Button>

              {/* Follow-up Dropdown */}
              <FollowUpDropdown isOpen={followUpDropdown.isOpen} onClick={handleFollowUpClick} />
            </div>

            {/* More Actions Button */}
            <Button
              variant="ghost"
              onClick={handleActionsToggle}
              className="w-9 h-9 p-0 rounded-full border-2 border-[#5D24E1] hover:bg-purple-50 transition-colors"
            >
              <LiaAngleDownSolid
                className={`w-5 h-5 text-[#5D24E1] transition-all ${
                  actionsDropdown.isOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </div>

          {/* Actions Dropdown */}
          <ActionsDropdown
            isOpen={actionsDropdown.isOpen}
            onActionClick={handleActionClick}
            onSubOptionClick={handleWhatsappSubOptionClick}
          />
        </div>
      </div>
    </div>
  );
}
