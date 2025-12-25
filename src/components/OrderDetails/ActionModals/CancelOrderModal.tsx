'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaCommentDotsSolid, LiaAngleDownSolid } from 'react-icons/lia';
import { useCancellationReasons, useTopCancellationReasons, CancellationReason } from '@/services/orders';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: allReasons = [], isLoading: loadingAllReasons } = useCancellationReasons(isOpen);
  const { data: topReasons = [], isLoading: loadingTopReasons } = useTopCancellationReasons(isOpen);

  const handleConfirm = async () => {
    if (!selectedReasonId) return;
    await onConfirm({ reasonId: selectedReasonId, notes });
    handleReset();
  };

  const isFormValid = !!selectedReasonId;

  const handleReset = () => {
    setSelectedReasonId(null);
    setNotes('');
    setIsDropdownOpen(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSelectReason = (reason: CancellationReason) => {
    setSelectedReasonId(reason.id);
    setIsDropdownOpen(false);
  };

  const selectedReason = allReasons.find(r => r.id === selectedReasonId);

  const dropdownReasons = allReasons.filter(
    reason => !topReasons.some(top => top.id === reason.id)
  );

  const isLoading = loadingAllReasons || loadingTopReasons;

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
              <div className="flex flex-col gap-2">
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
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedReasonId === reason.id
                          ? 'border-[#5D24E1]'
                          : 'border-gray-300'
                        }`}
                    >
                      {selectedReasonId === reason.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#5D24E1]"></div>
                      )}
                    </div>
                    <span
                      className={`text-base ${selectedReasonId === reason.id
                          ? 'text-[#5D24E1] font-semibold'
                          : 'text-[#1F1F1F]'
                        }`}
                    >
                      {reason.reasonName}
                    </span>
                  </label>
                ))}
              </div>

              {dropdownReasons.length > 0 && (
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full border rounded-lg px-4 py-3 text-right text-base flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#5D24E1] transition-all ${selectedReason && !topReasons.some(t => t.id === selectedReasonId)
                        ? 'border-[#5D24E1] bg-[#F6F2FC]'
                        : 'border-[#ECECEC]'
                      }`}
                  >
                    <span
                      className={
                        selectedReason && !topReasons.some(t => t.id === selectedReasonId)
                          ? 'text-[#5D24E1] font-semibold'
                          : 'text-[#5F5E5E]'
                      }
                    >
                      {selectedReason && !topReasons.some(t => t.id === selectedReasonId)
                        ? selectedReason.reasonName
                        : 'أسباب أخرى...'}
                    </span>
                    <LiaAngleDownSolid
                      className={`w-4 h-4 text-[#5F5E5E] transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-[#ECECEC] rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                      {dropdownReasons.map((reason) => (
                        <button
                          key={reason.id}
                          onClick={() => handleSelectReason(reason)}
                          className={`w-full px-4 py-3 text-right text-base transition-colors ${selectedReasonId === reason.id
                              ? 'bg-[#F6F2FC] text-[#5D24E1] font-semibold'
                              : 'text-[#5F5E5E] hover:bg-purple-50'
                            }`}
                        >
                          {reason.reasonName}
                        </button>
                      ))}
                    </div>
                  )}
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
