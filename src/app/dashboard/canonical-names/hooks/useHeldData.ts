import { useRef } from 'react';

export function useHeldData<T>(data: T | undefined, scope: unknown): T | undefined {
  const heldRef = useRef<{ data: T | undefined; scope: unknown }>({
    data,
    scope,
  });
  if (!Object.is(heldRef.current.scope, scope)) {
    heldRef.current = { data, scope };
  } else if (data !== undefined) {
    heldRef.current.data = data;
  }
  return heldRef.current.data;
}
