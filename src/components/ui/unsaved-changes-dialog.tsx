'use client';

import BaseModal from '@/components/ui/base-modal';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
  message?: string;
  leaveText?: string;
  stayText?: string;
}

export function UnsavedChangesDialog({
  isOpen,
  onStay,
  onLeave,
  message = 'إذا غادرت الصفحة الآن ستفقد التغييرات التي لم تحفظها.',
  leaveText = 'مغادرة',
  stayText = 'البقاء',
}: UnsavedChangesDialogProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onStay}
      title="لديك تغييرات غير محفوظة"
      onConfirm={onLeave}
      confirmText={leaveText}
      cancelText={stayText}
      maxWidth="md:max-w-md"
    >
      <p className="text-sm text-gray-700">{message}</p>
    </BaseModal>
  );
}
