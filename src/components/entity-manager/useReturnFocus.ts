import { useCallback, useRef } from 'react';

export function useReturnFocus() {
  const openerRef = useRef<HTMLElement | null>(null);

  const remember = useCallback(() => {
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement ? active : null;
  }, []);

  const onCloseAutoFocus = useCallback((event: Event) => {
    const opener = openerRef.current;
    if (!opener || !opener.isConnected) return;
    event.preventDefault();
    opener.focus();
  }, []);

  return { remember, onCloseAutoFocus };
}
