'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import {
  LiaBarcodeSolid,
  LiaCheckCircleSolid,
  LiaTrashAltSolid,
} from 'react-icons/lia';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { OrderStatus } from '@/types/orders';
import { getReturnOrderByCode } from '@/lib/api/returns-receiving';
import {
  UNRECOGNIZED_SCAN_MESSAGE,
  useBarcodeScanner,
  useScannerFeedback,
} from '@/app/dashboard/orders/print-orders/hooks';
import { getCustomerDisplay, type ReturnOrder } from '../../types';
import { getOrderWarning } from '../../../utils/getOrderWarning';
import { ScanCountChip } from './ScanCountChip';

interface MainScanPanelProps {
  scanInputRef: React.RefObject<HTMLInputElement | null>;
  onComplete: () => void;
  expectedCount: number | null;
  setExpectedCount: (count: number | null) => void;
  mainScanCodes: string[];
  addMainScanCode: (code: string) => void;
  removeMainScanCode: (code: string) => void;
  mainPanelLocked: boolean;
  setMainPanelLocked: (locked: boolean) => void;
}

const mainScanSchema = z
  .object({
    barcode: z.string(),
    expectedCount: z
      .number({
        required_error: 'يرجى إدخال العدد المتوقع من شركة الشحن',
        invalid_type_error: 'يرجى إدخال العدد المتوقع من شركة الشحن',
      })
      .int('يجب إدخال عدد صحيح بدون كسور')
      .positive('العدد المتوقع يجب أن يكون أكبر من صفر'),
    scanCount: z
      .number()
      .min(1, 'يجب مسح طلب واحد على الأقل قبل إتمام العملية'),
  })
  .superRefine((data, ctx) => {
    if (data.scanCount !== data.expectedCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scanCount'],
        message: `عدد الطلبات الممسوحة (${data.scanCount}) لا يساوي العدد المتوقع من شركة الشحن (${data.expectedCount})`,
      });
    }
  });

type MainScanFormValues = z.infer<typeof mainScanSchema>;

