import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  LIGHTFUNNELS_CLEANUP_LISTING,
  LIGHTFUNNELS_WEBHOOK_ERROR_CODE,
  LIGHTFUNNELS_WEBHOOK_MODE,
  type LightfunnelsRegistrationFailedError,
  type LightfunnelsWebhookCleanup,
  type SetLightfunnelsWebhookModeResponse,
} from '../types/apiIntegration';
import { useLightfunnelsConnections } from './useLightfunnelsConnections';

export const MODE_SWITCH_FALLBACK_ERROR = 'تعذر تغيير طريقة استقبال الطلبات';
export const LIGHTFUNNELS_CLEANUP_MAX_REPREVIEWS = 3;

const AUTOMATIC_SUCCESS_MESSAGE =
  'تم تسجيل الـ Webhooks في Lightfunnels، وسيتم استقبال الطلبات تلقائياً';
const CLEANUP_CANCELLED_MESSAGE = 'لم يتم التبديل، الاستقبال ما زال يدوياً';
const CLEANUP_UNSTABLE_MESSAGE = 'روابط Lightfunnels تتغير باستمرار، حاول لاحقاً';
const LISTING_UNAVAILABLE_MESSAGE =
  'تم التسجيل التلقائي. تعذر التحقق من الروابط القديمة في Lightfunnels؛ إن كان رابط يدوي ما زال مضافاً فهو يعمل ولن تتكرر الطلبات، ويمكنك حذفه من الإعدادات ← Webhooks';

const cleanupFailedMessage = (count: number) =>
  `تم التسجيل التلقائي، لكن تعذر حذف ${count} من الروابط القديمة. ستظهر حالتها أدناه`;

const cleanupRemovedMessage = (count: number) =>
  `تم حذف ${count} من الروابط القديمة وتسجيل الـ Webhooks تلقائياً`;

const REGISTRATION_FAILED_CODES: ReadonlyArray<string> = [
  LIGHTFUNNELS_WEBHOOK_ERROR_CODE.REGISTRATION_FAILED,
  LIGHTFUNNELS_WEBHOOK_ERROR_CODE.ORDERS_SCOPE_MISSING,
];

const MANUAL_LINKS_KEPT_MESSAGE = 'لم نحذف أي رابط يدوي، فالرابط اليدوي ما زال يعمل.';

export const getRegistrationFailureCleanup = (
  err: unknown
): LightfunnelsWebhookCleanup | null => {
  const data = (err as { response?: { data?: Partial<LightfunnelsRegistrationFailedError> } })
    ?.response?.data;
  if (!data?.code || !REGISTRATION_FAILED_CODES.includes(data.code)) return null;
  return data.cleanup ?? null;
};

const registrationFailureCleanupMessage = (cleanup: LightfunnelsWebhookCleanup) => {
  const parts: string[] = [];
  if (cleanup.removed > 0) {
    parts.push(
      `حذفنا ${cleanup.removed} من التسجيلات التلقائية القديمة لهذا المتجر قبل تعذر التسجيل.`
    );
  }
  const notRemoved = cleanup.failed + cleanup.abandoned;
  if (notRemoved > 0) {
    parts.push(`تعذر حذف ${notRemoved} منها، وستظهر حالتها أدناه.`);
  }
  parts.push(MANUAL_LINKS_KEPT_MESSAGE);
  return parts.join(' ');
};

export const showModeSwitchError = (err: unknown) => {
  toast.error(getApiErrorMessage(err, MODE_SWITCH_FALLBACK_ERROR));
  const cleanup = getRegistrationFailureCleanup(err);
  if (cleanup) toast.info(registrationFailureCleanupMessage(cleanup));
};

