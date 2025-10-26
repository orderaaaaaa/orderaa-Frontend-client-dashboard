import { useState, useEffect, useCallback } from 'react';
import { BREAKPOINTS } from '@/constants/dashboard-layout';

export type UserMenuKey = 'settings' | 'logout';

export function useSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Restore collapse preference
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === '1') setIsCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed ? '1' : '0');
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

    if (window.innerWidth < BREAKPOINTS.LG) {
      setSidebarOpen(false);
    } else {
      setIsCollapsed(true);
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
