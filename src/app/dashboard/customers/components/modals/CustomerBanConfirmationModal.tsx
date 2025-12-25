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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl p-6 shadow-2xl w-[50%] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-gray-200">
          <div>
            <h2 className="text-xl text-[#95071f] flex gap-2 items-center font-semibold text-right">
              <span>
                <TfiAlert />
              </span>
              هل متأكد حظر هذا العميل
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Client Info */}
        <div className="px-6 py-3 space-y-6 border-b border-gray-200">
          <div className="space-y-4">
            <h3 className="text-2xl font-medium text-gray-900 text-right">
              {customer?.name}
            </h3>
            <div className="flex flex-wrap gap-3 mt-6">
              {patches.map((patch, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white shadow-sm"
                >
                  <span className="text-gray-600">{patch.icon}</span>
                  <span className="text-gray-800 text-sm font-medium">
                    {patch.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end">
          <div className="grid sm:grid-cols-2 w-[45%] gap-3 p-6">
            <button
              onClick={handleConfirm}
              className={`px-6 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-[#5d24e1] text-white`}
            >
              {customer?.isBlocked ? 'تأكيد إلغاء الحظر' : 'تأكيد الحظر'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBanConfirmationModal;
