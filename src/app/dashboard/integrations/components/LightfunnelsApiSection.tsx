'use client';

import { useState } from 'react';
import { LiaPlusSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Can } from '@/components/Can';
import { PERMISSION_CODES } from '@/lib/generated/permission-codes';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  LIGHTFUNNELS_CONNECTION_STATUS,
  LIGHTFUNNELS_WEBHOOK_MODE,
  type IntegrationResponse,
  type LightfunnelsConnection,
  type LightfunnelsWebhookMode,
} from '../types/apiIntegration';
import { useLightfunnelsConnections } from '../hooks/useLightfunnelsConnections';
import {
  MODE_SWITCH_FALLBACK_ERROR,
  useLightfunnelsCleanupFlow,
} from '../hooks/useLightfunnelsCleanupFlow';
import LightfunnelsWebhookCleanupDialog from './LightfunnelsWebhookCleanupDialog';
import LightfunnelsConnectForm from './LightfunnelsConnectForm';
import LightfunnelsConnectionBadge from './LightfunnelsConnectionBadge';
import LightfunnelsWebhookModeSelect, {
  LIGHTFUNNELS_SWITCHING_TEXT,
  LIGHTFUNNELS_WEBHOOK_MODE_LABEL,
} from './LightfunnelsWebhookModeSelect';
import LightfunnelsWebhookStatus, {
  isLightfunnelsRegistrationFailed,
  isLightfunnelsReregisterPending,
} from './LightfunnelsWebhookStatus';
import CopyField from './CopyField';

const RECONNECT_REQUIRED_MESSAGE = 'انتهت صلاحية ربط Lightfunnels، أعد الربط';
const CONNECT_BEFORE_MODE_TOOLTIP = 'أكمل ربط Lightfunnels عبر API أولاً';
const SWITCH_TO_MANUAL_WARNING =
  'سيتم حذف الـ Webhooks من Lightfunnels. ألصق الرابط اليدوي في Lightfunnels أولاً حتى لا تفوتك طلبات';

const manualSwitchToast = (connection: LightfunnelsConnection | null) => {
  if ((connection?.pendingDeletes ?? 0) > 0) {
    toast.warning(
      'تم التحويل إلى الاستقبال اليدوي، لكن تعذر حذف بعض الـ Webhooks من Lightfunnels وسنعيد المحاولة'
    );
    return;
  }
  toast.success('تم التحويل إلى الاستقبال اليدوي، تأكد من لصق الرابط في Lightfunnels');
};

interface LightfunnelsApiSectionProps {
  storeId: number;
  apiConfig?: IntegrationResponse;
  apiIsActive: boolean;
  onApiIsActiveChange: (next: boolean) => void;
  manualWebhookUrl?: string;
  disabled?: boolean;
}

