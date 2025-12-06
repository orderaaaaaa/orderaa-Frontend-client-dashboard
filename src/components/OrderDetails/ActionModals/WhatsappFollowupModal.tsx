'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaAngleDownSolid, LiaWhatsapp } from 'react-icons/lia';

interface WhatsappFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedOption: string) => void;
  onColorImageRequest: () => void; // Opens color product modal
}

const followupOptions = [
  { id: 'no_response', label: 'لا يرد', hasSubOptions: false },
  { id: 'wrong_number', label: 'الرقم خطأ', hasSubOptions: false },
  { id: 'busy', label: 'مشغول', hasSubOptions: false },
  { id: 'refused', label: 'رفض', hasSubOptions: false },
  {
    id: 'image_request',
    label: 'طلب صورة',
    hasSubOptions: true,
    subOptions: [
      { id: 'professional_color', label: 'ارسال صورة لون معين بروفيشنال' },
      { id: 'natural_color', label: 'ارسال صورة لون معين على الطبيعة' },
      { id: 'product_video', label: 'ارسال فيديو للمنتج' },
      { id: 'product_details', label: 'ارسال تفاصيل المنتج' },
    ],
  },
  { id: 'size_inquiry', label: 'استفسار عن المقاس', hasSubOptions: false },
  { id: 'price_inquiry', label: 'استفسار عن السعر', hasSubOptions: false },
  { id: 'shipping_inquiry', label: 'استفسار عن الشحن', hasSubOptions: false },
  { id: 'other', label: 'أخرى', hasSubOptions: false },
];

export default function WhatsappFollowupModal({
  isOpen,
  onClose,
  onConfirm,
  onColorImageRequest,
}: WhatsappFollowupModalProps) {
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedSubOption, setSelectedSubOption] = useState<string>('');

  const handleOptionClick = (optionId: string) => {
    const option = followupOptions.find((opt) => opt.id === optionId);
    
    if (option?.hasSubOptions) {
      setExpandedOption(expandedOption === optionId ? null : optionId);
    } else {
      setSelectedOption(optionId);
      setSelectedSubOption('');
      onConfirm(option?.label || optionId);
      handleReset();
    }
  };

  const handleSubOptionClick = (parentId: string, subOptionId: string, subOptionLabel: string) => {
    setSelectedOption(parentId);
    setSelectedSubOption(subOptionId);

    // Special handling for color image requests
    if (subOptionId === 'professional_color' || subOptionId === 'natural_color') {
      onClose();
      onColorImageRequest();
    } else {
      onConfirm(subOptionLabel);
      handleReset();
    }
  };

  const handleReset = () => {
    setExpandedOption(null);
    setSelectedOption('');
    setSelectedSubOption('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="متابعة واتساب"
      showFooter={false}
      maxWidth="w-[600px]"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-4 text-[#5F5E5E]">
          <LiaWhatsapp className="w-5 h-5" />
          <p className="text-sm">اختر نوع المتابعة</p>
        </div>

        {followupOptions.map((option) => (
          <div key={option.id} className="border border-[#ECECEC] rounded-lg overflow-hidden">
            {/* Main Option */}
            <button
              onClick={() => handleOptionClick(option.id)}
              className={`w-full px-4 py-3 text-right flex items-center justify-between transition-colors ${
                selectedOption === option.id && !option.hasSubOptions
                  ? 'bg-[#F6F2FC] text-[#5D24E1]'
                  : 'hover:bg-gray-50 text-[#1F1F1F]'
              }`}
            >
              <span className="font-bold">{option.label}</span>
              {option.hasSubOptions && (
                <LiaAngleDownSolid
                  className={`w-5 h-5 transition-transform ${
                    expandedOption === option.id ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {/* Sub Options (Accordion) */}
            {option.hasSubOptions && expandedOption === option.id && (
              <div className="bg-gray-50 border-t border-[#ECECEC]">
                {option.subOptions?.map((subOption) => (
                  <button
                    key={subOption.id}
                    onClick={() => handleSubOptionClick(option.id, subOption.id, subOption.label)}
                    className={`w-full px-6 py-3 text-right text-sm transition-colors ${
                      selectedSubOption === subOption.id
                        ? 'bg-[#F6F2FC] text-[#5D24E1] font-bold'
                        : 'hover:bg-gray-100 text-[#5F5E5E]'
                    }`}
                  >
                    {subOption.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </BaseModal>
  );
}

