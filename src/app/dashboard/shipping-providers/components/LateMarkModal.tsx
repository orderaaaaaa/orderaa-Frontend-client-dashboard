'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import type { LateMarkKind, LatenessInfo } from '@/types/shippingProviders';
import { useSetLateMark } from '@/services/shippingProviders';

interface LateMarkModalProps {
  shippingCompanyId: number;
  orderId: number;
  lateness: LatenessInfo | null;
  onClose: () => void;
}

const LATE_MARK_OPTIONS: { kind: LateMarkKind; label: string }[] = [
  { kind: 'LATE', label: 'متأخر' },
  { kind: 'ON_TIME', label: 'في الموعد' },
  { kind: 'AUTO', label: 'تلقائي حسب الموعد' },
];

export function LateMarkModal({ shippingCompanyId, orderId, lateness, onClose }: LateMarkModalProps) {
  const [kind, setKind] = useState<LateMarkKind>(lateness?.override ?? 'AUTO');
  const [note, setNote] = useState('');
  const setLateMark = useSetLateMark(shippingCompanyId);

  const handleConfirm = async () => {
    const trimmedNote = note.trim();
    await setLateMark
      .mutateAsync({
        orderId,
        body: trimmedNote ? { kind, note: trimmedNote } : { kind },
      })
      .then(onClose)
      .catch(() => undefined);
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="حالة التأخير"
      onConfirm={handleConfirm}
      confirmText="حفظ"
      isLoading={setLateMark.isPending}
      maxWidth="md:max-w-md"
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-foreground">الحالة</span>
          <div className="flex flex-wrap gap-2">
            {LATE_MARK_OPTIONS.map((option) => (
              <Button
                key={option.kind}
                type="button"
                size="sm"
                variant={kind === option.kind ? 'default' : 'outline'}
                aria-pressed={kind === option.kind}
                className="rounded-full text-xs"
                onClick={() => setKind(option.kind)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <Input
          type="text"
          label="ملاحظة (اختياري)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="أضف ملاحظة..."
          maxLength={255}
          disabled={setLateMark.isPending}
        />
      </div>
    </BaseModal>
  );
}
