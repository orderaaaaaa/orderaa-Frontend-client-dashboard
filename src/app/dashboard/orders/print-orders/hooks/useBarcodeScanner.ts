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

function log(...args: any[]) {
  console.log('[Barcode Scanner]', ...args);
}

function warn(...args: any[]) {
  console.warn('[Barcode Scanner]', ...args);
}

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

  log('Hook initialized with config:', {
    enabled,
    minCharLength,
    maxCharLength,
    avgTimeThreshold,
    debounceTimeout,
  });

  const clearBuffer = useCallback(() => {
    const bufferContent = bufferRef.current.map((b) => b.char).join('');
    if (bufferRef.current.length > 0) {
      log('Clearing buffer, had content:', bufferContent);
    }
    bufferRef.current = [];
    setIsScanning(false);
  }, []);

  const processScan = useCallback(() => {
    const buffer = bufferRef.current;
    const bufferContent = buffer.map((b) => b.char).join('');

    log('Processing scan, buffer length:', buffer.length, 'content:', bufferContent);

    if (buffer.length < minCharLength) {
      log('Buffer too short, minimum required:', minCharLength, 'got:', buffer.length);
      clearBuffer();
      return;
    }

    let totalTime = 0;
    const timings: number[] = [];
    for (let i = 1; i < buffer.length; i++) {
      const diff = buffer[i].timestamp - buffer[i - 1].timestamp;
      timings.push(diff);
      totalTime += diff;
    }
    const avgTime = totalTime / (buffer.length - 1);

    log('Timing analysis:', {
      totalTime: totalTime + 'ms',
      avgTime: avgTime.toFixed(2) + 'ms',
      threshold: avgTimeThreshold + 'ms',
      timingsBetweenKeys: timings,
    });

    if (avgTime < avgTimeThreshold) {
      log('Timing check PASSED - this looks like a barcode scanner input');

      if (bufferContent.length <= maxCharLength) {
        log('Length check PASSED - barcode is valid length');
        log('Scan successful, barcode:', bufferContent);

        setLastScan(bufferContent);
        setScanCount((prev) => {
          const newCount = prev + 1;
          log('Incrementing scan count to:', newCount);
          return newCount;
        });

        log('Calling onScan callback with barcode:', bufferContent);
        onScan(bufferContent);
      } else {
        warn('Length check FAILED - barcode too long, max:', maxCharLength, 'got:', bufferContent.length);
      }
    } else {
      log('Timing check FAILED - too slow for barcode scanner, likely manual typing');
      log('Average time between keys:', avgTime.toFixed(2) + 'ms, threshold:', avgTimeThreshold + 'ms');
    }

    clearBuffer();
  }, [minCharLength, maxCharLength, avgTimeThreshold, onScan, clearBuffer]);

  useEffect(() => {
    log('Enabled state changed to:', enabled);

    if (!enabled) {
      log('Scanner is disabled, not attaching keydown listener');
      return;
    }

    log('Scanner is enabled, attaching keydown listener to document');

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const activeTagName = activeEl?.tagName;
      const isContentEditable = activeEl?.getAttribute('contenteditable') === 'true';

      if (
        activeTagName === 'INPUT' ||
        activeTagName === 'TEXTAREA' ||
        isContentEditable
      ) {
        log('Keydown ignored - focus is on:', activeTagName || 'contenteditable element');
        return;
      }

      const now = Date.now();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        log('Cleared pending timeout');
      }

      if (e.key === 'Enter') {
        log('Enter key pressed, processing scan now');
        processScan();
        return;
      }

      if (e.key.length === 1) {
        const currentBuffer = bufferRef.current.map((b) => b.char).join('');
        bufferRef.current.push({ char: e.key, timestamp: now });
        log('Character received:', e.key, 'buffer now:', currentBuffer + e.key);
        setIsScanning(true);
      } else {
        log('Non-printable key ignored:', e.key);
      }

      timeoutRef.current = setTimeout(() => {
        log('Debounce timeout reached (' + debounceTimeout + 'ms), processing scan');
        processScan();
      }, debounceTimeout);
    };

    document.addEventListener('keydown', handleKeyDown);
    log('Keydown listener attached');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      log('Keydown listener removed');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        log('Cleared timeout on cleanup');
      }
    };
  }, [enabled, processScan, debounceTimeout]);

  useEffect(() => {
    log('Registering debug functions on window object');

    (window as any).simulateBarcodeScan = (barcode: string) => {
      log('--- SIMULATION START ---');
      log('Simulating barcode scan for:', barcode);
      log('Current scanner enabled state:', enabled);

      if (!enabled) {
        warn('Scanner is disabled! Open the PrintInvoicesModal first.');
        warn('Make sure you clicked the print icon to open the modal.');
        log('--- SIMULATION ABORTED ---');
        return;
      }

      const activeEl = document.activeElement;
      if (activeEl instanceof HTMLElement) {
        log('Blurring active element:', activeEl.tagName);
        activeEl.blur();
      }

      log('Dispatching', barcode.length, 'character events + Enter');

      barcode.split('').forEach((char, i) => {
        setTimeout(() => {
          log('Dispatching key:', char, 'at index:', i);
          const event = new KeyboardEvent('keydown', {
            key: char,
            bubbles: true,
            cancelable: true,
          });
          document.dispatchEvent(event);
        }, i * 20);
      });

      setTimeout(() => {
        log('Dispatching Enter key');
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(enterEvent);
        log('--- SIMULATION COMPLETE ---');
      }, barcode.length * 20);
    };

    (window as any).testBarcodeScan = (barcode: string) => {
      log('--- DIRECT TEST SCAN ---');
      log('Directly calling onScan with barcode:', barcode);
      log('Current scanner enabled state:', enabled);

      if (!enabled) {
        warn('Scanner is disabled! Open the PrintInvoicesModal first.');
        warn('Make sure you clicked the print icon to open the modal.');
        return;
      }

      onScan(barcode);
      log('--- DIRECT TEST COMPLETE ---');
    };

    (window as any).checkBarcodeScanner = () => {
      console.log('--- Barcode Scanner Status ---');
      console.log('Enabled:', enabled);
      console.log('Last scan:', lastScan);
      console.log('Total scan count:', scanCount);
      console.log('Currently scanning:', isScanning);
      console.log('Current buffer:', bufferRef.current.map((b) => b.char).join(''));
      console.log('------------------------------');
    };

    log('Debug functions registered:');
    log('  - window.simulateBarcodeScan(code) - simulates keyboard events');
    log('  - window.testBarcodeScan(code) - directly calls onScan callback');
    log('  - window.checkBarcodeScanner() - shows current scanner status');
  }, [enabled, lastScan, scanCount, isScanning, onScan]);

  return { lastScan, isScanning, scanCount };
}
