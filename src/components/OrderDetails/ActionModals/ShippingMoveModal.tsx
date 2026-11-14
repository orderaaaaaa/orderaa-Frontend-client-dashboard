'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { OrderStatus } from '@/types/orders';
import { LiaCommentDotsSolid, LiaInfoCircleSolid } from 'react-icons/lia';

interface ShippingMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: OrderStatus[];
  loading: boolean;
  onConfirm: (status: OrderStatus, note?: string) => boolean | Promise<boolean>;
}

export default function ShippingMoveModal({
  isOpen,
  onClose,
  targets,
  loading,
  onConfirm,
}: ShippingMoveModalProps) {
  const { getStatusLabel } = useStatusLabel();
  const [chosen, setChosen] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState('');

  const selected =
    chosen !== null && targets.includes(chosen)
      ? chosen
      : targets.length === 1
        ? targets[0]
        : null;

  const handleConfirm = async () => {
    if (selected === null) return;
    const success = await onConfirm(selected, note.trim() || undefined);
    if (!success) return;
    setChosen(null);
    setNote('');
  };

  const handleClose = () => {
    setChosen(null);
    setNote('');
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="تحديث حالة الشحن"
      onConfirm={handleConfirm}
      confirmText="تأكيد"
      confirmDisabled={selected === null}
      isLoading={loading}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          {targets.map((target) => (
            <label key={target} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="shippingMoveTarget"
                value={target}
                checked={selected === target}
                onChange={() => setChosen(target)}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-foreground font-medium">{getStatusLabel(target)}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <LiaInfoCircleSolid className="w-5 h-5" />
          <p className="text-sm">حركة المخزون تتم كما لو حدّثتها شركة الشحن</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground flex items-center gap-2">
            <LiaCommentDotsSolid className="w-5 h-5" />
            ملاحظة
            <span className="text-gray-400 text-sm font-normal">(اختياري)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
            placeholder="أضف ملاحظة..."
            className="w-full border border-border rounded-lg px-4 py-3 text-base min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </BaseModal>
  );
}