export const showAutomaticSwitchToast = (cleanup: LightfunnelsWebhookCleanup | null) => {
  if (cleanup?.listing === LIGHTFUNNELS_CLEANUP_LISTING.UNAVAILABLE) {
    toast.info(LISTING_UNAVAILABLE_MESSAGE);
    return;
  }
  const notRemoved = (cleanup?.failed ?? 0) + (cleanup?.abandoned ?? 0);
  if (notRemoved > 0) {
    toast.warning(cleanupFailedMessage(notRemoved));
    return;
  }
  if ((cleanup?.removed ?? 0) > 0) {
    toast.success(cleanupRemovedMessage(cleanup?.removed ?? 0));
    return;
  }
  toast.success(AUTOMATIC_SUCCESS_MESSAGE);
};

export interface LightfunnelsCleanupDialogState {
  cleanup: LightfunnelsWebhookCleanup | null;
  open: boolean;
  busy: boolean;
  refreshed: boolean;
  onConfirm: (ids: string[]) => Promise<void>;
  onCancel: () => void;
}

export const useLightfunnelsCleanupFlow = (
  storeId: number,
  options?: { onSettled?: () => void }
) => {
  const { setWebhookMode, isSettingWebhookMode } = useLightfunnelsConnections();
  const [cleanup, setCleanup] = useState<LightfunnelsWebhookCleanup | null>(null);
  const [refreshed, setRefreshed] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const repreviewsRef = useRef(0);
  const onSettled = options?.onSettled;

  const close = useCallback(() => {
    setCleanup(null);
    setRefreshed(false);
    repreviewsRef.current = 0;
    onSettled?.();
  }, [onSettled]);

  const switchToAutomatic =
    useCallback(async (): Promise<SetLightfunnelsWebhookModeResponse | null> => {
      try {
        const response = await setWebhookMode({
          storeId,
          mode: LIGHTFUNNELS_WEBHOOK_MODE.AUTOMATIC,
        });
        if (response.consentRequired) {
          setIsRedirecting(true);
          return response;
        }
        if (response.cleanupRequired) {
          if (!response.cleanup) throw new Error(MODE_SWITCH_FALLBACK_ERROR);
          repreviewsRef.current = 0;
          setRefreshed(false);
          setCleanup(response.cleanup);
          return response;
        }
        showAutomaticSwitchToast(response.cleanup);
        onSettled?.();
        return response;
      } catch (err) {
        showModeSwitchError(err);
        onSettled?.();
        return null;
      }
    }, [setWebhookMode, storeId, onSettled]);

  const confirm = useCallback(
    async (ids: string[]) => {
      try {
        const response = await setWebhookMode({
          storeId,
          mode: LIGHTFUNNELS_WEBHOOK_MODE.AUTOMATIC,
          confirmedCleanupIds: ids,
        });
        if (response.consentRequired) {
          setIsRedirecting(true);
          close();
          return;
        }
        if (response.cleanupRequired) {
          if (!response.cleanup) throw new Error(MODE_SWITCH_FALLBACK_ERROR);
          repreviewsRef.current += 1;
          if (repreviewsRef.current >= LIGHTFUNNELS_CLEANUP_MAX_REPREVIEWS) {
            toast.error(CLEANUP_UNSTABLE_MESSAGE);
            close();
            return;
          }
          setRefreshed(true);
          setCleanup(response.cleanup);
          return;
        }
        showAutomaticSwitchToast(response.cleanup);
        close();
      } catch (err) {
        showModeSwitchError(err);
        close();
      }
    },
    [setWebhookMode, storeId, close]
  );

  const cancel = useCallback(() => {
    toast.info(CLEANUP_CANCELLED_MESSAGE);
    close();
  }, [close]);

  const dialog: LightfunnelsCleanupDialogState = {
    cleanup,
    open: cleanup !== null,
    busy: isSettingWebhookMode,
    refreshed,
    onConfirm: confirm,
    onCancel: cancel,
  };

  return {
    switchToAutomatic,
    isPending: isSettingWebhookMode,
    isRedirecting,
    isReviewing: cleanup !== null,
    dialog,
  };
};
