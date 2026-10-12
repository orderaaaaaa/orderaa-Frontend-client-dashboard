'use client';

import { useCallback, useRef, useState } from 'react';
import type { InvoiceData } from '../types';
import { waitForImagesInContainer } from '../utils/printAssets';

const RENDER_DELAY_MS = 100;

export function useInvoicePrinter() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const print = useCallback(async (next?: InvoiceData[]) => {
    if (next) setInvoices(next);
    await new Promise<void>((resolve) => setTimeout(resolve, RENDER_DELAY_MS));
    await waitForImagesInContainer(containerRef.current);
    window.print();
  }, []);

  const replace = useCallback((next: InvoiceData[]) => setInvoices(next), []);

  const clear = useCallback(() => setInvoices([]), []);

  return { invoices, containerRef, print, replace, clear };
}
