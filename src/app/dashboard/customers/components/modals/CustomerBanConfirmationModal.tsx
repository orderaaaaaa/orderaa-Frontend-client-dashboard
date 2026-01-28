'use client';

import React, { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid } from 'react-icons/lia';
import { TfiAlert } from 'react-icons/tfi';
import { LiaGhostSolid } from 'react-icons/lia';
import { PiEyesFill } from 'react-icons/pi';
import Input from '@/components/ui/Input';

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
  { icon: <PiEyesFill className="w-4 h-4" />, state: 'عميل متفرج' },
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

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-[60] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[95vw] sm:w-[90vw] md:w-auto md:max-w-md lg:max-w-lg overflow-hidden max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-50 flex-shrink-0">
            <div
              className={`flex items-center gap-3 ${isUnbanning ? 'text-green-600' : 'text-[#95071f]'
                }`}
            >
              <div
                className={`${isUnbanning ? 'bg-green-50' : 'bg-red-50'
                  } p-2 rounded-full`}
              >
                <TfiAlert className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <DialogPrimitive.Title className="text-lg md:text-xl font-bold">
                {isUnbanning ? 'تأكيد إلغاء الحظر' : 'تأكيد الحظر'}
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
              <LiaTimesSolid className="w-5 h-5 cursor-pointer" />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="sr-only">
            {isUnbanning ? 'تأكيد إلغاء حظر العميل' : 'تأكيد حظر العميل'}
          </DialogPrimitive.Description>

          <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
                    <span className="text-primary">{patch.icon}</span>
                    <span className="text-gray-700 text-xs md:text-sm font-medium">
                      {patch.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-gray-50/50 space-y-4 flex-shrink-0">
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

            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <button
                onClick={() => onConfirm?.(id, isUnbanning ? '' : note)}
                className={`w-full sm:flex-1 px-6 py-3 cursor-pointer font-bold rounded-xl transition-all text-white shadow-lg active:scale-95 ${isUnbanning
                    ? 'bg-green-600 hover:bg-green-700 shadow-green-100'
                    : 'bg-primary hover:bg-[#4a1cb5] shadow-purple-200'
                  }`}
              >
                {isUnbanning ? 'تأكيد إلغاء الحظر' : 'تأكيد الحظر'}
              </button>
              <button
                onClick={onClose}
                className="w-full sm:flex-1 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default CustomerBanConfirmationModal;
