'use client';

import ToggleGroup from '@/components/ui/toggle-group';
import {
  LIGHTFUNNELS_WEBHOOK_MODE,
  type LightfunnelsWebhookMode,
} from '../types/apiIntegration';

export const LIGHTFUNNELS_WEBHOOK_MODE_LABEL: Record<LightfunnelsWebhookMode, string> = {
  MANUAL: 'يدوي',
  AUTOMATIC: 'تلقائي',
};

const MODE_HELPER_TEXT: Record<LightfunnelsWebhookMode, string> = {
  MANUAL: 'ألصق الرابط في إعدادات Lightfunnels',
  AUTOMATIC: 'نسجّل الـ Webhook عبر تطبيقك تلقائياً',
};

export const LIGHTFUNNELS_SWITCHING_TEXT = 'جاري التبديل...';

const AUTOMATIC_UNSUPPORTED_WARNING =
  'تنبيه: Lightfunnels لا يدعم حالياً تسجيل الـ Webhook تلقائياً، لذا استخدم الطريقة اليدوية.';

const ORDERS_CONSENT_HINT =
  'سيطلب منك Lightfunnels الموافقة على صلاحية orders مرة واحدة قبل التسجيل التلقائي';

const MODE_OPTIONS = [
  { value: LIGHTFUNNELS_WEBHOOK_MODE.MANUAL, label: LIGHTFUNNELS_WEBHOOK_MODE_LABEL.MANUAL },
  { value: LIGHTFUNNELS_WEBHOOK_MODE.AUTOMATIC, label: LIGHTFUNNELS_WEBHOOK_MODE_LABEL.AUTOMATIC },
];

interface LightfunnelsWebhookModeSelectProps {
  value: LightfunnelsWebhookMode;
  onChange: (mode: LightfunnelsWebhookMode) => void;
  disabled?: boolean;
  disabledTooltip?: string;
  showOrdersConsentHint?: boolean;
  label?: string;
}

export default function LightfunnelsWebhookModeSelect({
  value,
  onChange,
  disabled = false,
  disabledTooltip,
  showOrdersConsentHint = false,
  label = 'طريقة استقبال الطلبات',
}: LightfunnelsWebhookModeSelectProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="block font-medium text-sm">{label}</span>
        <ToggleGroup<LightfunnelsWebhookMode>
          options={MODE_OPTIONS}
          value={value}
          onChange={(next) => {
            if (next !== value) onChange(next);
          }}
          disabled={disabled}
          disabledTooltip={disabledTooltip}
        />
      </div>
      <p className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        {AUTOMATIC_UNSUPPORTED_WARNING}
      </p>
      <p className="text-xs text-gray-500">{MODE_HELPER_TEXT[value]}</p>
      {showOrdersConsentHint && value === LIGHTFUNNELS_WEBHOOK_MODE.AUTOMATIC && (
        <p className="text-xs text-gray-500">{ORDERS_CONSENT_HINT}</p>
      )}
    </div>
  );
}
