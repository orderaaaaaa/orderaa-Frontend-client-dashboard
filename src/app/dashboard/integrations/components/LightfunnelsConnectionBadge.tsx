import clsx from 'clsx';
import {
  LIGHTFUNNELS_CONNECTION_STATUS,
  type LightfunnelsConnectionStatus,
} from '../types/apiIntegration';

export const LIGHTFUNNELS_CONNECTION_STATUS_LABEL: Record<
  LightfunnelsConnectionStatus,
  string
> = {
  PENDING_CONSENT: 'بانتظار الموافقة',
  CONNECTED: 'متصل',
  NEEDS_RECONNECT: 'يحتاج إعادة ربط',
};

const STATUS_CLASS: Record<LightfunnelsConnectionStatus, string> = {
  PENDING_CONSENT: 'bg-gray-100 text-gray-600',
  CONNECTED: 'bg-green-100 text-green-700',
  NEEDS_RECONNECT: 'bg-amber-100 text-amber-800',
};

export default function LightfunnelsConnectionBadge({
  status,
}: {
  status: LightfunnelsConnectionStatus;
}) {
  return (
    <span
      className={clsx(
        'text-xs font-medium px-2 py-0.5 rounded-full',
        STATUS_CLASS[status] ?? STATUS_CLASS[LIGHTFUNNELS_CONNECTION_STATUS.PENDING_CONSENT]
      )}
    >
      {LIGHTFUNNELS_CONNECTION_STATUS_LABEL[status] ?? status}
    </span>
  );
}
