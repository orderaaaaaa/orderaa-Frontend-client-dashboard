import { useState, useEffect, useCallback } from 'react';
import { BREAKPOINTS } from '@/constants/dashboard-layout';

export type UserMenuKey = 'settings' | 'logout';

export function useSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    try {
      // T20: the pre-fix build auto-collapsed on every nav click and persisted
      // it, so the old key holds a value the user never chose. Retire it once —
      // an absent v2 key means "expanded", so everyone starts full width.
      localStorage.removeItem('sidebar_collapsed');

      const saved = localStorage.getItem('sidebar_collapsed_v2');
      if (saved === '1') setIsCollapsed(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sidebar_collapsed_v2', isCollapsed ? '1' : '0');
    } catch {}
  }, [isCollapsed]);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCollapseToggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleDropdownToggle = useCallback((itemName: string) => {
    setOpenDropdown((prev) => {
      if (prev === itemName) {
        return null;
      } else {
        return itemName;
      }
    });
  }, []);

  const handleNavItemClick = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Below LG the sidebar is an overlay drawer covering the page, so it must
    // close after navigating. On desktop it is a fixed column and stays as the
    // user left it — only the header arrow button changes its width (T20).
    if (window.innerWidth < BREAKPOINTS.LG) {
      setSidebarOpen(false);
    }
  }, []);

  return {
    sidebarOpen,
    isCollapsed,
    openDropdown,
    setSidebarOpen,
    setIsCollapsed,
    setOpenDropdown,
    handleSidebarToggle,
    handleCollapseToggle,
    handleDropdownToggle,
    handleNavItemClick,
  };
}
