'use client';

import { useEffect, useState } from 'react';

export function useScrollEndFade<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);
  const [hasMoreAtEnd, setHasMoreAtEnd] = useState(false);

  useEffect(() => {
    if (!element) {
      setHasMoreAtEnd(false);
      return;
    }
    const update = () => {
      const remaining =
        element.scrollWidth - element.clientWidth - Math.abs(element.scrollLeft);
      setHasMoreAtEnd(remaining > 1);
    };
    const resize = new ResizeObserver(update);
    const observeChildren = () =>
      Array.from(element.children).forEach((child) => resize.observe(child));
    const mutations = new MutationObserver(() => {
      observeChildren();
      update();
    });
    resize.observe(element);
    observeChildren();
    mutations.observe(element, { childList: true });
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      element.removeEventListener('scroll', update);
      resize.disconnect();
      mutations.disconnect();
    };
  }, [element]);

  return { ref: setElement, hasMoreAtEnd };
}
