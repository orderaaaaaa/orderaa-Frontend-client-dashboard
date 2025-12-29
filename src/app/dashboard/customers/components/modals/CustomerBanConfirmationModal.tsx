import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TfiAlert } from 'react-icons/tfi';
import { LiaGhostSolid } from 'react-icons/lia';
import { PiEyesFill } from 'react-icons/pi';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';

interface CustomerBanConfirmationModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (id: string, note: string) => void;
  customer?: {
    name: string;
    isBlocked?: boolean;
    notes?: string | string[]; // تعديل لتقبل النوعين
  };
}

const patches = [
  { icon: <LiaGhostSolid className="w-4 h-4" />, state: 'عميل شبح' },
  { icon: <PiEyesFill className="w-4 h-4" />, state: 'عميل متفرج' },
];

const CustomerBanConfirmationModal: React.FC<
  CustomerBanConfirmationModalProps
> = ({ id, isOpen, onClose, onConfirm, customer }) => {
  // تحويل المصفوفة إلى نص إذا لزم الأمر لمنع خطأ الـ API
  const initialNote = Array.isArray(customer?.notes)
    ? customer.notes.join(', ')
    : customer?.notes || '';

  const [note, setNote] = useState(initialNote);

  // تحديث الملاحظة عند فتح المودال لعميل مختلف
  useEffect(() => {
    if (isOpen) setNote(initialNote);
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

  const isUnbanning = customer?.isBlocked;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-50">
          <div
            className={`flex items-center gap-3 ${
              isUnbanning ? 'text-green-600' : 'text-[#95071f]'
            }`}
          >
            <div
              className={`${
                isUnbanning ? 'bg-green-50' : 'bg-red-50'
              } p-2 rounded-full`}
            >
              <TfiAlert className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-bold">
              {isUnbanning ? 'تأكيد إلغاء الحظر' : 'تأكيد الحظر'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            {isUnbanning
              ? 'هل أنت متأكد من إلغاء حظر هذا العميل؟ سيتمكن من الطلب مرة أخرى.'
              : 'هل أنت متأكد من حظر هذا العميل؟ لن يتمكن من القيام بعمليات جديدة.'}
          </p>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {customer?.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {patches.map((patch, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white"
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

        {/* حقل الإدخال فوق أزرار التأكيد مباشرة */}
        <div className="p-4 md:p-6 bg-gray-50/50 space-y-4">
          <Input
            label={isUnbanning ? 'سبب إلغاء الحظر' : 'سبب الحظر'}
            name="notes"
            placeholder="اكتب ملاحظاتك هنا..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-white"
          />

          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              onClick={() => onConfirm?.(id, note)}
              className="w-full sm:flex-1 px-6 py-3 cursor-pointer font-bold rounded-xl transition-all text-white shadow-lg active:scale-95 bg-[#5d24e1] hover:bg-[#4a1cb5] shadow-purple-200"
            >
              {isUnbanning ? 'تأكيد إلغاء الحظر' : 'تأكيد الحظر'}
            </button>
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200"
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
