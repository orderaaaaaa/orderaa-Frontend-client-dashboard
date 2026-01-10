'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  minCharLength?: number;
  maxCharLength?: number;
  avgTimeThreshold?: number;
  debounceTimeout?: number;
}

interface UseBarcodeScannerReturn {
  lastScan: string | null;
  isScanning: boolean;
  scanCount: number;
}

export function useBarcodeScanner({
  onScan,
  enabled = true,
  minCharLength = 3,
  maxCharLength = 50,
  avgTimeThreshold = 50,
  debounceTimeout = 100,
}: UseBarcodeScannerOptions): UseBarcodeScannerReturn {
  const bufferRef = useRef<{ char: string; timestamp: number }[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const clearBuffer = useCallback(() => {
    bufferRef.current = [];
    setIsScanning(false);
  }, []);

  const processScan = useCallback(() => {
    const buffer = bufferRef.current;
    if (buffer.length < minCharLength) {
      clearBuffer();
      return;
    }

    let totalTime = 0;
    for (let i = 1; i < buffer.length; i++) {
      totalTime += buffer[i].timestamp - buffer[i - 1].timestamp;
    }
    const avgTime = totalTime / (buffer.length - 1);

    if (avgTime < avgTimeThreshold) {
      const barcode = buffer.map((b) => b.char).join('');
      if (barcode.length <= maxCharLength) {
        setLastScan(barcode);
        setScanCount((prev) => prev + 1);
        onScan(barcode);
      }
    }

    clearBuffer();
  }, [minCharLength, maxCharLength, avgTimeThreshold, onScan, clearBuffer]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      const now = Date.now();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (e.key === 'Enter') {
        processScan();
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current.push({ char: e.key, timestamp: now });
        setIsScanning(true);
      }

      timeoutRef.current = setTimeout(() => {
        processScan();
      }, debounceTimeout);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, processScan, debounceTimeout]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).simulateBarcodeScan = (barcode: string) => {
        console.log(`[Barcode Scanner] Starting simulation for: "${barcode}"`);
        console.log(`[Barcode Scanner] Scanner enabled: ${enabled}`);

        if (!enabled) {
          console.warn('[Barcode Scanner] Scanner is disabled! Open the PrintInvoicesModal first.');
          return;
        }

        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        barcode.split('').forEach((char, i) => {
          setTimeout(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: char }));
          }, i * 20);
        });
        setTimeout(() => {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
          console.log(`[Barcode Scanner] Simulation complete for: "${barcode}"`);
        }, barcode.length * 20);
      };

      (window as any).checkBarcodeScanner = () => {
        console.log(`[Barcode Scanner] Enabled: ${enabled}`);
        console.log(`[Barcode Scanner] Last scan: ${lastScan}`);
        console.log(`[Barcode Scanner] Scan count: ${scanCount}`);
      };
    }
  }, [enabled, lastScan, scanCount]);

  return { lastScan, isScanning, scanCount };
}
