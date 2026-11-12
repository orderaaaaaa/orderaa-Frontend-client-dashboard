'use client';

import { useEffect } from 'react';

export function useVisualViewportHeight(element: HTMLElement | null) {
  useEffect(() => {
    const viewport = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!element || !viewport) return;

    const sync = () => {
      element.style.setProperty('--vvh', `${viewport.height}px`);
      element.style.setProperty('--vv-offset', `${viewport.offsetTop}px`);
    };

    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);

    return () => {
      viewport.removeEventListener('resize', sync);
      viewport.removeEventListener('scroll', sync);
    };
  }, [element]);
}
