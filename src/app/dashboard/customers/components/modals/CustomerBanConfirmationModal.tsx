import React from 'react';
import { X } from 'lucide-react';
import { TfiAlert } from 'react-icons/tfi';
import { LiaGhostSolid } from 'react-icons/lia';
import { PiEyesFill } from 'react-icons/pi';

interface CustomerBanConfirmationModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (id: string) => void;
  customer?: {
    name: string;
    phoneNumbers?: string[];
    email?: string;
    isBlocked?: boolean;
    numberOfOrders?: number;
    latestOrder?: {
      status?: string;
      createdAt?: string;
    };
    totalAmount?: number;
  };
}

const patches = [
  {
    icon: <LiaGhostSolid className="w-4 h-4" />,
    state: 'عميل شبح',
  },
  {
    icon: <PiEyesFill className="w-4 h-4" />,
    state: 'عميل متفرج',
  },
];

const CustomerBanConfirmationModal: React.FC<
  CustomerBanConfirmationModalProps
> = ({ id, isOpen, onClose, onConfirm, customer }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      dir="rtl"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-50">
          <div className="flex items-center gap-3 text-[#95071f]">
            <div className="bg-red-50 p-2 rounded-full">
              <TfiAlert className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-bold">تأكيد الحظر</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            هل أنت متأكد من {customer?.isBlocked ? 'إلغاء حظر' : 'حظر'} هذا
            العميل؟ لن يتمكن هذا المستخدم من القيام بعمليات جديدة.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {customer?.name}
            </h3>

            <div className="flex flex-wrap gap-2">
              {patches.map((patch, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm"
                >
                  <span className="text-[#5d24e1]">{patch.icon}</span>
                  <span className="text-gray-700 text-xs md:text-sm font-medium">
                    {patch.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 bg-gray-50/50 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={handleConfirm}
            className="w-full sm:flex-1 px-6 py-3 font-bold rounded-xl transition-all bg-[#5d24e1] text-white hover:bg-[#4a1cb5] shadow-lg shadow-purple-200 active:scale-95"
          >
            {customer?.isBlocked ? 'تأكيد إلغاء الحظر' : 'تأكيد الحظر'}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 transition-all active:scale-95"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerBanConfirmationModal;
