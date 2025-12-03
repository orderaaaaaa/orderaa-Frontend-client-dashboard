'use client';

import { X, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface ActionConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-[500px] bg-white rounded-[20px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div
          className="h-[79px] rounded-t-[20px] flex items-center justify-center px-8"
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
          >
            <X className="w-6 h-6 text-black" strokeWidth={2} />
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
            >
              {cancelText}
            </Button>
            <Button
              variant="default"
              onClick={handleConfirm}
              className="px-8 py-2 bg-[#5D24E1] rounded-[28px] font-bold text-white hover:bg-[#4B1BC4] transition-colors"
            >
              <Check className="w-4 h-4 ml-2" />
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
