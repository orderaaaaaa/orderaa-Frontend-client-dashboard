'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaCommentDotsSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useCancellationReasons, useTopCancellationReasons } from '@/services/orders';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reasonId: number; notes: string }) => void | Promise<void>;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const { data: allReasons = [], isLoading: loadingAllReasons } = useCancellationReasons(isOpen);
  const { data: topReasons = [], isLoading: loadingTopReasons } = useTopCancellationReasons(isOpen);

  const selectedReason = allReasons.find(r => r.id === selectedReasonId);

  const handleConfirm = async () => {
    if (!selectedReasonId) return;
    await onConfirm({ reasonId: selectedReasonId, notes });
    handleReset();
  };

  const isFormValid = !!selectedReasonId;

  const handleReset = () => {
    setSelectedReasonId(null);
    setNotes('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isSelectedFromTopReasons = topReasons.some(t => t.id === selectedReasonId);

  const isLoading = loadingAllReasons || loadingTopReasons;

  const handleSelectFromDropdown = (reasonName: string) => {
    const reason = allReasons.find(r => r.reasonName === reasonName);
    if (reason) {
      setSelectedReasonId(reason.id);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="إلغاء الطلب"
      onConfirm={handleConfirm}
      confirmText="تأكيد الإلغاء"
      confirmDisabled={!isFormValid}
      confirmButtonClassName="px-8 py-2 bg-red-600 rounded-[28px] font-bold text-white hover:bg-red-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            سبب الإلغاء <span className="text-red-600">*</span>
          </label>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-[#5D24E1] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 grid-cols-1 gap-2">
                {topReasons.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${selectedReasonId === reason.id
                      ? 'border-[#5D24E1] bg-[#F6F2FC]'
                      : 'border-[#ECECEC] hover:border-[#CBB5FD] hover:bg-[#FDFBFF]'
                      }`}
                    onClick={() => setSelectedReasonId(reason.id)}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedReasonId === reason.id
                        ? 'border-[#5D24E1]'
                        : 'border-gray-300'
                        }`}
                    >
                      {selectedReasonId === reason.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#5D24E1]"></div>
                      )}
                    </div>
                    <span
                      className={`text-sm ${selectedReasonId === reason.id
                        ? 'text-[#5D24E1] font-semibold'
                        : 'text-[#1F1F1F]'
                        }`}
                    >
                      {reason.reasonName}
                    </span>
                  </label>
                ))}
              </div>

              {/* Searchable Select for All Reasons */}
              {allReasons.length > 0 && (
                <div className="mt-2">
                  <SearchableSelect
                    value={selectedReason && !isSelectedFromTopReasons ? selectedReason.reasonName : undefined}
                    onValueChange={handleSelectFromDropdown}
                    options={allReasons.map(r => r.reasonName)}
                    placeholder="اختر سبب آخر..."
                    searchPlaceholder="بحث عن سبب..."
                    emptyMessage="لا توجد أسباب متاحة"
                    noResultsMessage="لا توجد نتائج للبحث"
                    triggerClassName={`border rounded-lg px-4 py-3 text-base ${selectedReason && !isSelectedFromTopReasons
                      ? 'border-[#5D24E1] bg-[#F6F2FC]'
                      : 'border-[#ECECEC]'
                      }`}
                    clearable
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F] flex items-center gap-2">
            <LiaCommentDotsSolid className="w-5 h-5" />
            ملاحظات
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف ملاحظات إضافية..."
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
          />
        </div>
      </div>
    </BaseModal>
  );
}
