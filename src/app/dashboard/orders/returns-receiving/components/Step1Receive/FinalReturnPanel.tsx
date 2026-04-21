'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import {
  LiaBarcodeSolid,
  LiaBanSolid,
  LiaCheckCircleSolid,
  LiaTrashAltSolid,
  LiaLockSolid,
} from 'react-icons/lia';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useFocusedBarcodeScanner } from '../../hooks/useFocusedBarcodeScanner';
import { useCommitFinalReturnsMutation } from '../../hooks/useReturnsMutations';
import { mockResolveScan } from '../../services';
import type { MockReturnOrder } from '../../types';

interface FinalReturnPanelProps {
  enabled: boolean;
  onComplete: () => void;
  mainScanCodes: string[];
  finalReturnCodes: string[];
  addFinalReturnCode: (code: string) => void;
  removeFinalReturnCode: (code: string) => void;
  finalReturnPanelLocked: boolean;
  setFinalReturnPanelLocked: (locked: boolean) => void;
}

export function FinalReturnPanel({
  enabled,
  onComplete,
  mainScanCodes,
  finalReturnCodes,
  addFinalReturnCode,
  removeFinalReturnCode,
  finalReturnPanelLocked,
  setFinalReturnPanelLocked,
}: FinalReturnPanelProps) {
  const [orderCache, setOrderCache] = useState<Record<string, MockReturnOrder>>(
    {},
  );
  const [isResolving, setIsResolving] = useState(false);

  const commitMutation = useCommitFinalReturnsMutation();

  const handleScan = useCallback(
    async (rawCode: string) => {
      const code = rawCode.toUpperCase();

      if (finalReturnCodes.includes(code)) {
        toast.warn(`تم مسح الكود ${code} من قبل في هذا القسم`);
        return;
      }

      if (!mainScanCodes.includes(code)) {
        toast.error(`الكود ${code} غير موجود في الطلبات المستلمة`);
        return;
      }

      setIsResolving(true);
      try {
        const res = await mockResolveScan(code);
        if (!res.ok) {
          toast.error(`تعذر إضافة الكود ${code}`);
          return;
        }
        addFinalReturnCode(code);
        setOrderCache((prev) => ({ ...prev, [code]: res.order }));
      } finally {
        setIsResolving(false);
      }
    },
    [finalReturnCodes, mainScanCodes, addFinalReturnCode],
  );

  const { inputRef, value, onChange, onKeyDown, focus } =
    useFocusedBarcodeScanner({
      onScan: handleScan,
      enabled: enabled && !finalReturnPanelLocked,
    });

  useEffect(() => {
    if (enabled && !finalReturnPanelLocked) {
      focus();
    }
  }, [enabled, finalReturnPanelLocked, focus]);

  const handleCommit = async () => {
    await commitMutation.mutateAsync(finalReturnCodes);
    setFinalReturnPanelLocked(true);
    onComplete();
  };

  return (
    <AccordionItem
      value="final"
      disabled={!enabled}
      className={clsx(
        '!border rounded-xl overflow-hidden',
        !enabled
          ? 'bg-gray-50 border-gray-200'
          : finalReturnPanelLocked
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-white border-gray-200',
      )}
    >
      <AccordionTrigger
        className={clsx(
          'px-4 sm:px-5 py-3 hover:no-underline',
          'disabled:opacity-100 disabled:[&>svg]:hidden',
        )}
      >
        {!enabled ? (
          <div className="flex items-center gap-3 w-full text-start text-gray-400">
            <LiaLockSolid className="w-5 h-5 shrink-0" />
            <div className="flex flex-col">
              <h3 className="font-bold">
                2- مسح المرتجعات النهائية (مفصولة من مندوب الشحن)
              </h3>
              <p className="text-xs">
                يفتح هذا القسم بعد إتمام الاستلام الأساسي
              </p>
            </div>
          </div>
        ) : finalReturnPanelLocked ? (
          <div className="flex items-center gap-3 w-full text-start">
            <LiaCheckCircleSolid className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <h3 className="font-bold text-emerald-900 text-base sm:text-lg">
                مرتجعات نهائية · {finalReturnCodes.length} طلب
              </h3>
              <p className="text-xs text-emerald-700">
                {finalReturnCodes.length > 0
                  ? 'تم تسجيل الحالة بنجاح'
                  : 'لا يوجد مرتجعات نهائية من شركة الشحن'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 w-full text-start pe-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              2- مسح المرتجعات النهائية
            </h3>
            <span className="text-xs text-gray-500">
              الطلبات التي فصلها مندوب الشحن كمرتجع نهائي
            </span>
          </div>
        )}
      </AccordionTrigger>
      <AccordionContent className="px-4 sm:px-5 pb-4 sm:pb-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              label="كود الطلب"
              icon={LiaBarcodeSolid as unknown as LucideIcon}
              value={value}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder="امسح كود المرتجع النهائي ثم اضغط Enter"
              disabled={isResolving}
            />
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2">
              <span className="text-xs font-semibold text-gray-700">
                المرتجعات النهائية ({finalReturnCodes.length})
              </span>
            </div>
            {finalReturnCodes.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                لا يوجد مرتجعات نهائية — يمكنك تخطي هذه الخطوة بالضغط على &quot;تغيير
                الحالة&quot;
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {finalReturnCodes.map((code) => {
                  const order = orderCache[code];
                  return (
                    <li
                      key={code}
                      className="flex items-center justify-between px-4 py-2"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {code}
                        </span>
                        {order && (
                          <span className="text-xs text-gray-500 truncate">
                            {order.customerName} · {order.governorate}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFinalReturnCode(code)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        aria-label="حذف"
                      >
                        <LiaTrashAltSolid className="w-4 h-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleCommit}
              disabled={commitMutation.isPending}
              size="lg"
              className="min-w-[160px] bg-rose-600 hover:bg-rose-700"
            >
              <LiaBanSolid className="w-5 h-5" />
              {commitMutation.isPending ? 'جاري الحفظ...' : 'تغيير الحالة'}
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
