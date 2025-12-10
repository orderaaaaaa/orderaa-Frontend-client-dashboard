import React, { useState, useRef, useEffect } from 'react';
import {
  LiaPhoneSolid,
  LiaEditSolid,
  LiaCheckSolid,
  LiaTimesSolid,
  LiaPlusSolid,
  LiaTrashSolid,
} from 'react-icons/lia';
import { usePhoneNumbers } from '@/hooks/OrderDetails/usePhoneNumbers';

/**
 * Props for PhoneNumberList component
 */
export interface PhoneNumberListProps {
  customerId: number;
  phoneNumber: string;
  altPhone?: string;
  onUpdate?: (phoneNumber: string, altPhone?: string) => void;
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
  phoneNumber,
  altPhone,
  onUpdate,
  className = '',
}: PhoneNumberListProps) {
  const phones = usePhoneNumbers({
    customerId,
    initialPhones: [phoneNumber, altPhone],
    onUpdate,
  });

  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState<number | null>(null);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);

  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target as Node)) {
        setIsPhoneDropdownOpen(null);
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

  const handleEditClick = (index: number) => {
    phones.handleEdit(index);
    setIsPhoneDropdownOpen(null);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="font-bold text-[#121212]">أرقام الهاتف</p>
      <div className="space-y-2">
        {phones.phoneNumbers.map((phone, index) => (
          <div key={index} className="relative" ref={index === 0 ? phoneDropdownRef : null}>
            {phones.editingIndex === index ? (
              <div className="flex gap-2 items-center">
                <input
                  type="tel"
                  value={phones.newPhoneNumber}
                  onChange={(e) => phones.setNewPhoneNumber(e.target.value)}
                  className="flex-1 border border-[#5D24E1] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5D24E1]"
                  autoFocus
                />
                <button
                  onClick={phones.handleSave}
                  className="p-1 hover:bg-green-100 rounded transition-colors"
                >
                  <LiaCheckSolid className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={phones.handleCancel}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                >
                  <LiaTimesSolid className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ) : (
              <div className={`${tagStyle} relative`}>
                <LiaPhoneSolid size={18} />
                <button
                  onClick={() => handlePhoneCall(phone)}
                  className="flex-1 text-right hover:text-[#5D24E1] transition-colors"
                >
                  {phone}
                </button>
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsPhoneDropdownOpen(isPhoneDropdownOpen === index ? null : index)
                    }
                    className="p-1 hover:bg-purple-100 rounded transition-colors"
                  >
                    <LiaEditSolid className="w-4 h-4 text-[#5D24E1]" />
                  </button>
                  {isPhoneDropdownOpen === index && (
                    <div
                      className="absolute bottom-full mb-2 right-0 min-w-[150px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
                      dir="rtl"
                    >
                      <button
                        onClick={() => {
                          handlePhoneCall(phone);
                          setIsPhoneDropdownOpen(null);
                        }}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-purple-50 transition-colors flex items-center gap-2 justify-start"
                      >
                        <LiaPhoneSolid className="w-4 h-4" />
                        اتصال
                      </button>
                      <button
                        onClick={() => handleEditClick(index)}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-purple-50 transition-colors flex items-center gap-2 justify-start"
                      >
                        <LiaEditSolid className="w-4 h-4" />
                        تعديل
                      </button>
                      {phones.phoneNumbers.length > 1 && (
                        <button
                          onClick={() => {
                            phones.handleRemove(index);
                            setIsPhoneDropdownOpen(null);
                          }}
                          className="w-full px-4 py-2 text-right text-sm hover:bg-red-50 transition-colors flex items-center gap-2 justify-start text-red-600"
                        >
                          <LiaTrashSolid className="w-4 h-4" />
                          حذف
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {phones.editingIndex === phones.phoneNumbers.length && (
          <div className="flex gap-2 items-center">
            <input
              type="tel"
              value={phones.newPhoneNumber}
              onChange={(e) => phones.setNewPhoneNumber(e.target.value)}
              placeholder="أدخل رقم الهاتف"
              className="flex-1 border border-[#5D24E1] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5D24E1]"
              autoFocus
            />
            <button
              onClick={phones.handleSave}
              className="p-1 hover:bg-green-100 rounded transition-colors"
            >
              <LiaCheckSolid className="w-4 h-4 text-green-600" />
            </button>
            <button
              onClick={phones.handleCancel}
              className="p-1 hover:bg-red-100 rounded transition-colors"
            >
              <LiaTimesSolid className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}
        {phones.editingIndex !== phones.phoneNumbers.length && (
          <button
            onClick={phones.handleAdd}
            className="flex items-center gap-2 text-[#5D24E1] text-sm font-bold hover:text-[#4B1BC4] transition-colors"
          >
            <LiaPlusSolid className="w-4 h-4" />
            إضافة رقم هاتف
          </button>
        )}
      </div>
    </div>
  );
}
