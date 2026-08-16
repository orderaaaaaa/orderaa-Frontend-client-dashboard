'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { useCreateShippingProvider } from '@/services/shippingProviders';
import type { ShippingProviderType } from '@/types/shippingProviders';

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPES: { value: ShippingProviderType; label: string }[] = [
  { value: 'DELEGATE', label: 'مندوب' },
  { value: 'COMPANY', label: 'شركة شحن' },
];

export function AddProviderModal({ isOpen, onClose }: AddProviderModalProps) {
  const [type, setType] = useState<ShippingProviderType>('DELEGATE');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { mutate: create, isPending } = useCreateShippingProvider();

  const reset = () => {
    setType('DELEGATE');
    setName('');
    setPhone('');
  };

  const submit = () => {
    if (!name.trim()) return;
    create(
      { type, name: name.trim(), phone: phone.trim() || undefined },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="إضافة جهة شحن"
      showFooter={false}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-gray-700">النوع</span>
          <div className="flex gap-2">
            {TYPES.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={type === option.value ? 'default' : 'outline'}
                size="sm"
                className="rounded-full px-5"
                onClick={() => setType(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <Input
          label="الاسم"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: مندوب المعادي"
        />

        <Input
          label="رقم الهاتف"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01xxxxxxxxx"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            className="rounded-full px-6"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            إلغاء
          </Button>
          <Button
            variant="default"
            className="rounded-full px-6"
            disabled={isPending || !name.trim()}
            onClick={submit}
          >
            {isPending ? 'جاري الحفظ...' : 'إضافة'}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
