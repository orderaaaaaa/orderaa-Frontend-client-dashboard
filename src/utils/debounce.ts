import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import debounce from 'lodash/debounce';
import type { DebouncedFunc } from 'lodash';

export { debounce };

export interface UseDebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const debouncedSetter = useMemo(
    () => debounce((val: T) => setDebouncedValue(val), delay),
    [delay]
  );

  useEffect(() => {
    debouncedSetter(value);

    return () => {
      debouncedSetter.cancel();
    };
  }, [value, debouncedSetter]);

  useEffect(() => {
    return () => {
      debouncedSetter.cancel();
    };
  }, [debouncedSetter]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number = 300,
  options: UseDebounceOptions = {}
): DebouncedFunc<T> {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFn = useMemo(
    () =>
      debounce(
        ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
        delay,
        {
          leading: options.leading ?? false,
          trailing: options.trailing ?? true,
          maxWait: options.maxWait,
        }
      ),
    [delay, options.leading, options.trailing, options.maxWait]
  );

  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return debouncedFn;
}

export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  const debouncedSetter = useMemo(
    () => debounce((val: T) => setDebouncedValue(val), delay),
    [delay]
  );

  const setValueWithDebounce = useCallback(
    (newValue: T) => {
      setValue(newValue);
      debouncedSetter(newValue);
    },
    [debouncedSetter]
  );

  useEffect(() => {
    return () => {
      debouncedSetter.cancel();
    };
  }, [debouncedSetter]);

  return [value, debouncedValue, setValueWithDebounce];
}
