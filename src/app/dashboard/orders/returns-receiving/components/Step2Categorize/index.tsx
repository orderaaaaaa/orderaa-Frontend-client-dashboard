'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import {
  LiaBarcodeSolid,
  LiaBoxSolid,
  LiaLayerGroupSolid,
  LiaTimesCircleSolid,
  LiaTimesSolid,
  LiaUndoAltSolid,
} from 'react-icons/lia';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@/types/orders';
import { useFocusedBarcodeScanner } from '../../hooks/useFocusedBarcodeScanner';
import { getReturnOrderByCode } from '../../services';
import {
  getCustomerDisplay,
  type CategoryBucket,
  type ReturnOrder,
} from '../../types';
import { BucketSection } from './BucketSection';
import { CategoryButtons } from './CategoryButtons';
import { ResendInvoicesPrint } from './ResendInvoicesPrint';
import { TotalsChips } from './TotalsChips';

interface Step2CategorizeProps {
  categorizationScans: string[];
  setCategorizationScans: React.Dispatch<React.SetStateAction<string[]>>;
  orderCache: Record<string, ReturnOrder>;
  setOrderCache: React.Dispatch<
    React.SetStateAction<Record<string, ReturnOrder>>
  >;
  categorizedOrders: Record<string, CategoryBucket>;
  setCategorizedOrders: React.Dispatch<
    React.SetStateAction<Record<string, CategoryBucket>>
  >;
}

const normalize = (code: string) => code.trim().toUpperCase();

export function Step2Categorize({
  categorizationScans,
  setCategorizationScans,
  orderCache,
  setOrderCache,
  categorizedOrders,
  setCategorizedOrders,
}: Step2CategorizeProps) {
  const [flashingCode, setFlashingCode] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const handleScan = useCallback(
    async (rawCode: string) => {
      const code = normalize(rawCode);

      if (categorizationScans.includes(code)) {
        toast.warn(`تم مسح الكود ${code} من قبل`);
        setFlashingCode(code);
        setTimeout(() => setFlashingCode(null), 900);
        return;
      }

      setIsResolving(true);
      try {
        const order = await getReturnOrderByCode(code);
        if (order.status === OrderStatus.FINAL_RETURN) {
          toast.warn(`الطلب ${code} مُرتجع نهائي بالفعل`);
          return;
        }
        setCategorizationScans((prev) =>
          prev.includes(code) ? prev : [code, ...prev],
        );
        setOrderCache((prev) => ({ ...prev, [code]: order }));
      } catch (err) {
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
      } finally {
        setIsResolving(false);
      }
    },
    [categorizationScans, setCategorizationScans, setOrderCache],
  );

  const { inputRef, value, onChange, onKeyDown, focus } =
    useFocusedBarcodeScanner({
      onScan: handleScan,
      enabled: !isResolving,
    });

  useEffect(() => {
    focus();
  }, [focus]);

  const assignBucket = useCallback(
    (code: string, bucket: CategoryBucket) => {
      setCategorizedOrders((prev) => ({ ...prev, [code]: bucket }));
    },
    [setCategorizedOrders],
  );

  const unassign = useCallback(
    (code: string) => {
      setCategorizedOrders((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
    },
    [setCategorizedOrders],
  );

  const removeScan = useCallback(
    (code: string) => {
      setCategorizationScans((prev) => prev.filter((c) => c !== code));
      setCategorizedOrders((prev) => {
        if (!(code in prev)) return prev;
        const next = { ...prev };
        delete next[code];
        return next;
      });
    },
    [setCategorizationScans, setCategorizedOrders],
  );

  const { awaitingCodes, resendCodes, finalReturnCodes, warehouseCodes } =
    useMemo(() => {
      const awaiting: string[] = [];
      const resend: string[] = [];
      const finalReturn: string[] = [];
      const warehouse: string[] = [];
      for (const code of categorizationScans) {
        const bucket = categorizedOrders[code];
        if (!bucket) awaiting.push(code);
        else if (bucket === 'RESEND') resend.push(code);
        else if (bucket === 'FINAL_RETURN') finalReturn.push(code);
        else if (bucket === 'WAREHOUSE') warehouse.push(code);
      }
      return {
        awaitingCodes: awaiting,
        resendCodes: resend,
        finalReturnCodes: finalReturn,
        warehouseCodes: warehouse,
      };
    }, [categorizationScans, categorizedOrders]);

  const counts: Record<CategoryBucket, number> = {
    RESEND: resendCodes.length,
    FINAL_RETURN: finalReturnCodes.length,
    WAREHOUSE: warehouseCodes.length,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              تقسيم الطلبات على التصنيفات
            </h3>
            <p className="text-xs text-gray-500">
              امسح الطلب ثم اختر تصنيفه من الأزرار أسفل كل صف
            </p>
          </div>
          <TotalsChips counts={counts} />
        </div>

        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          label="كود الطلب"
          required
          icon={LiaBarcodeSolid as unknown as LucideIcon}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoFocus
          placeholder="امسح الكود ثم اضغط Enter"
          disabled={isResolving}
        />

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <LiaLayerGroupSolid className="w-4 h-4" />
              بانتظار التصنيف ({awaitingCodes.length})
            </span>
          </div>
          {awaitingCodes.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">
              {categorizationScans.length === 0
                ? 'ابدأ بمسح الأكواد لعرضها هنا'
                : 'تم تصنيف جميع الطلبات الممسوحة'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[24rem] overflow-y-auto">
              {awaitingCodes.map((code) => {
                const order = orderCache[code];
                const flashing = flashingCode === code;
                const display = order ? getCustomerDisplay(order) : null;
                return (
                  <li
                    key={code}
                    className={clsx(
                      'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 transition-colors',
                      flashing ? 'bg-amber-50' : 'bg-white',
                    )}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeScan(code)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        aria-label="حذف الطلب من القائمة"
                      >
                        <LiaTimesSolid className="w-4 h-4" />
                      </Button>
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
                    </div>
                    <CategoryButtons
                      onChange={(bucket) => assignBucket(code, bucket)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <BucketSection
          title="إعادة إرسال"
          icon={LiaUndoAltSolid}
          accentClasses="border-amber-200 bg-amber-50/40"
          countBadgeClasses="bg-amber-200 text-amber-900"
          codes={resendCodes}
          orderCache={orderCache}
          onRemove={unassign}
          emptyMessage="لا يوجد طلبات في هذا التصنيف"
        >
          <ResendInvoicesPrint
            resendCodes={resendCodes}
            orderCache={orderCache}
          />
        </BucketSection>

        <BucketSection
          title="مرتجع نهائي"
          icon={LiaTimesCircleSolid}
          accentClasses="border-rose-200 bg-rose-50/40"
          countBadgeClasses="bg-rose-200 text-rose-900"
          codes={finalReturnCodes}
          orderCache={orderCache}
          onRemove={unassign}
          emptyMessage="لا يوجد طلبات في هذا التصنيف"
        />

        <BucketSection
          title="مخزن المرتجعات"
          icon={LiaBoxSolid}
          accentClasses="border-indigo-200 bg-indigo-50/40"
          countBadgeClasses="bg-indigo-200 text-indigo-900"
          codes={warehouseCodes}
          orderCache={orderCache}
          onRemove={unassign}
          emptyMessage="لا يوجد طلبات في هذا التصنيف"
        />
      </div>
    </div>
  );
}
