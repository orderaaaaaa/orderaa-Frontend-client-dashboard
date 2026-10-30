import { useEffect, useState, type RefObject } from 'react';

export function useOverflowFade(ref: RefObject<HTMLElement | null>): boolean {
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const offset = Math.abs(element.scrollLeft);
      setHasMore(offset + element.clientWidth < element.scrollWidth - 1);
    };
    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [ref]);

  return hasMore;
}
