'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  UseBarcodeScannerOptions,
  UseBarcodeScannerReturn,
} from '../types';

export function useBarcodeScanner({
  onScan,
  enabled = true,
  minCharLength = 6,
  maxCharLength = 50,
  avgTimeThreshold = 30,
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
    const bufferContent = buffer.map((b) => b.char).join('');

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
      if (bufferContent.length <= maxCharLength) {
        setLastScan(bufferContent);
        setScanCount((prev) => prev + 1);
        onScan(bufferContent);
      }
    }

    clearBuffer();
  }, [minCharLength, maxCharLength, avgTimeThreshold, onScan, clearBuffer]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const activeTagName = activeEl?.tagName;
      const isContentEditable =
        activeEl?.getAttribute('contenteditable') === 'true';

      if (
        activeTagName === 'INPUT' ||
        activeTagName === 'TEXTAREA' ||
        isContentEditable
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
    (window as any).simulateBarcodeScan = (barcode: string) => {
      if (!enabled) {
        return;
      }

      const activeEl = document.activeElement;
      if (activeEl instanceof HTMLElement) {
        activeEl.blur();
      }

      barcode.split('').forEach((char, i) => {
        setTimeout(() => {
          const event = new KeyboardEvent('keydown', {
            key: char,
            bubbles: true,
            cancelable: true,
          });
          document.dispatchEvent(event);
        }, i * 20);
      });

      setTimeout(() => {
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(enterEvent);
      }, barcode.length * 20);
    };

    (window as any).testBarcodeScan = (barcode: string) => {
      if (!enabled) {
        return;
      }
      onScan(barcode);
    };

    (window as any).checkBarcodeScanner = () => {
      return {
        enabled,
        lastScan,
        scanCount,
        isScanning,
        buffer: bufferRef.current.map((b) => b.char).join(''),
      };
    };
  }, [enabled, lastScan, scanCount, isScanning, onScan]);

  return { lastScan, isScanning, scanCount };
}
