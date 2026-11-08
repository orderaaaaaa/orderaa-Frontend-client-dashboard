'use client';

import { toast } from 'react-toastify';
import SimpleConfirmationModal from '../SimpleConfirmationModal';
import { useI18n } from '@/i18n/I18nProvider';
import { useUndoPartialDelivery, useUndoPartialDeliveryPreview } from '@/services/logistics';
import type { PartialUndoPreview } from '@/types/logistics';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatNumber } from '@/utils/format';
import { carrierSendNeedsAttention, carrierSendNotSentWarningAfter } from '@/utils/manualOrder/carrierSend';

type Translate = ReturnType<typeof useI18n>['t'];

interface UndoPartialDeliveryDialogProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
}

const undoMessageOf = (preview: PartialUndoPreview, t: Translate): string => {
  const money = {
    code: preview.childCode,
    before: formatNumber(preview.totalBefore),
    after: formatNumber(preview.totalAfter),
  };
  const lines = [
    preview.path === 'DELIVERED'
      ? t('partialDelivery.undo.bodyDelivered', money)
      : t('partialDelivery.undo.bodyInTransit', money),
  ];
  if (preview.path === 'IN_TRANSIT') {
    lines.push(t(preview.sendsCarrierEdit ? 'partialDelivery.undo.carrier' : 'partialDelivery.undo.noCarrier'));
  }
  if (preview.totalBeforeSplit !== null && preview.totalAfter > preview.totalBeforeSplit) {
    lines.push(
      t('partialDelivery.undo.overTotal', {
        after: formatNumber(preview.totalAfter),
        beforeSplit: formatNumber(preview.totalBeforeSplit),
      }),
    );
  }
  return lines.join(' ');
};

export default function UndoPartialDeliveryDialog({ orderId, isOpen, onClose }: UndoPartialDeliveryDialogProps) {
  const { t } = useI18n();
  const preview = useUndoPartialDeliveryPreview(orderId, isOpen);
  const undo = useUndoPartialDelivery();
  const title = t('partialDelivery.undo.title');

  const handleConfirm = async () => {
    const result = await undo.mutateAsync(orderId);
    if (carrierSendNeedsAttention(result.carrierSend) || (result.carrierEditDue && result.carrierSend === null)) {
      toast.warning(carrierSendNotSentWarningAfter('تم التراجع عن التسليم الجزئي'));
      return;
    }
    toast.success(t('partialDelivery.undo.done'));
  };

  if (preview.data === undefined) {
    return (
      <SimpleConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        message={
          preview.isError
            ? getApiErrorMessage(preview.error, 'تعذر التراجع عن التسليم الجزئي')
            : t('common.loading')
        }
        cancelText={t('common.close')}
      />
    );
  }

  return (
    <SimpleConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={title}
      message={undoMessageOf(preview.data, t)}
      confirmText={t('partialDelivery.undo.confirm')}
    />
  );
}
