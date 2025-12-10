import React, { useState } from 'react';
import {
  LiaBoltSolid,
  LiaBanSolid,
  LiaTimesCircleSolid,
  LiaHourglassSolid,
  LiaCalendarAltSolid,
  LiaWhatsapp,
  LiaStopCircleSolid,
  LiaLockSolid,
  LiaAngleDownSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';

/**
 * Sub-option type for WhatsApp actions
 */
interface SubOption {
  label: string;
  action: string;
}

/**
 * Action option type
 */
interface ActionOption {
  label: string;
  action: string;
  icon: React.ReactNode;
  hasSubOptions?: boolean;
  subOptions?: SubOption[];
}

/**
 * Arrow dropdown options
 */
const arrowOptions: ActionOption[] = [
  { label: 'مستعجل', action: 'urgent', icon: <LiaBoltSolid className="w-5 h-5" />, hasSubOptions: false },
  { label: 'الغاء', action: 'cancel', icon: <LiaBanSolid className="w-5 h-5" />, hasSubOptions: false },
  { label: 'رفض التعديل', action: 'reject_modification', icon: <LiaTimesCircleSolid className="w-5 h-5" />, hasSubOptions: false },
  { label: 'تأجيل ساعات', action: 'postpone_hours', icon: <LiaHourglassSolid className="w-5 h-5" />, hasSubOptions: false },
  { label: 'تأجيل أيام', action: 'postpone_days', icon: <LiaCalendarAltSolid className="w-5 h-5" />, hasSubOptions: false },
  {
    label: 'متابعة واتساب',
    action: 'whatsapp_followup',
    icon: <LiaWhatsapp className="w-5 h-5" />,
    hasSubOptions: true,
    subOptions: [
      { label: 'إرسال صورة', action: 'send_natural_image' },
      { label: 'إرسال فيديو', action: 'send_natural_video' },
    ]
  },
  { label: 'وقف التشغيل', action: 'stop_operation', icon: <LiaStopCircleSolid className="w-5 h-5" />, hasSubOptions: false },
  { label: 'في انتظار الدفع', action: 'waiting_payment', icon: <LiaLockSolid className="w-5 h-5" />, hasSubOptions: false },
];

/**
 * Props for ActionsDropdown component
 */
export interface ActionsDropdownProps {
  isOpen: boolean;
  onActionClick: (label: string, action: string, hasSubOptions?: boolean) => void;
  onSubOptionClick: (action: string, label: string) => void;
}

/**
 * ActionsDropdown Component
 *
 * Displays a dropdown menu with all order actions, including WhatsApp accordion
 *
 * @param props - Component props
 */
export function ActionsDropdown({ isOpen, onActionClick, onSubOptionClick }: ActionsDropdownProps) {
  const [isWhatsappAccordionOpen, setIsWhatsappAccordionOpen] = useState(false);

  if (!isOpen) return null;

  const handleActionClick = (label: string, action: string, hasSubOptions?: boolean) => {
    if (hasSubOptions && action === 'whatsapp_followup') {
      setIsWhatsappAccordionOpen(!isWhatsappAccordionOpen);
      return;
    }
    onActionClick(label, action, hasSubOptions);
    setIsWhatsappAccordionOpen(false);
  };

  return (
    <div
      className="absolute bottom-full mb-2 right-0 min-w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
      dir="rtl"
    >
      {arrowOptions.map((option) => (
        <div key={option.action}>
          {/* Main Option Button */}
          <Button
            variant="ghost"
            onClick={() => handleActionClick(option.label, option.action, option.hasSubOptions)}
            className="w-full px-4 py-3 text-sm font-bold text-[#1F1F1F] hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 justify-start"
          >
            <div className="flex flex-row items-center justify-between gap-2 w-full">
              <div className="flex flex-row items-center gap-2">
                {option.icon}
                {option.label}
              </div>
              <div className="">
                {option.hasSubOptions && (
                  <LiaAngleDownSolid
                    className={`w-4 h-4 transition-transform ${
                      isWhatsappAccordionOpen && option.action === 'whatsapp_followup' ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </div>
            </div>
          </Button>

          {/* Sub-options Accordion */}
          {option.hasSubOptions &&
            option.subOptions &&
            isWhatsappAccordionOpen &&
            option.action === 'whatsapp_followup' && (
              <div className="bg-white" dir="rtl">
                {option.subOptions.map((subOption) => (
                  <button
                    key={subOption.action}
                    onClick={() => {
                      onSubOptionClick(subOption.action, subOption.label);
                      setIsWhatsappAccordionOpen(false);
                    }}
                    className="w-full px-8 py-2.5 text-right text-xs cursor-pointer hover:bg-purple-50 transition-colors flex items-center justify-start"
                  >
                    {subOption.label}
                  </button>
                ))}
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
