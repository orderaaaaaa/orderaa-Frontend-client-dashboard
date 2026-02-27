import React, { useState, useRef, useEffect } from 'react';
import {
  LiaPhoneSolid,
  LiaEditSolid,
  LiaCheckSolid,
  LiaTimesSolid,
  LiaPlusSolid,
  LiaTrashSolid,
  LiaCopySolid,
} from 'react-icons/lia';
import { usePhoneNumbers } from '@/hooks/OrderDetails/usePhoneNumbers';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

/**
 * Props for PhoneNumberList component
 */
export interface PhoneNumberListProps {
  customerId: number;
  orderId: number;
  phoneNumbers: string[];
  onUpdate?: (phoneNumbers: string[]) => void;
  className?: string;
}

/**
 * PhoneNumberList Component
 *
 * Displays and manages phone numbers with add, edit, and remove functionality
 *
 * @param props - Component props
 */
export function PhoneNumberList({
  customerId,
  orderId,
  phoneNumbers: initialPhoneNumbers,
  onUpdate,
  className = '',
}: PhoneNumberListProps) {
  const phones = usePhoneNumbers({
    customerId,
    orderId,
    initialPhones: initialPhoneNumbers,
    onUpdate,
  });

  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState<number | null>(null);
  const phoneDropdownRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPhoneDropdownOpen !== null) {
        const activeRef = phoneDropdownRefs.current.get(isPhoneDropdownOpen);
        if (activeRef && !activeRef.contains(event.target as Node)) {
          setIsPhoneDropdownOpen(null);
        }
      }
    };

    if (isPhoneDropdownOpen !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPhoneDropdownOpen]);

  const handlePhoneCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      toast.success('تم نسخ الرقم');
    } catch {
      toast.error('فشل في نسخ الرقم');
    }
  };

  const handleEditClick = (index: number) => {
    phones.handleEdit(index);
    setIsPhoneDropdownOpen(null);
  };

  return (
    <div className={`flex flex-col gap-2 min-w-0 ${className}`}>
      <p className="font-bold text-[#121212]">أرقام الهاتف</p>
      <div className="space-y-2">
        {phones.phoneNumbers.map((phone, index) => (
          <div key={index} className="relative" ref={(el) => {
            if (el) {
              phoneDropdownRefs.current.set(index, el);
            } else {
              phoneDropdownRefs.current.delete(index);
            }
          }}>
            {phones.editingIndex === index ? (
              <div className="flex gap-2 items-center w-full overflow-hidden">
                <input
                  type="tel"
                  value={phones.newPhoneNumber}
                  onChange={(e) => phones.setNewPhoneNumber(e.target.value)}
                  className="flex-1 min-w-0 w-full border border-primary rounded px-2 py-1 text-base focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={phones.handleSave}
                  className="p-1 hover:bg-green-100 rounded flex-shrink-0"
                >
                  <LiaCheckSolid className="w-4 h-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={phones.handleCancel}
                  className="p-1 hover:bg-red-100 rounded flex-shrink-0"
                >
                  <LiaTimesSolid className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <div className={`${tagStyle} relative`}>
                <LiaPhoneSolid size={18} className="flex-shrink-0" />
                <Button
                  variant="ghost"
                  onClick={() => handlePhoneCall(phone)}
                  className="flex-1 min-w-0 text-right hover:text-primary p-0 h-auto font-bold text-[15px] text-[#000000] truncate justify-start"
                >
                  {phone}
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setIsPhoneDropdownOpen(isPhoneDropdownOpen === index ? null : index)
                    }
                    className="p-1 hover:bg-purple-100 rounded transition-colors"
                  >
                    <LiaEditSolid className="w-4 h-4 text-primary" />
                  </Button>
                  {isPhoneDropdownOpen === index && (
                    <div
                      className="absolute top-full mt-2 left-0 min-w-[150px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-[999999999]"
                    >
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handlePhoneCall(phone);
                          setIsPhoneDropdownOpen(null);
                        }}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-purple-50 transition-colors flex items-center gap-2 justify-start"
                      >
                        <LiaPhoneSolid className="w-4 h-4" />
                        اتصال
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleCopyPhone(phone);
                          setIsPhoneDropdownOpen(null);
                        }}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-purple-50 transition-colors flex items-center gap-2 justify-start"
                      >
                        <LiaCopySolid className="w-4 h-4" />
                        نسخ
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleEditClick(index)}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-purple-50 transition-colors flex items-center gap-2 justify-start"
                      >
                        <LiaEditSolid className="w-4 h-4" />
                        تعديل
                      </Button>
                      {phones.phoneNumbers.length > 1 && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            phones.handleRemove(index);
                            setIsPhoneDropdownOpen(null);
                          }}
                          className="w-full px-4 py-2 text-right text-sm hover:bg-red-50 transition-colors flex items-center gap-2 justify-start text-red-600"
                        >
                          <LiaTrashSolid className="w-4 h-4" />
                          حذف
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {phones.editingIndex === phones.phoneNumbers.length && (
          <div className="flex gap-2 items-center w-full overflow-hidden">
            <input
              type="tel"
              value={phones.newPhoneNumber}
              onChange={(e) => phones.setNewPhoneNumber(e.target.value)}
              placeholder="أدخل رقم الهاتف"
              className="flex-1 min-w-0 w-full border border-primary rounded px-2 py-1 text-base focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={phones.handleSave}
              className="p-1 hover:bg-green-100 rounded flex-shrink-0"
            >
              <LiaCheckSolid className="w-4 h-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={phones.handleCancel}
              className="p-1 hover:bg-red-100 rounded flex-shrink-0"
            >
              <LiaTimesSolid className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        )}
        {phones.editingIndex !== phones.phoneNumbers.length && (
          <Button
            variant="link"
            onClick={phones.handleAdd}
            className="text-primary text-sm font-bold hover:text-[#4B1BC4] p-0 h-auto gap-2 hover:no-underline"
          >
            <LiaPlusSolid className="w-4 h-4" />
            إضافة رقم هاتف
          </Button>
        )}
      </div>
    </div>
  );
}
