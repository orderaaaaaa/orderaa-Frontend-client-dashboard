'use client';

import React, { useState, useEffect } from 'react';
import { LiaExclamationTriangleSolid, LiaGhostSolid, LiaEyeSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';

interface CustomerBanConfirmationModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (id: string, note: string) => void;
  customer?: {
    name: string;
    isBlocked?: boolean;
    notes?: string | string[];
  };
}

const patches = [
  { icon: <LiaGhostSolid className="w-4 h-4" />, state: 'عميل شبح' },
  { icon: <LiaEyeSolid className="w-4 h-4" />, state: 'عميل متفرج' },
];

const CustomerBanConfirmationModal: React.FC<
  CustomerBanConfirmationModalProps
> = ({ id, isOpen, onClose, onConfirm, customer }) => {
  const initialNote = Array.isArray(customer?.notes)
    ? customer.notes.join(', ')
    : customer?.notes || '';

  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    if (isOpen) setNote(initialNote);
  }, [isOpen, initialNote]);

  const isUnbanning = customer?.isBlocked;

  const handleConfirm = () => {
    onConfirm?.(id, isUnbanning ? '' : note);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isUnbanning ? 'تأكيد إلغاء الحظر' : 'تأكيد الحظر'}
      showFooter={false}
      maxWidth="md:max-w-lg"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`p-2 rounded-full ${isUnbanning ? 'bg-green-50 text-green-600' : 'bg-red-50 text-[#95071f]'}`}
          >
            <LiaExclamationTriangleSolid className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            {isUnbanning
              ? 'هل أنت متأكد من إلغاء حظر هذا العميل؟ سيتمكن من الطلب مرة أخرى.'
              : 'هل أنت متأكد من حظر هذا العميل؟ لن يتمكن من القيام بعمليات جديدة.'}
          </p>
        </div>

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
                <span className="text-primary">{patch.icon}</span>
                <span className="text-gray-700 text-xs md:text-sm font-medium">
                  {patch.state}
                </span>
              </div>
            ))}
          </div>
        </div>

        {!isUnbanning && (
          <Input
            label="سبب الحظر"
            name="notes"
            placeholder="اكتب ملاحظاتك هنا..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-white"
          />
        )}

        <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
          <Button
            onClick={handleConfirm}
            className={`w-full sm:flex-1 py-3 font-bold rounded-xl text-white ${
              isUnbanning
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-primary hover:bg-[#4a1cb5]'
            }`}
          >
            {isUnbanning ? 'تأكيد إلغاء الحظر' : 'تأكيد الحظر'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 font-bold rounded-xl"
          >
            إلغاء
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default CustomerBanConfirmationModal;
