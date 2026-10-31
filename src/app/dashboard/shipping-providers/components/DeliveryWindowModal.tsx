'use client';

import { useState } from 'react';
import { Eraser } from 'lucide-react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
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
  return { key, label: `${hour % 12 || 12}:00 ${hour < 12 ? 'ص' : 'م'}` };
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
            <span className="font-bold text-foreground">من</span>
            <SearchableSelect
              id="delivery-window-from"
              aria-label="من"
              value={from}
              onChange={setFrom}
              options={HOUR_OPTIONS}
              placeholder="اختر الوقت"
              clearable
              widthClass="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-bold text-foreground">إلى</span>
            <SearchableSelect
              id="delivery-window-to"
              aria-label="إلى"
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
          <p className="text-sm text-destructive">حدد وقت البداية والنهاية معاً، أو امسح الوقت</p>
        )}

        <div className="flex justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-sm font-medium text-foreground hover:text-foreground max-sm:h-10"
            disabled={from === '' && to === ''}
            onClick={() => {
              setFrom('');
              setTo('');
            }}
          >
            <Eraser aria-hidden="true" />
            مسح الوقت
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
