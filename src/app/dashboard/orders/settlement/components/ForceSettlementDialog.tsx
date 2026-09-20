'use client';

import BaseModal from '@/components/ui/base-modal';
import { useStatusLabel } from '@/hooks/useStatusLabel';

interface ForceSettlementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  reason: string;
  hopPath: string[] | null;
  moveFromBatchCode?: string | null;
}

export default function ForceSettlementDialog({
  isOpen,
  onClose,
  onConfirm,
  reason,
  hopPath,
  moveFromBatchCode,
}: ForceSettlementDialogProps) {
  const { getStatusLabel } = useStatusLabel();

  const hopLabels = (hopPath ?? []).map((status) => getStatusLabel(status)).join(' ← ');

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="إضافة الطلب رغم الخطأ"
      confirmText="تأكيد"
      maxWidth="md:max-w-lg"
    >
      <div className="space-y-3 text-sm">
        <p className="text-red-700 font-medium">{reason}</p>

        {hopLabels && <p className="text-muted-foreground">{hopLabels}</p>}

        <p className="text-amber-700">
          سيتم تغيير حالة الطلب مباشرة دون إرسال لشركة الشحن ودون تحديث التغليف
        </p>

        {moveFromBatchCode && (
          <p className="text-amber-700">
            سيتم نقل الطلب من التحصيل {moveFromBatchCode} إلى التحصيل الحالي
          </p>
        )}
      </div>
    </BaseModal>
  );
}
