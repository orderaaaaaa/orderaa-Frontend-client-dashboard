'use client';

import { useState } from 'react';
import { LiaPlusSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Can } from '@/components/Can';
import { PERMISSION_CODES } from '@/lib/generated/permission-codes';
import {
  LIGHTFUNNELS_CONNECTION_STATUS,
  type IntegrationResponse,
} from '../types/apiIntegration';
import { useLightfunnelsConnections } from '../hooks/useLightfunnelsConnections';
import LightfunnelsConnectForm from './LightfunnelsConnectForm';
import LightfunnelsConnectionBadge from './LightfunnelsConnectionBadge';

const RECONNECT_REQUIRED_MESSAGE = 'انتهت صلاحية ربط Lightfunnels، أعد الربط';

interface LightfunnelsApiSectionProps {
  storeId: number;
  apiConfig?: IntegrationResponse;
  apiIsActive: boolean;
  onApiIsActiveChange: (next: boolean) => void;
  disabled?: boolean;
}

export default function LightfunnelsApiSection({
  storeId,
  apiConfig,
  apiIsActive,
  onApiIsActiveChange,
  disabled = false,
}: LightfunnelsApiSectionProps) {
  const [showConnectForm, setShowConnectForm] = useState(false);
  const { findConnection, isLoading } = useLightfunnelsConnections();
  const connection = findConnection(storeId);

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
