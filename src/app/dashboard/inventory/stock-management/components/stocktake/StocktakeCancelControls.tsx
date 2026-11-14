'use client';

import { Ban } from 'lucide-react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';

interface StocktakeCancelButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function StocktakeCancelButton({ onClick, disabled }: StocktakeCancelButtonProps) {
  return (
    <Button variant="outline" onClick={onClick} disabled={disabled}>
      <Ban className="size-4" aria-hidden="true" />
      إلغاء الجلسة
    </Button>
  );
}

interface StocktakeCancelModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function StocktakeCancelModal({ onClose, onConfirm, isPending }: StocktakeCancelModalProps) {
  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="إلغاء جلسة الجرد"
      onConfirm={onConfirm}
      confirmText="إلغاء الجلسة"
      isLoading={isPending}
      maxWidth="md:max-w-[440px]"
    >
      <p className="text-sm text-muted-foreground">
        سيتم إلغاء هذه الجلسة دون أي تعديل على المخزون. لا يمكن التراجع عن الإلغاء.
      </p>
    </BaseModal>
  );
}
