import {
  LIGHTFUNNELS_SHARED_APP_REASON,
  LIGHTFUNNELS_WEBHOOK_ERROR_CODE,
  type LightfunnelsSharedAppError,
} from '../types/apiIntegration';

export function getLightfunnelsSharedAppError(
  err: unknown
): LightfunnelsSharedAppError | null {
  const data = (err as { response?: { data?: Partial<LightfunnelsSharedAppError> } })
    ?.response?.data;
  if (data?.code !== LIGHTFUNNELS_WEBHOOK_ERROR_CODE.AUTOMATIC_SHARED_APP) return null;
  return {
    statusCode: data.statusCode ?? 409,
    message: data.message ?? '',
    code: data.code,
    reason: data.reason ?? LIGHTFUNNELS_SHARED_APP_REASON.PEER_AUTOMATIC,
    peerStoreId: typeof data.peerStoreId === 'number' ? data.peerStoreId : null,
  };
}
