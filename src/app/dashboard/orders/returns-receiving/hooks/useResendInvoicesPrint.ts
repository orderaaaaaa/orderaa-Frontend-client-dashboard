'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseResendInvoicesPrintReturn {
  isPrinting: boolean;
  triggerPrint: () => void;
}

export function useResendInvoicesPrint(): UseResendInvoicesPrintReturn {
  const [isPrinting, setIsPrinting] = useState(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleAfterPrint = () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      setIsPrinting(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, []);

  const triggerPrint = useCallback(() => {
    setIsPrinting(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        fallbackTimerRef.current = setTimeout(() => {
          setIsPrinting(false);
          fallbackTimerRef.current = null;
        }, 1500);
      }, 100);
    });
  }, []);

  return { isPrinting, triggerPrint };
}
