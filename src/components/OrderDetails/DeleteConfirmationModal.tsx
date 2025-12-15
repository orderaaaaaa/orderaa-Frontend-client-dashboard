'use client';

import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      toast.success('تم حذف المنتج بنجاح');
      onClose();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('فشل في حذف المنتج. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className="w-[827px] bg-white rounded-[20px] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-[79px] rounded-t-[20px] flex items-center justify-between px-8"
          style={{
            background:
              'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
          }}
        >
          <h2 className="text-xl font-bold text-black text-center flex-1">
            حذف المنتج
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <X className="w-6 h-6 text-black" strokeWidth={2} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-6 flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" strokeWidth={2} />
              </div>
            </div>

            <p className="text-lg font-bold text-[#1F1F1F]">
              هل أنت متأكد من حذف هذا المنتج؟
            </p>

            <p className="text-base font-normal text-[#5F5E5E]">
              {productName}
            </p>

            <p className="text-sm font-normal text-[#5F5E5E]">
              لا يمكن التراجع عن هذا الإجراء
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 pb-8 flex gap-4 justify-end">
          {/* Cancel Button */}
          <Button
            onClick={onClose}
            disabled={isDeleting}
            className="w-[146px] h-[37px] bg-white border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg font-bold text-[#5F5E5E]">
              إلغاء
            </span>
          </Button>

          {/* Delete Button */}
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-[146px] h-[37px] bg-red-600 border-[1.5px] border-red-600 rounded-[28px] flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            <span className="text-lg font-bold text-white">
              {isDeleting ? 'جاري الحذف...' : 'حذف'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

