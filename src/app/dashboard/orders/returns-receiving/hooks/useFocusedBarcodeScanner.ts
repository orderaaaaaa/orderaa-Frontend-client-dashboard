'use client';

import { useCallback, useRef, useState } from 'react';

interface UseFocusedBarcodeScannerOptions {
  onScan: (code: string) => void;
  enabled?: boolean;
  minLength?: number;
}

interface UseFocusedBarcodeScannerReturn {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  focus: () => void;
  clear: () => void;
}

export function useFocusedBarcodeScanner({
  onScan,
  enabled = true,
  minLength = 1,
}: UseFocusedBarcodeScannerOptions): UseFocusedBarcodeScannerReturn {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState('');

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!enabled) return;
      setValue(e.target.value);
    },
    [enabled],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!enabled) return;
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed.length < minLength) return;
      onScan(trimmed);
      setValue('');
    },
    [enabled, value, onScan, minLength],
  );

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const clear = useCallback(() => {
    setValue('');
  }, []);

  return { inputRef, value, onChange, onKeyDown, focus, clear };
}
