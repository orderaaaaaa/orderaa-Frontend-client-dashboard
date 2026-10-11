'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  LIGHTFUNNELS_CONNECT_QUERY_KEY,
  LIGHTFUNNELS_CONNECT_RESULT,
  type IntegrationResponse,
  type LightfunnelsConnectResult,
} from '../types/apiIntegration';
import { useInvalidateLightfunnelsState } from '../hooks/useLightfunnelsConnections';

type ToastKind = 'success' | 'info' | 'warning' | 'error';

export const LIGHTFUNNELS_CONNECT_RESULT_MESSAGE: Record<
  LightfunnelsConnectResult,
  { kind: ToastKind; message: string }
> = {
  CONNECTED: {
    kind: 'success',
    message: 'تم ربط Lightfunnels بنجاح، وستبدأ مزامنة المنتجات خلال دقائق',
  },
  DENIED: {
    kind: 'info',
    message: 'تم إلغاء الموافقة في Lightfunnels، ولم يتغير شيء في الربط',
  },
  STATE_INVALID: {
    kind: 'error',
    message: 'رابط الربط غير صالح أو استُخدم من قبل، ابدأ الربط من جديد',
  },
  STATE_EXPIRED: {
    kind: 'error',
    message: 'انتهت مهلة الربط، ابدأ الربط من جديد وأكمل الموافقة في Lightfunnels خلال 10 دقائق',
  },
  EXCHANGE_FAILED: {
    kind: 'error',
    message:
      'تعذر إتمام الربط مع Lightfunnels، تأكد من Client ID وClient Secret ورابط إعادة التوجيه ثم أعد المحاولة',
  },
  SCOPE_MISSING: {
    kind: 'error',
    message: 'صلاحية products غير مفعّلة في تطبيق Lightfunnels، فعّلها ثم أعد الربط',
  },
  FAILED: {
    kind: 'error',
    message: 'حدث خطأ أثناء ربط Lightfunnels، أعد المحاولة',
  },
  WEBHOOK_REGISTRATION_FAILED: {
    kind: 'warning',
    message: 'تم الربط، لكن تعذر تسجيل الـ Webhooks تلقائياً. الربط يعمل يدوياً',
  },
  WEBHOOK_SWITCH_IN_PROGRESS: {
    kind: 'info',
    message: 'تم الربط، وعملية تبديل أخرى جارية',
  },
  WEBHOOK_SHARED_APP: {
    kind: 'warning',
    message: 'تم الربط، لكن نفس التطبيق مستخدم تلقائياً في متجر آخر',
  },
};

const isConnectResult = (value: string): value is LightfunnelsConnectResult =>
  Object.prototype.hasOwnProperty.call(LIGHTFUNNELS_CONNECT_RESULT_MESSAGE, value);

const showToast = (kind: ToastKind, message: string) => {
  if (kind === 'success') toast.success(message);
  else if (kind === 'info') toast.info(message);
  else if (kind === 'warning') toast.warning(message);
  else toast.error(message);
};

interface LightfunnelsConnectResultNotifierProps {
  integrations?: IntegrationResponse[];
  isLoading: boolean;
}

export default function LightfunnelsConnectResultNotifier({
  integrations,
  isLoading,
}: LightfunnelsConnectResultNotifierProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const invalidate = useInvalidateLightfunnelsState();
  const handledRef = useRef<string | null>(null);

  const rawResult = searchParams.get(LIGHTFUNNELS_CONNECT_QUERY_KEY.RESULT);
  const rawStoreId = searchParams.get(LIGHTFUNNELS_CONNECT_QUERY_KEY.STORE);

  useEffect(() => {
    if (rawResult === null || isLoading) return;
    const handledKey = `${rawResult}:${rawStoreId ?? ''}`;
    if (handledRef.current === handledKey) return;
    handledRef.current = handledKey;

    const result = isConnectResult(rawResult)
      ? rawResult
      : LIGHTFUNNELS_CONNECT_RESULT.FAILED;
    const { kind, message } = LIGHTFUNNELS_CONNECT_RESULT_MESSAGE[result];
    const storeId = rawStoreId !== null ? Number(rawStoreId) : NaN;
    const storeName = Number.isInteger(storeId)
      ? integrations?.find((config) => config.storeId === storeId)?.store?.name
      : undefined;

    showToast(kind, storeName ? `${storeName}: ${message}` : message);
    invalidate();
    router.replace(pathname);
  }, [rawResult, rawStoreId, isLoading, integrations, invalidate, router, pathname]);

  return null;
}