export function MainScanPanel({
  scanInputRef,
  onComplete,
  expectedCount,
  setExpectedCount,
  mainScanCodes,
  addMainScanCode,
  removeMainScanCode,
  mainPanelLocked,
  setMainPanelLocked,
}: MainScanPanelProps) {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors, isValid, isDirty },
  } = useForm<MainScanFormValues>({
    resolver: zodResolver(mainScanSchema),
    mode: 'onChange',
    defaultValues: {
      barcode: '',
      expectedCount: expectedCount ?? (undefined as unknown as number),
      scanCount: mainScanCodes.length,
    },
  });

  const [orderCache, setOrderCache] = useState<Record<string, ReturnOrder>>({});
  const [flashingCode, setFlashingCode] = useState<string | null>(null);
  const [pendingCodes, setPendingCodes] = useState<string[]>([]);
  const queueRef = useRef<string[]>([]);
  const drainingRef = useRef(false);
  const scannedCodesRef = useRef<string[]>(mainScanCodes);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstScanCountSyncRef = useRef(true);
  const isResolving = pendingCodes.length > 0;

  const { playSuccessSound, playErrorSound } = useScannerFeedback();

  useEffect(() => {
    scannedCodesRef.current = mainScanCodes;
  }, [mainScanCodes]);

  const signalDuplicate = useCallback(
    (code: string) => {
      playErrorSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(200);
      }
      toast.warn(`تم مسح الكود ${code} من قبل`);
      setFlashingCode(code);
      setTimeout(() => setFlashingCode(null), 900);
    },
    [playErrorSound],
  );

  useEffect(() => {
    setValue('scanCount', mainScanCodes.length, {
      shouldValidate: !isFirstScanCountSyncRef.current,
    });
    isFirstScanCountSyncRef.current = false;
  }, [mainScanCodes.length, setValue]);

  const watchedExpectedCount = watch('expectedCount');
  useEffect(() => {
    setExpectedCount(
      typeof watchedExpectedCount === 'number' &&
        Number.isFinite(watchedExpectedCount)
        ? watchedExpectedCount
        : null,
    );
  }, [watchedExpectedCount, setExpectedCount]);

  const resolveCode = useCallback(
    async (code: string) => {
      if (scannedCodesRef.current.includes(code)) {
        signalDuplicate(code);
        return;
      }

      try {
        const order = await getReturnOrderByCode(code);
        const warning = getOrderWarning(order);
        if (warning) {
          playErrorSound();
          toast.error(warning);
        } else if (order.status === OrderStatus.FINAL_RETURN) {
          playErrorSound();
          toast.warn(`تم تحويل الطلب ${code} لمرتجع نهائي مسبقاً`);
          return;
        } else {
          playSuccessSound();
          scannedCodesRef.current = [code, ...scannedCodesRef.current];
          addMainScanCode(code);
          setOrderCache((prev) => ({ ...prev, [code]: order }));
        }
      } catch (err) {
        playErrorSound();
        const anyErr = err as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (anyErr?.response?.status === 404) {
          toast.error(`كود غير معروف: ${code}`);
        } else {
          toast.error(
            anyErr?.response?.data?.message ?? `تعذر إضافة الكود ${code}`,
          );
        }
      }
    },
    [addMainScanCode, playSuccessSound, playErrorSound, signalDuplicate],
  );

  const resolveCodeRef = useRef(resolveCode);
  useEffect(() => {
    resolveCodeRef.current = resolveCode;
  }, [resolveCode]);

  const drainQueue = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    try {
      while (queueRef.current.length > 0) {
        await resolveCodeRef.current(queueRef.current[0]);
        queueRef.current = queueRef.current.slice(1);
        setPendingCodes(queueRef.current);
      }
    } finally {
      drainingRef.current = false;
    }
  }, []);

  const handleScan = useCallback(
    (rawCode: string) => {
      const code = rawCode.trim().toUpperCase();
      if (!code) return;
      if (
        scannedCodesRef.current.includes(code) ||
        queueRef.current.includes(code)
      ) {
        signalDuplicate(code);
        return;
      }
      queueRef.current = [...queueRef.current, code];
      setPendingCodes(queueRef.current);
      void drainQueue();
    },
    [drainQueue, signalDuplicate],
  );

  const handleBarcodeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (mainPanelLocked) return;
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const code = (getValues('barcode') ?? '').trim();
      if (!code) return;
      handleScan(code);
      setValue('barcode', '', { shouldValidate: false });
    },
    [mainPanelLocked, getValues, setValue, handleScan],
  );

  const handleUnrecognizedScan = useCallback(() => {
    playErrorSound();
    toast.error(UNRECOGNIZED_SCAN_MESSAGE);
  }, [playErrorSound]);

  useBarcodeScanner({
    onScan: handleScan,
    onUnrecognized: handleUnrecognizedScan,
    enabled: !mainPanelLocked,
    minCharLength: 1,
    maxCharLength: 1000,
  });

  useEffect(() => {
    const el = inputRef.current;
    if (el && scanInputRef) {
      (scanInputRef as { current: HTMLInputElement | null }).current = el;
    }
  }, [scanInputRef]);

  const scanned = mainScanCodes.length;
  const mismatchMessage =
    expectedCount !== null && scanned > 0 && scanned !== expectedCount
      ? `عدد الطلبات الممسوحة (${scanned}) لا يساوي العدد المتوقع من شركة الشحن (${expectedCount})`
      : undefined;
  const submitBlockedReason = isResolving
    ? 'جاري التحقق من الأكواد الممسوحة...'
    : expectedCount === null
      ? 'أدخل العدد المتوقع من شركة الشحن'
      : scanned === 0
        ? 'يجب مسح طلب واحد على الأقل قبل إتمام العملية'
        : mismatchMessage ?? (isValid ? undefined : errors.expectedCount?.message);

  const onSubmit = () => {
    if (isResolving) return;
    setMainPanelLocked(true);
    onComplete();
  };

  return (
    <AccordionItem
      value="main"
      className={clsx(
        '!border rounded-xl overflow-hidden',
        mainPanelLocked
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-white border-gray-200',
      )}
    >
      <AccordionTrigger className="px-4 sm:px-5 py-3 hover:no-underline">
        {mainPanelLocked ? (
          <div className="flex items-center gap-3 w-full text-start">
            <LiaCheckCircleSolid className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <h3 className="font-bold text-emerald-900 text-base sm:text-lg">
                استلام من الشحن · {scanned} طلب
              </h3>
              <p className="text-xs text-emerald-700">
                تم إتمام الاستلام بنجاح
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 w-full text-start pe-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              1- استلام الطلبات من شركة الشحن
            </h3>
            <span className="text-xs text-gray-500">
              امسح جميع الطلبات التي استلمتها
            </span>
          </div>
        )}
      </AccordionTrigger>
      <AccordionContent className="px-4 sm:px-5 pb-4 sm:pb-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1">
              <Input
                control={control as Control<any>}
                name="barcode"
                ref={inputRef}
                label="كود الطلب"
                required
                icon={LiaBarcodeSolid as unknown as LucideIcon}
                onKeyDown={handleBarcodeKeyDown}
                onBlur={() => {
                  if (isDirty) trigger('scanCount');
                }}
                placeholder="امسح الكود ثم اضغط Enter"
                inputMode="text"
                disabled={mainPanelLocked}
              />
              {isResolving && (
                <p className="text-xs text-gray-500" role="status">
                  جاري التحقق من {pendingCodes.length} كود... يمكنك متابعة المسح
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Controller
                control={control}
                name="expectedCount"
                render={({ field, fieldState }) => (
                  <Input
                    label="عدد شركة الشحن"
                    required
                    type="number"
                    min={0}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(
                        v === '' ? undefined : Math.max(0, Number(v)),
                      );
                    }}
                    onBlur={field.onBlur}
                    placeholder="أدخل العدد المتوقع"
                    error={
                      isDirty
                        ? (fieldState.error?.message ?? mismatchMessage)
                        : undefined
                    }
                  />
                )}
              />
            </div>
          </div>

          <ScanCountChip scanned={scanned} expected={expectedCount} />

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">
                الطلبات الممسوحة ({scanned})
              </span>
              {scanned > 0 && (
                <span className="text-xs text-gray-500">آخر مسح في الأعلى</span>
              )}
            </div>
            {scanned === 0 && pendingCodes.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                لم يتم مسح أي طلب بعد — ابدأ بمسح الأكواد أعلاه
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {pendingCodes.map((code) => (
                  <li
                    key={`pending-${code}`}
                    className="flex items-center justify-between px-4 py-2 bg-gray-50"
                    aria-busy="true"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-mono text-sm font-semibold text-gray-500">
                        {code}
                      </span>
                      <span className="text-xs text-gray-400">جاري التحقق...</span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="size-5 me-2.5 border-2 border-primary border-t-transparent rounded-full animate-spin"
                    />
                  </li>
                ))}
                {mainScanCodes.map((code) => {
                  const order = orderCache[code];
                  const flashing = flashingCode === code;
                  const display = order ? getCustomerDisplay(order) : null;
                  return (
                    <li
                      key={code}
                      className={clsx(
                        'flex items-center justify-between px-4 py-2 transition-colors',
                        flashing ? 'bg-amber-50' : 'bg-white',
                      )}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {code}
                        </span>
                        {order && display && (
                          <span className="text-xs text-gray-500 truncate">
                            {display.name} · {order.governorate}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeMainScanCode(code)}
                        className="size-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        aria-label={`حذف الكود ${code}`}
                      >
                        <LiaTrashAltSolid className="w-4 h-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-2">
            <Button
              type="submit"
              disabled={!isValid || isResolving}
              size="lg"
              className="min-w-[160px]"
              aria-describedby={submitBlockedReason ? 'main-scan-submit-reason' : undefined}
            >
              <LiaCheckCircleSolid className="w-5 h-5" />
              إتمام العملية
            </Button>
            {submitBlockedReason && (
              <p
                id="main-scan-submit-reason"
                className="text-xs text-gray-500 text-center sm:text-end"
              >
                {submitBlockedReason}
              </p>
            )}
          </div>
        </form>
      </AccordionContent>
    </AccordionItem>
  );
}
