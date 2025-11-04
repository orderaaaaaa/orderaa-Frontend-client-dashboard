'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (size: string, color: string) => void;
  currentSize: string | number;
  currentColor: string;
}

const sizeOptions = ['37', '38', '39', '40', '41', '42', '43', '44', '45'];
const colorOptions = ['اسود', 'ابيض', 'احمر', 'ازرق', 'اخضر', 'بني', 'رمادي'];

export default function EditProductModal({
  isOpen,
  onClose,
  onSave,
  currentSize,
  currentColor,
}: EditProductModalProps) {
  const [size, setSize] = useState(String(currentSize));
  const [color, setColor] = useState(currentColor);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  useEffect(() => {
    setSize(String(currentSize));
    setColor(currentColor);
  }, [currentSize, currentColor]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(size, color);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div
        className="relative w-[827px] h-[362px] bg-white rounded-[20px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div
          className="absolute top-0 left-0 right-0 h-[79px] rounded-t-[20px] flex items-center justify-center px-8"
          style={{
            background:
              'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
          }}
        >
          <h2
            className="text-xl font-bold text-black text-center"
            style={{ fontFamily: 'Janna LT' }}
          >
            تعديل المنتج
          </h2>
          
          <button
            onClick={onClose}
            className="absolute left-8 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <X className="w-6 h-6 text-black" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="absolute top-[101px] left-0 right-0 px-8">
          <div className="flex gap-4 justify-end">
            {/* Size Dropdown - Right side */}
            <div className="w-[374px]">
              <label
                className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right"
                style={{ fontFamily: 'Janna LT' }}
              >
                القياس
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsSizeDropdownOpen(!isSizeDropdownOpen);
                    setIsColorDropdownOpen(false);
                  }}
                  className="w-full h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E] flex items-center justify-between"
                  style={{ fontFamily: 'Janna LT', direction: 'rtl' }}
                >
                  <span>{size}</span>
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
                {isSizeDropdownOpen && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-[#ECECEC] rounded-2xl shadow-lg max-h-60 overflow-y-auto z-10">
                    {sizeOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSize(option);
                          setIsSizeDropdownOpen(false);
                        }}
                        className="w-full px-6 py-3 text-right text-lg text-[#5F5E5E] hover:bg-purple-50 transition-colors"
                        style={{ fontFamily: 'Janna LT' }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Color Dropdown - Left side */}
            <div className="w-[374px]">
              <label
                className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right"
                style={{ fontFamily: 'Janna LT' }}
              >
                اللون
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsColorDropdownOpen(!isColorDropdownOpen);
                    setIsSizeDropdownOpen(false);
                  }}
                  className="w-full h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E] flex items-center justify-between"
                  style={{ fontFamily: 'Janna LT', direction: 'rtl' }}
                >
                  <span>{color}</span>
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
                {isColorDropdownOpen && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-[#ECECEC] rounded-2xl shadow-lg max-h-60 overflow-y-auto z-10">
                    {colorOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setColor(option);
                          setIsColorDropdownOpen(false);
                        }}
                        className="w-full px-6 py-3 text-right text-lg text-[#5F5E5E] hover:bg-purple-50 transition-colors"
                        style={{ fontFamily: 'Janna LT' }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="absolute bottom-[45px] right-8 w-[146px] h-[37px] bg-[#5D24E1] border-[1.5px] border-[#5D24E1] rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors"
        >
          <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
          <span
            className="text-lg font-bold text-white"
            style={{ fontFamily: 'Janna LT' }}
          >
            حفظ
          </span>
        </button>
      </div>
    </div>
  );
}

