import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Return type for useDropdownState hook
 */
export interface DropdownState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  ref: React.RefObject<HTMLDivElement>;
}

export function useDropdownState(): DropdownState {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    ref,
  };
}
