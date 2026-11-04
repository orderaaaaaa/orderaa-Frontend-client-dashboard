'use client';

import * as React from 'react';
import { AppHeaderHeightContext, AppHeaderRefContext } from '@/components/ui/app-header-height';

export function AppHeaderHeightProvider({ children }: { children: React.ReactNode }) {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  const [height, setHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    if (!element) return;
    const update = () => setHeight(element.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return (
    <AppHeaderRefContext.Provider value={setElement}>
      <AppHeaderHeightContext.Provider value={height}>{children}</AppHeaderHeightContext.Provider>
    </AppHeaderRefContext.Provider>
  );
}

export function AppHeaderBar({ className, children }: { className?: string; children: React.ReactNode }) {
  const setElement = React.useContext(AppHeaderRefContext);
  return (
    <div ref={setElement ?? undefined} className={className}>
      {children}
    </div>
  );
}
