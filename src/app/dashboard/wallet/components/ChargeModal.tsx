'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useChargeOptions, useTopUp } from '@/services/wallet';
import { WalletChargeOption } from '@/types/wallet';
import { LiaWalletSolid } from 'react-icons/lia';

interface ChargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ChargeModal({ open, onOpenChange }: ChargeModalProps) {
  const { data: chargeOptions, isLoading, isError, refetch } = useChargeOptions();
  const topUpMutation = useTopUp();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const popupRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  const stopPopupCheck = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    popupRef.current = null;
  }, []);

  const handleSelectOption = async (optionId: number) => {
    setSelectedOption(optionId);
    setStatusMessage(null);

    try {
      const session = await topUpMutation.mutateAsync(optionId);

      // Open Kashier payment page in popup
      const popup = window.open(
        session.sessionUrl,
        'kashier-payment',
        'width=800,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup || popup.closed) {
        setStatusMessage('تم فتح صفحة الدفع. إذا لم يتم فتحها تلقائياً، يرجى السماح بالنوافذ المنبثقة.');
        setStatusType('info');
        return;
      }

      popupRef.current = popup;
      setStatusMessage('جاري تحويلك إلى صفحة الدفع الآمنة...');
      setStatusType('info');

      // Poll for popup close — when merchant returns, refetch data
      checkIntervalRef.current = setInterval(() => {
        if (popup.closed) {
          stopPopupCheck();
          setStatusMessage('تم إغلاق نافذة الدفع. جاري التحقق من الرصيد...');
          setStatusType('success');

          // Close modal after brief delay to let user see the message
          setTimeout(() => {
            onOpenChange(false);
          }, 2000);
        }
      }, 500);

      // Safety timeout — stop checking after 5 minutes
      setTimeout(() => {
        stopPopupCheck();
      }, 5 * 60 * 1000);
    } catch (error) {
      console.error('Top-up failed:', error);
      setSelectedOption(null);
      setStatusMessage('فشلت عملية الشحن. يرجى المحاولة مرة أخرى.');
      setStatusType('error');
      stopPopupCheck();
    }
  };

  const handleOpenChangeWrapper = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setSelectedOption(null);
      setStatusMessage(null);
      stopPopupCheck();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeWrapper}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            اشحن محفظتك
          </DialogTitle>
        </DialogHeader>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-center text-sm font-medium ${
              statusType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : statusType === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
            role="alert"
          >
            {statusMessage}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col gap-4 py-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="text-center py-8">
            <p className="text-red-600 font-medium mb-4">
              تعذر تحميل خيارات الشحن
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Charge options list */}
        {!isLoading && !isError && chargeOptions && chargeOptions.length === 0 && (
          <div className="text-center py-8">
            <LiaWalletSolid className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">
              لا توجد خيارات شحن متاحة حالياً
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          chargeOptions &&
          chargeOptions.length > 0 && (
            <div className="flex flex-col gap-4 py-2">
              {chargeOptions
                .filter((option) => option.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    disabled={
                      topUpMutation.isPending && selectedOption === option.id
                    }
                    className={`
                      w-full text-right p-5 rounded-xl border-2 transition-all duration-200
                      ${
                        selectedOption === option.id && topUpMutation.isPending
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                      }
                      disabled:opacity-60 disabled:cursor-not-allowed
                      cursor-pointer
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <LiaWalletSolid className="w-5 h-5 text-purple-700" />
                        </div>
                        <div className="text-right">
                          <h4 className="font-bold text-lg text-gray-900">
                            {option.title}
                          </h4>
                          {option.description && (
                            <p className="text-sm text-gray-500 mt-0.5">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-xl text-purple-700">
                          {option.amount} {option.currency}
                        </span>
                      </div>
                    </div>

                    {selectedOption === option.id &&
                      topUpMutation.isPending && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-purple-700">
                          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                          جاري تحويلك إلى صفحة الدفع...
                        </div>
                      )}
                  </button>
                ))}
            </div>
          )}

        {/* Footer */}
        <div className="text-center mt-2">
          <p className="text-xs text-gray-400">
            سيتم تحويلك إلى صفحة دفع آمنة ومشفرة عبر Kashier
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ChargeModal;
