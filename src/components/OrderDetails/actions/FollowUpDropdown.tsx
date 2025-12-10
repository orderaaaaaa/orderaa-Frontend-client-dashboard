import React from 'react';
import {
  LiaPhoneSlashSolid,
  LiaLockSolid,
  LiaBanSolid,
  LiaExchangeAltSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';

/**
 * Follow-up option type
 */
interface FollowUpOption {
  label: string;
  action: string;
  icon: React.ReactNode;
}

/**
 * Follow-up dropdown options
 */
const followUpOptions: FollowUpOption[] = [
  { label: 'لا يرد', action: 'no_answer', icon: <LiaPhoneSlashSolid className="w-5 h-5" /> },
  { label: 'مغلق', action: 'closed', icon: <LiaLockSolid className="w-5 h-5" /> },
  { label: 'مش بيجمع', action: 'not_collecting', icon: <LiaBanSolid className="w-5 h-5" /> },
  { label: 'فتح و قفل', action: 'open_close', icon: <LiaExchangeAltSolid className="w-5 h-5" /> },
];

/**
 * Props for FollowUpDropdown component
 */
export interface FollowUpDropdownProps {
  isOpen: boolean;
  onClick: (label: string, action: string) => void;
}

/**
 * FollowUpDropdown Component
 *
 * Displays a dropdown menu with follow-up action options
 *
 * @param props - Component props
 */
export function FollowUpDropdown({ isOpen, onClick }: FollowUpDropdownProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute bottom-full mb-2 right-0 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
      dir="rtl"
    >
      {followUpOptions.map((option) => (
        <Button
          key={option.action}
          variant="ghost"
          onClick={() => onClick(option.label, option.action)}
          className="w-full px-4 py-3 text-right text-sm font-bold text-[#1F1F1F] hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 justify-start"
        >
          {option.icon}
          {option.label}
        </Button>
      ))}
    </div>
  );
}
