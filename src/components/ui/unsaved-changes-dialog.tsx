'use client';

import BaseModal from '@/components/ui/base-modal';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export function UnsavedChangesDialog({
  isOpen,
  onStay,
  onLeave,
}: UnsavedChangesDialogProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onStay}
      title="لديك تغييرات غير محفوظة"
      onConfirm={onLeave}
      confirmText="مغادرة"
      cancelText="البقاء"
      maxWidth="md:max-w-md"
    >
      <p className="text-sm text-gray-700">
        إذا غادرت الصفحة الآن ستفقد التغييرات التي لم تحفظها.
      </p>
    </BaseModal>
  );
}
