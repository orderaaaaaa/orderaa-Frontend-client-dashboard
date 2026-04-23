'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import keyBy from 'lodash/keyBy';
import {
  LiaExclamationTriangleSolid,
  LiaPrintSolid,
  LiaSpinnerSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { useGenerateResendCodesMutation } from '../../hooks/useReturnsMutations';
import { useResendInvoicesPrint } from '../../hooks/useResendInvoicesPrint';
import type { GeneratedResendCode, ReturnOrder } from '../../types';
import { ResendInvoice } from './ResendInvoice';

interface ResendInvoicesPrintProps {
  resendCodes: string[];
  orderCache: Record<string, ReturnOrder>;
}

export function ResendInvoicesPrint({
  resendCodes,
  orderCache,
}: ResendInvoicesPrintProps) {
  const [generatedCodes, setGeneratedCodes] = useState<
    Record<string, GeneratedResendCode>
  >({});
  const [mounted, setMounted] = useState(false);

  const { mutateAsync: generateResendCodes, isPending: isGenerating } =
    useGenerateResendCodesMutation();
  const { isPrinting, triggerPrint } = useResendInvoicesPrint();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = async () => {
    const missing = resendCodes.filter((code) => !generatedCodes[code]);
    if (missing.length > 0) {
      const created = await generateResendCodes(missing);
      const merged = keyBy(created, 'orderCode');
      setGeneratedCodes((prev) => ({ ...prev, ...merged }));
    }
    triggerPrint();
  };

  const printableOrders = resendCodes
    .map((code) => ({
      code,
      order: orderCache[code],
      generated: generatedCodes[code],
    }))
    .filter((entry) => entry.order && entry.generated);

  const canPrint = resendCodes.length > 0 && !isGenerating && !isPrinting;

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
            <LiaExclamationTriangleSolid className="w-4 h-4 shrink-0" />
            <span className="font-semibold">
              وضع تجريبي — الأكواد مولّدة محلياً
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            disabled={!canPrint}
          >
            {isGenerating || isPrinting ? (
              <LiaSpinnerSolid className="w-4 h-4 animate-spin" />
            ) : (
              <LiaPrintSolid className="w-4 h-4" />
            )}
            {isGenerating
              ? 'جاري توليد الأكواد...'
              : isPrinting
                ? 'جاري الطباعة...'
                : 'طباعة فواتير إعادة الإرسال'}
          </Button>
        </div>
      </div>

      {mounted && isPrinting && printableOrders.length > 0
        ? createPortal(
            <div className="print-container flex flex-col gap-0">
              {printableOrders.map(({ code, order, generated }) => (
                <ResendInvoice
                  key={code}
                  order={order as ReturnOrder}
                  generated={generated as GeneratedResendCode}
                />
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