export default function LightfunnelsApiSection({
  storeId,
  apiConfig,
  apiIsActive,
  onApiIsActiveChange,
  manualWebhookUrl,
  disabled = false,
}: LightfunnelsApiSectionProps) {
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [confirmManual, setConfirmManual] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { findConnection, isLoading, setWebhookMode, isSettingWebhookMode } =
    useLightfunnelsConnections();
  const connection = findConnection(storeId);
  const cleanupFlow = useLightfunnelsCleanupFlow(storeId);

  const isSwitching =
    isSettingWebhookMode ||
    cleanupFlow.isPending ||
    cleanupFlow.isReviewing ||
    cleanupFlow.isRedirecting ||
    isRedirecting;
  const isConnected = connection?.status === LIGHTFUNNELS_CONNECTION_STATUS.CONNECTED;
  const modeDisabled = disabled || isSwitching || !isConnected;
  const canRetryAutomatic =
    !!connection &&
    ((connection.webhookMode === LIGHTFUNNELS_WEBHOOK_MODE.AUTOMATIC &&
      isLightfunnelsRegistrationFailed(connection)) ||
      isLightfunnelsReregisterPending(connection));
  const modeDisabledTooltip = isSwitching
    ? LIGHTFUNNELS_SWITCHING_TEXT
    : !isConnected
      ? CONNECT_BEFORE_MODE_TOOLTIP
      : undefined;

  const applyMode = async (mode: LightfunnelsWebhookMode) => {
    if (mode === LIGHTFUNNELS_WEBHOOK_MODE.AUTOMATIC) {
      await cleanupFlow.switchToAutomatic();
      return;
    }
    try {
      const response = await setWebhookMode({ storeId, mode });
      setConfirmManual(false);
      if (response.consentRequired) {
        setIsRedirecting(true);
        return;
      }
      manualSwitchToast(response.connection);
    } catch (err) {
      toast.error(getApiErrorMessage(err, MODE_SWITCH_FALLBACK_ERROR));
    }
  };

  const handleModeChange = (mode: LightfunnelsWebhookMode) => {
    if (
      mode === LIGHTFUNNELS_WEBHOOK_MODE.MANUAL &&
      connection?.webhookMode === LIGHTFUNNELS_WEBHOOK_MODE.AUTOMATIC
    ) {
      setConfirmManual(true);
      return;
    }
    applyMode(mode);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-sm text-gray-500">
        جاري تحميل حالة ربط Lightfunnels...
      </div>
    );
  }

  if (!connection && !apiConfig) {
    if (showConnectForm) {
      return (
        <div className="space-y-4 bg-blue-50/50 p-5 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-900 text-sm">ربط Lightfunnels عبر API</h4>
          <LightfunnelsConnectForm
            storeId={storeId}
            submitLabel="ربط Lightfunnels"
            onCancel={() => setShowConnectForm(false)}
            disabled={disabled}
          />
        </div>
      );
    }
    return (
      <Can code={PERMISSION_CODES.INTEGRATION_CONFIG_MANAGE}>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowConnectForm(true)}
          disabled={disabled}
          className="w-full h-10 border-dashed border-gray-300 text-gray-500 hover:text-primary hover:border-primary gap-2"
        >
          <LiaPlusSolid className="w-4 h-4" />
          ربط Lightfunnels عبر API
        </Button>
      </Can>
    );
  }

  const clientId = connection?.clientId ?? apiConfig?.apiKey ?? '';

  return (
    <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900 text-sm">إعدادات API</h4>
          {connection && <LightfunnelsConnectionBadge status={connection.status} />}
        </div>
        {apiConfig && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{apiIsActive ? 'نشط' : 'معطّل'}</span>
            <Switch
              checked={apiIsActive}
              onCheckedChange={onApiIsActiveChange}
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {connection?.status === LIGHTFUNNELS_CONNECTION_STATUS.NEEDS_RECONNECT && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          {RECONNECT_REQUIRED_MESSAGE}
        </div>
      )}

      {connection?.status === LIGHTFUNNELS_CONNECTION_STATUS.PENDING_CONSENT && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          لم تكتمل الموافقة على الصلاحيات في Lightfunnels بعد، اضغط «إعادة الربط» للمتابعة.
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Client ID</span>
        <span className="text-gray-800 font-mono text-xs">{clientId || '—'}</span>
      </div>

      {connection && (
        <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-100">
          <Can
            code={PERMISSION_CODES.INTEGRATION_CONFIG_MANAGE}
            fallback={
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">طريقة استقبال الطلبات</span>
                <span className="text-gray-800">
                  {LIGHTFUNNELS_WEBHOOK_MODE_LABEL[connection.webhookMode]}
                </span>
              </div>
            }
          >
            <LightfunnelsWebhookModeSelect
              value={connection.webhookMode}
              onChange={handleModeChange}
              disabled={modeDisabled || confirmManual}
              disabledTooltip={modeDisabledTooltip}
              showOrdersConsentHint={!connection.ordersConsentGranted}
            />
          </Can>

          {confirmManual && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-3">
              <p className="text-sm text-amber-800">{SWITCH_TO_MANUAL_WARNING}</p>
              {manualWebhookUrl && (
                <CopyField label="رابط الـ Webhook اليدوي" value={manualWebhookUrl} />
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => applyMode(LIGHTFUNNELS_WEBHOOK_MODE.MANUAL)}
                  disabled={disabled || isSwitching}
                  loading={isSettingWebhookMode}
                  className="h-8 text-xs"
                >
                  تأكيد التحويل إلى اليدوي
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmManual(false)}
                  disabled={isSettingWebhookMode}
                  className="h-8 text-xs"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          <LightfunnelsWebhookStatus connection={connection} />

          {canRetryAutomatic && (
            <Can code={PERMISSION_CODES.INTEGRATION_CONFIG_MANAGE}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyMode(LIGHTFUNNELS_WEBHOOK_MODE.AUTOMATIC)}
                disabled={modeDisabled || confirmManual}
                loading={cleanupFlow.isPending}
                className="h-8 text-xs"
              >
                إعادة محاولة التسجيل التلقائي
              </Button>
            </Can>
          )}
        </div>
      )}

      <LightfunnelsWebhookCleanupDialog storeId={storeId} {...cleanupFlow.dialog} />

      {showConnectForm ? (
        <LightfunnelsConnectForm
          storeId={storeId}
          connection={connection}
          submitLabel="إعادة الربط"
          onCancel={() => setShowConnectForm(false)}
          disabled={disabled}
        />
      ) : (
        <Can code={PERMISSION_CODES.INTEGRATION_CONFIG_MANAGE}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowConnectForm(true)}
            disabled={disabled}
            className="h-8 text-xs"
          >
            إعادة الربط
          </Button>
        </Can>
      )}
    </div>
  );
}
