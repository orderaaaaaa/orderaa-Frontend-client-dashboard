'use client';

import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/ui/base-modal';

interface AddColorProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (color: string) => void;
  currentProductColors?: string[];
}

const colorOptions = ['اسود', 'ابيض', 'احمر', 'ازرق', 'اخضر', 'بني', 'رمادي', 'اصفر', 'برتقالي', 'بنفسجي', 'وردي', 'بيج'];

export default function AddColorProductModal({
  isOpen,
  onClose,
  onSave,
  currentProductColors = [],
}: AddColorProductModalProps) {
  const [selectedColor, setSelectedColor] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedColor('');
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!selectedColor) {
      alert('يرجى اختيار اللون');
      return;
    }
    onSave(selectedColor);
    setSelectedColor('');
  };

  const handleClose = () => {
    setSelectedColor('');
    setIsDropdownOpen(false);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="إضافة منتج من نفس اللون"
      onConfirm={handleSave}
      confirmText="إضافة"
    >
      <div className="space-y-6">
        <p className="text-[#5F5E5E] text-sm">
          اختر اللون المطلوب لإرسال صورته للعميل عبر واتساب
        </p>

        {/* Color Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            اللون <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E] flex items-center justify-between"
              style={{ direction: 'rtl' }}
            >
              <span className={selectedColor ? 'text-[#1F1F1F]' : ''}>
                {selectedColor || 'اختر اللون'}
              </span>
              <svg
                width="15"
                height="30"
                viewBox="0 0 15 30"
                fill="none"
                className="transform rotate-90"
              >
                <path
                  d="M13.5 7.5L7.5 13.5L1.5 7.5"
                  stroke="#5F5E5E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-full bg-white border border-[#ECECEC] rounded-2xl shadow-lg max-h-60 overflow-y-auto z-10">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-6 py-3 text-right text-lg transition-colors ${
                      selectedColor === color
                        ? 'bg-[#F6F2FC] text-[#5D24E1] font-bold'
                        : 'text-[#5F5E5E] hover:bg-purple-50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Product Colors Info */}
        {currentProductColors.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-bold text-[#1F1F1F] mb-2">ألوان المنتج الحالية:</p>
            <div className="flex flex-wrap gap-2">
              {currentProductColors.map((color, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white border border-[#ECECEC] rounded-full text-sm text-[#5F5E5E]"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}

