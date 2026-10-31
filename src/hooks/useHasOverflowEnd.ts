'use client';

import { useEffect, useState, type RefObject } from 'react';

export function useHasOverflowEnd(ref: RefObject<HTMLElement | null>): boolean {
  const [hasOverflowEnd, setHasOverflowEnd] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      setHasOverflowEnd(element.scrollWidth - element.clientWidth - Math.abs(element.scrollLeft) > 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    element.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, [ref]);

  return hasOverflowEnd;
}
