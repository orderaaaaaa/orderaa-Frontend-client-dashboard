'use client';

import { X, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: DeleteConfirmationModalProps) {
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
        className="relative w-[827px] h-[320px] bg-white rounded-[20px] shadow-xl"
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
            style={{}}
          >
            حذف المنتج
          </h2>
          
          <button
            onClick={onClose}
            className="absolute left-8 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <X className="w-6 h-6 text-black" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="absolute top-[101px] left-0 right-0 px-8 flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" strokeWidth={2} />
              </div>
            </div>
            
            <p
              className="text-lg font-bold text-[#1F1F1F]"
              style={{}}
            >
              هل أنت متأكد من حذف هذا المنتج؟
            </p>
            
            <p
              className="text-base font-normal text-[#5F5E5E]"
              style={{}}
            >
              {productName}
            </p>
            
            <p
              className="text-sm font-normal text-[#5F5E5E]"
              style={{}}
            >
              لا يمكن التراجع عن هذا الإجراء
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-[45px] left-0 right-0 px-8 flex gap-4 justify-end">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-[146px] h-[37px] bg-white border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <span
              className="text-lg font-bold text-[#5F5E5E]"
              style={{}}
            >
              إلغاء
            </span>
          </button>

          {/* Delete Button */}
          <button
            onClick={handleConfirm}
            className="w-[146px] h-[37px] bg-red-600 border-[1.5px] border-red-600 rounded-[28px] flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            <span
              className="text-lg font-bold text-white"
              style={{}}
            >
              حذف
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

