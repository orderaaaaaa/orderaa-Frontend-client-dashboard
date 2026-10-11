import {
  LIGHTFUNNELS_WEBHOOK_MODE,
  type LightfunnelsConnection,
} from '../types/apiIntegration';
import { LIGHTFUNNELS_LEFTOVER_WEBHOOKS_TEXT } from './LightfunnelsWebhookStatus';

export const needsLightfunnelsDeleteWarning = (
  connection: LightfunnelsConnection | undefined
): connection is LightfunnelsConnection =>
  !!connection &&
  (connection.webhookMode === LIGHTFUNNELS_WEBHOOK_MODE.AUTOMATIC ||
    connection.pendingDeletes > 0 ||
    connection.abandonedDeletes > 0);

export default function LightfunnelsDeleteWarning({
  connection,
}: {
  connection: LightfunnelsConnection;
}) {
  const isAutomatic = connection.webhookMode === LIGHTFUNNELS_WEBHOOK_MODE.AUTOMATIC;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2 text-sm text-amber-800 text-start">
      {isAutomatic && (
        <p>سيتم إيقاف الاستقبال التلقائي وحذف الـ Webhooks من Lightfunnels.</p>
      )}
      <p>
        أي Webhook لا يُحذف خلال 20 ثانية أو تعذر حذفه سابقاً سيبقى في Lightfunnels،{' '}
        {LIGHTFUNNELS_LEFTOVER_WEBHOOKS_TEXT}.
      </p>
    </div>
  );
}
