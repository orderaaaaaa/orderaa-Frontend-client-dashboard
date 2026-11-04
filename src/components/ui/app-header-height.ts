import * as React from 'react';

export const AppHeaderHeightContext = React.createContext(0);
export const AppHeaderRefContext = React.createContext<((element: HTMLDivElement | null) => void) | null>(null);

export function useAppHeaderHeight() {
  return React.useContext(AppHeaderHeightContext);
}
