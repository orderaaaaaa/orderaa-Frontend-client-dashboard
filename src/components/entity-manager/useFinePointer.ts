import { useEffect, useState } from 'react';

const FINE_POINTER_QUERY = '(pointer: fine)';

export function useFinePointer(): boolean {
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(FINE_POINTER_QUERY);
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return finePointer;
}
