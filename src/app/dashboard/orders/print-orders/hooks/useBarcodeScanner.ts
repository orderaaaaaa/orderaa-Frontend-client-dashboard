'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import type {
  UseBarcodeScannerOptions,
  UseBarcodeScannerReturn,
} from '../types';

export const UNRECOGNIZED_SCAN_MESSAGE = 'لم يتم التعرف على الكود';

interface ScannerDebugState {
  enabled: boolean;
  lastScan: string | null;
  scanCount: number;
  isScanning: boolean;
  buffer: string;
}

type ScannerDebugWindow = Window & {
  simulateBarcodeScan?: (barcode: string) => void;
  testBarcodeScan?: (barcode: string) => void;
  checkBarcodeScanner?: () => ScannerDebugState;
};

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

function isTypingTarget(element: Element | null): boolean {
  if (!element) return false;
  return (
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.tagName === 'SELECT' ||
    element.getAttribute('contenteditable') === 'true'
  );
}

export function useBarcodeScanner({
  onScan,
  onUnrecognized,
  enabled = true,
  minCharLength = 6,
  maxCharLength = 50,
  avgTimeThreshold = 30,
  debounceTimeout = 100,
  bufferResetTimeout = 1000,
}: UseBarcodeScannerOptions): UseBarcodeScannerReturn {
  const bufferRef = useRef<{ char: string; timestamp: number }[]>([]);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    idleTimerRef.current = null;
    resetTimerRef.current = null;
  }, []);

  const clearBuffer = useCallback(() => {
    bufferRef.current = [];
    setIsScanning(false);
  }, []);

  const reportUnrecognized = useCallback(
    (raw: string) => {
      if (onUnrecognized) onUnrecognized(raw);
      else toast.error(UNRECOGNIZED_SCAN_MESSAGE);
    },
    [onUnrecognized]
  );

  const accept = useCallback(
    (code: string) => {
      setLastScan(code);
      setScanCount((prev) => prev + 1);
      onScan(code);
    },
    [onScan]
  );

  const processEnterTerminated = useCallback(() => {
    const content = bufferRef.current.map((b) => b.char).join('');
    clearTimers();
    clearBuffer();
    if (content.length === 0) return;
    if (content.length < minCharLength || content.length > maxCharLength) {
      reportUnrecognized(content);
      return;
    }
    accept(content);
  }, [
    minCharLength,
    maxCharLength,
    accept,
    reportUnrecognized,
    clearBuffer,
    clearTimers,
  ]);

  const processIdle = useCallback(() => {
    const buffer = bufferRef.current;
    if (buffer.length < Math.max(minCharLength, 2)) return;

    let totalTime = 0;
    for (let i = 1; i < buffer.length; i++) {
      totalTime += buffer[i].timestamp - buffer[i - 1].timestamp;
    }
    const avgTime = totalTime / (buffer.length - 1);
    if (avgTime >= avgTimeThreshold) return;

    const content = buffer.map((b) => b.char).join('');
    clearTimers();
    clearBuffer();
    if (content.length > maxCharLength) {
      reportUnrecognized(content);
      return;
    }
    accept(content);
  }, [
    minCharLength,
    maxCharLength,
    avgTimeThreshold,
    accept,
    reportUnrecognized,
    clearBuffer,
    clearTimers,
  ]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      clearBuffer();
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(document.activeElement)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Enter') {
        if (bufferRef.current.length > 0) e.preventDefault();
        processEnterTerminated();
        return;
      }

      if (e.key.length !== 1) return;

      bufferRef.current.push({ char: e.key, timestamp: Date.now() });
      setIsScanning(true);

      clearTimers();
      idleTimerRef.current = setTimeout(processIdle, debounceTimeout);
      resetTimerRef.current = setTimeout(clearBuffer, bufferResetTimeout);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimers();
    };
  }, [
    enabled,
    processEnterTerminated,
    processIdle,
    clearBuffer,
    clearTimers,
    debounceTimeout,
    bufferResetTimeout,
  ]);

  useEffect(() => {
    if (!IS_DEVELOPMENT) return;
    const debugWindow = window as ScannerDebugWindow;

    debugWindow.simulateBarcodeScan = (barcode: string) => {
      if (!enabled) return;
      const activeEl = document.activeElement;
      if (activeEl instanceof HTMLElement) activeEl.blur();
      barcode.split('').forEach((char, i) => {
        setTimeout(() => {
          document.dispatchEvent(
            new KeyboardEvent('keydown', { key: char, bubbles: true, cancelable: true })
          );
        }, i * 20);
      });
      setTimeout(() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
        );
      }, barcode.length * 20);
    };

    debugWindow.testBarcodeScan = (barcode: string) => {
      if (!enabled) return;
      onScan(barcode);
    };

    debugWindow.checkBarcodeScanner = () => ({
      enabled,
      lastScan,
      scanCount,
      isScanning,
      buffer: bufferRef.current.map((b) => b.char).join(''),
    });

    return () => {
      delete debugWindow.simulateBarcodeScan;
      delete debugWindow.testBarcodeScan;
      delete debugWindow.checkBarcodeScanner;
    };
  }, [enabled, lastScan, scanCount, isScanning, onScan]);

  return { lastScan, isScanning, scanCount };
}
