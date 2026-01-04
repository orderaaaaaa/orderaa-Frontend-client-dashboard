'use client';

import React, { ReactNode, useState } from 'react';
import { LiaTimesSolid } from 'react-icons/lia';
import { Button } from './button';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  maxWidth?: string;
  height?: string;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'حفظ',
  cancelText = 'إلغاء',
  showFooter = true,
  confirmButtonClassName,
  cancelButtonClassName,
  isLoading: externalIsLoading = false,
  confirmDisabled = false,
  maxWidth = 'w-[827px]',
  height,
}: BaseModalProps) {
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const isLoading = externalIsLoading || internalIsLoading;

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (onConfirm && !isLoading && !confirmDisabled) {
      try {
        setInternalIsLoading(true);
        await onConfirm();
        setInternalIsLoading(false);
      } catch (error) {
        // If onConfirm throws error, don't close modal (user can retry)
        console.error('Confirmation action failed:', error);
        setInternalIsLoading(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div
        className={`relative ${maxWidth} ${height || ''} bg-white rounded-[20px] shadow-xl flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div
          className="h-[60px] rounded-t-[20px] flex items-center justify-center px-8 flex-shrink-0 relative"
          style={{
            background:
              'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
          }}
        >
          <h2 className="text-xl font-bold text-black text-center">
            {title}
          </h2>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute left-8 flex items-center justify-center hover:opacity-70 transition-opacity disabled:opacity-50"
          >
            <LiaTimesSolid className="w-4 h-4 text-black cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="px-8 pb-8 flex gap-4 justify-between flex-shrink-0">
            {/* Cancel Button */}
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className={
                cancelButtonClassName ||
                'w-[146px] h-[37px] bg-white border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50'
              }
            >
              <LiaTimesSolid className="w-5 h-5 text-[#5F5E5E]" />
              <span className="text-lg font-bold text-[#5F5E5E]">
                {cancelText}
              </span>
            </Button>

            {/* Confirm Button */}
            {onConfirm && (
              <Button
                variant="outline"
                onClick={handleConfirm}
                disabled={isLoading || confirmDisabled}
                className={
                  confirmButtonClassName ||
                  'w-[146px] h-[37px] bg-[#5D24E1] border-[1.5px] border-[#5D24E1] rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                }
              >
                <span className="text-lg font-bold text-white">
                  {isLoading ? 'جاري الحفظ...' : confirmText}
                </span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
