'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { formatDisplayTime } from '@/components/OrderDetails/fields/TimeRangeField';
import { useSetDeliveryWindow } from '@/services/shippingProviders';

interface DeliveryWindowModalProps {
  shippingCompanyId: number;
  orderId: number;
  availableFrom: string | null;
  availableTo: string | null;
  onClose: () => void;
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const period = hour < 12 ? 'am' : 'pm';
  const key = `${hour % 12 || 12} ${period}`;
  return { key, label: formatDisplayTime(key) };
});

export function DeliveryWindowModal({
  shippingCompanyId,
  orderId,
  availableFrom,
  availableTo,
  onClose,
}: DeliveryWindowModalProps) {
  const [from, setFrom] = useState(availableFrom ?? '');
  const [to, setTo] = useState(availableTo ?? '');
  const setDeliveryWindow = useSetDeliveryWindow(shippingCompanyId);

  const isPartial = (from === '') !== (to === '');

  const handleConfirm = async () => {
    if (isPartial) return;
    await setDeliveryWindow
      .mutateAsync({
        orderId,
        body: { availableFrom: from || null, availableTo: to || null },
      })
      .then(onClose)
      .catch(() => undefined);
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="وقت التوصيل"
      onConfirm={handleConfirm}
      confirmText="حفظ"
      confirmDisabled={isPartial}
      isLoading={setDeliveryWindow.isPending}
      maxWidth="md:max-w-md"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-[#1F1F1F]">من</span>
            <SearchableSelect
              id="delivery-window-from"
              value={from}
              onChange={setFrom}
              options={HOUR_OPTIONS}
              placeholder="اختر الوقت"
              clearable
              widthClass="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-bold text-[#1F1F1F]">إلى</span>
            <SearchableSelect
              id="delivery-window-to"
              value={to}
              onChange={setTo}
              options={HOUR_OPTIONS}
              placeholder="اختر الوقت"
              clearable
              widthClass="w-full"
            />
          </div>
        </div>

        {isPartial && (
          <p className="text-sm text-red-600">حدد وقت البداية والنهاية معاً، أو امسح الوقت</p>
        )}

        <div className="flex justify-start">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500"
            disabled={from === '' && to === ''}
            onClick={() => {
              setFrom('');
              setTo('');
            }}
          >
            مسح الوقت
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
