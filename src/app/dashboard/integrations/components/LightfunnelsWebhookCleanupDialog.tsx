'use client';

import BaseModal from '@/components/ui/base-modal';
import {
  LIGHTFUNNELS_CLEANUP_KIND,
  LIGHTFUNNELS_CLEANUP_TOPIC,
  type LightfunnelsCleanupKind,
  type LightfunnelsCleanupTopic,
  type LightfunnelsWebhookCleanup,
} from '../types/apiIntegration';
import { useIntegrations } from '../hooks/useIntegrations';

const DIALOG_TITLE = 'حذف روابط الطلبات القديمة من Lightfunnels';
const CONFIRM_TEXT = 'تأكيد الحذف والتبديل إلى التلقائي';
const CANCEL_TEXT = 'إلغاء';
const DELETED_STORE_LABEL = 'متجر محذوف';
const TRUNCATED_NOTICE = 'عدد روابط Lightfunnels كبير، فعرضنا أول ما وجدناه فقط.';
const REFRESHED_NOTICE = 'ظهرت روابط جديدة منذ آخر عرض، راجعها ثم أكد مرة أخرى.';

const TOPIC_LABEL: Record<LightfunnelsCleanupTopic, string> = {
  [LIGHTFUNNELS_CLEANUP_TOPIC.ORDER_CREATED]: 'طلب جديد',
  [LIGHTFUNNELS_CLEANUP_TOPIC.ORDER_CONFIRMED]: 'طلب مؤكد',
};

const KIND_LABEL: Record<LightfunnelsCleanupKind, string> = {
  [LIGHTFUNNELS_CLEANUP_KIND.MANUAL_LINK]: 'رابط يدوي',
  [LIGHTFUNNELS_CLEANUP_KIND.AUTOMATIC_LEFTOVER]: 'تسجيل تلقائي قديم',
  [LIGHTFUNNELS_CLEANUP_KIND.UNKNOWN]: 'رابط غير معروف',
};

const fallbackStoreName = (storeId: number) => `متجر #${storeId}`;

const siblingWarning = (target: string) =>
  `تنبيه: سيتوقف استقبال الطلبات عبر الرابط اليدوي ${target}، وستصل طلبات هذا الحساب إلى المتاجر المسجلة تلقائياً فقط.`;

interface LightfunnelsWebhookCleanupDialogProps {
  storeId: number;
  cleanup: LightfunnelsWebhookCleanup | null;
  open: boolean;
  busy: boolean;
  refreshed?: boolean;
  onConfirm: (ids: string[]) => void | Promise<void>;
  onCancel: () => void;
}

export default function LightfunnelsWebhookCleanupDialog({
  storeId,
  cleanup,
  open,
  busy,
  refreshed = false,
  onConfirm,
  onCancel,
}: LightfunnelsWebhookCleanupDialogProps) {
  const { integrations } = useIntegrations();
  const webhooks = cleanup?.webhooks ?? [];

  const storeName = (id: number | null) => {
    if (id === null) return DELETED_STORE_LABEL;
    return (
      integrations?.find((config) => config.storeId === id)?.store?.name ??
      fallbackStoreName(id)
    );
  };

  const siblingStoreIds = Array.from(
    new Set(
      webhooks
        .map((webhook) => webhook.storeId)
        .filter((id): id is number => id !== null && id !== storeId)
    )
  );
  const siblingTarget =
    siblingStoreIds.length === 1
      ? `للمتجر «${storeName(siblingStoreIds[0])}»`
      : 'لعدة متاجر';

  return (
    <BaseModal
      isOpen={open}
      onClose={onCancel}
      title={DIALOG_TITLE}
      onConfirm={() => onConfirm(webhooks.map((webhook) => webhook.id))}
      confirmText={CONFIRM_TEXT}
      confirmButtonClassName="min-h-[33px] sm:min-h-[37px] px-4 bg-red-600 border-[1.5px] border-red-600 rounded-[28px] flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-red-700 transition-colors text-white hover:text-white disabled:opacity-50"
      cancelText={CANCEL_TEXT}
      isLoading={busy}
      confirmDisabled={webhooks.length === 0}
      maxWidth="md:max-w-2xl"
    >
      <div className="space-y-4 text-sm text-start">
        {refreshed && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800">
            {REFRESHED_NOTICE}
          </div>
        )}

        <p className="text-gray-700 leading-relaxed">
          سنحذف روابط الـ Webhook التالية الخاصة بنطاقنا (
          <span dir="ltr" className="font-mono">
            {cleanup?.domain}
          </span>
          ) لأحداث الطلبات الجديدة والمؤكدة من حسابك في Lightfunnels، حتى تبقى فقط الروابط التي
          نسجّلها تلقائياً. الطلبات لا تتكرر في كل الأحوال.
        </p>

        {siblingStoreIds.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
            {siblingWarning(siblingTarget)}
          </div>
        )}

        {cleanup?.truncated && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-700">
            {TRUNCATED_NOTICE}
          </div>
        )}

        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
          {webhooks.map((webhook) => (
            <li key={webhook.id} className="p-3 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-gray-900">{storeName(webhook.storeId)}</span>
                <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                  {TOPIC_LABEL[webhook.topic] ?? webhook.topic}
                </span>
                <span className="text-xs bg-amber-50 text-amber-800 rounded-full px-2 py-0.5">
                  {KIND_LABEL[webhook.kind] ?? webhook.kind}
                </span>
              </div>
              <p dir="ltr" className="font-mono text-xs text-gray-500 break-all text-left">
                {webhook.url}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </BaseModal>
  );
}
