'use client';

import type React from 'react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import { useOrdersStore } from '@/store/ordersStore';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuthActions } from '@/hooks/useAuthActions';
import { navigation } from '@/constants/Navbar';
import {
  Sidebar,
  TopBar,
  Breadcrumb,
  MainContent,
  PageContent,
  ErrorBoundary,
  SidebarError,
} from '@/components/dashboard-layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const {
    sidebarOpen,
    isCollapsed,
    openDropdown,
    setSidebarOpen,
    setOpenDropdown,
    handleSidebarToggle,
    handleCollapseToggle,
    handleDropdownToggle,
    handleNavItemClick,
  } = useSidebar();

  const { searchQuery, setSearchQuery } = useOrdersStore();
  const { user, handleUserAction } = useAuthActions();
  const pathname = usePathname();

  // Auto-open dropdown if pathname matches a child route
  useEffect(() => {
    navigation.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((sub) =>
          pathname.startsWith(sub.href)
        );
        if (isChildActive) {
          setOpenDropdown(item.name);
        }
      }
    });
  }, [pathname, setOpenDropdown]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <AuthGuard>
      <ErrorBoundary fallback={<SidebarError />}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar
            open={sidebarOpen}
            collapsed={isCollapsed}
            openDropdown={openDropdown}
            onToggle={handleSidebarToggle}
            onCollapseToggle={handleCollapseToggle}
            onDropdownToggle={handleDropdownToggle}
            onNavItemClick={handleNavItemClick}
          />

          <MainContent>
            <TopBar
              onMenuToggle={handleSidebarToggle}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              username={user?.username}
              onUserAction={handleUserAction}
            />

            <Breadcrumb />

            <PageContent>{children}</PageContent>
          </MainContent>
        </div>
      </ErrorBoundary>
    </AuthGuard>
  );
}
