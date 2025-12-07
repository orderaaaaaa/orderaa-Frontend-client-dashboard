'use client';

import { useState } from 'react';
import { LiaTimesSolid, LiaCheckCircle } from 'react-icons/lia';
import { Button } from '../ui/button';

interface ActionConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ActionConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
}: ActionConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    try {
      // Call onConfirm FIRST and wait for it to complete
      await onConfirm();

      // Only show success animation and close if onConfirm succeeded
      setIsConfirming(true);

      // Wait for animation to complete before closing
      setTimeout(() => {
        setIsConfirming(false);
        onClose();
      }, 600);
    } catch (error) {
      // If onConfirm fails, don't show animation or close modal
      console.error('Confirmation action failed:', error);
      setIsConfirming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div
        className={`relative w-full max-w-[500px] bg-white rounded-[20px] shadow-xl transition-all duration-300 ${isConfirming ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Animation Overlay */}
        {isConfirming && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-[20px] z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <LiaCheckCircle
                  className="w-24 h-24 text-green-500 animate-[bounce_0.6s_ease-in-out]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-green-500 animate-ping opacity-75"></div>
                </div>
              </div>
              <p className="text-lg font-bold text-green-600 animate-pulse">تم التأكيد</p>
            </div>
          </div>
        )}

        {/* Header with gradient background */}
        <div
          className="h-[60px] rounded-t-[20px] flex items-center justify-center px-8"
          style={{
            background:
              'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
          }}
        >
          <h2 className="text-xl font-bold text-black text-center">
            {title}
          </h2>

          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute left-8 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
            disabled={isConfirming}
          >
            <LiaTimesSolid className="w-6 h-6 text-black" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <p className="text-base text-[#1F1F1F] text-center mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-8 py-2 border-2 border-[#5D24E1] text-[#5D24E1] rounded-[28px] font-bold hover:bg-purple-50 transition-colors"
              disabled={isConfirming}
            >
              {cancelText}
            </Button>
            <Button
              variant="default"
              onClick={handleConfirm}
              className="px-8 py-2 bg-[#5D24E1] rounded-[28px] font-bold text-white hover:bg-[#4B1BC4] transition-all duration-200 hover:scale-105"
              disabled={isConfirming}
            >
              <LiaCheckCircle className="w-5 h-5 ml-2" />
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
