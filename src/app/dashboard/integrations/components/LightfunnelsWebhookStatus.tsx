import clsx from 'clsx';
import {
  LIGHTFUNNELS_CONNECTION_STATUS,
  LIGHTFUNNELS_WEBHOOK_ERROR_CODE,
  LIGHTFUNNELS_WEBHOOK_MODE,
  LIGHTFUNNELS_WEBHOOK_STATE,
  type LightfunnelsConnection,
} from '../types/apiIntegration';
import { LIGHTFUNNELS_SWITCHING_TEXT } from './LightfunnelsWebhookModeSelect';

type StatusTone = 'success' | 'info' | 'warning';

interface StatusLine {
  key: string;
  tone: StatusTone;
  text: string;
  topics?: string[];
}

const TONE_CLASS: Record<StatusTone, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

export const LIGHTFUNNELS_LEFTOVER_WEBHOOKS_TEXT =
  'احذفها يدوياً من إعدادات Lightfunnels ← Webhooks';

export function getLightfunnelsWebhookStatusLines(
  connection: LightfunnelsConnection
): StatusLine[] {
  const lines: StatusLine[] = [];
  const isAutomatic = connection.webhookMode === LIGHTFUNNELS_WEBHOOK_MODE.AUTOMATIC;
  const state = connection.webhookState;

  if (state === LIGHTFUNNELS_WEBHOOK_STATE.SWITCHING) {
    lines.push({ key: 'switching', tone: 'info', text: LIGHTFUNNELS_SWITCHING_TEXT });
  }

  if (
    state === LIGHTFUNNELS_WEBHOOK_STATE.NEEDS_REREGISTER ||
    (isAutomatic && connection.status === LIGHTFUNNELS_CONNECTION_STATUS.NEEDS_RECONNECT)
  ) {
    lines.push({
      key: 'reregister',
      tone: 'warning',
      text: 'تم حذف التطبيق أو انتهت صلاحيته في Lightfunnels، أعد الربط لاستئناف التسجيل التلقائي. الطلبات الموقّعة ما زالت تصل إن بقيت الـ Webhooks',
    });
  } else if (isAutomatic && state === LIGHTFUNNELS_WEBHOOK_STATE.ACTIVE) {
    lines.push({
      key: 'active',
      tone: 'success',
      text: 'الـ Webhooks مسجلة تلقائياً',
      topics: connection.registeredTopics,
    });
  }

  if (
    state === LIGHTFUNNELS_WEBHOOK_STATE.FAILED &&
    connection.webhookLastErrorCode !== LIGHTFUNNELS_WEBHOOK_ERROR_CODE.DELETE_FAILED
  ) {
    lines.push({
      key: 'registration-failed',
      tone: 'warning',
      text:
        connection.webhookLastErrorCode === LIGHTFUNNELS_WEBHOOK_ERROR_CODE.ORDERS_SCOPE_MISSING
          ? 'تعذر تسجيل الـ Webhooks تلقائياً لأن تطبيقك لم يمنح صلاحية orders، فعّلها في Lightfunnels ثم اختر «تلقائي» مرة أخرى. الربط يعمل يدوياً'
          : 'تعذر تسجيل الـ Webhooks تلقائياً، الربط يعمل يدوياً',
      topics: isAutomatic ? connection.registeredTopics : undefined,
    });
  }

  if (connection.pendingDeletes > 0) {
    lines.push({
      key: 'pending-deletes',
      tone: 'warning',
      text: 'تعذر حذف بعض الـ Webhooks من Lightfunnels، سنعيد المحاولة',
    });
  }

  if (connection.abandonedDeletes > 0) {
    lines.push({
      key: 'abandoned-deletes',
      tone: 'warning',
      text: `تعذر حذف ${connection.abandonedDeletes} من الـ Webhooks القديمة، ${LIGHTFUNNELS_LEFTOVER_WEBHOOKS_TEXT}`,
    });
  }

  return lines;
}

export default function LightfunnelsWebhookStatus({
  connection,
}: {
  connection: LightfunnelsConnection;
}) {
  const lines = getLightfunnelsWebhookStatusLines(connection);
  if (lines.length === 0) return null;

  return (
    <div className="space-y-2">
      {lines.map((line) => (
        <div
          key={line.key}
          className={clsx('border rounded-lg p-3 text-sm space-y-2', TONE_CLASS[line.tone])}
        >
          <p>{line.text}</p>
          {line.topics && line.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5" dir="ltr">
              {line.topics.map((topic) => (
                <span
                  key={topic}
                  className="font-mono text-xs bg-white/70 border border-current/20 rounded-full px-2 py-0.5"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
