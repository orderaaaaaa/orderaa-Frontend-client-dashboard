'use client';

import type React from 'react';
import { useEffect, useCallback, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { AuthGuard } from '@/components/auth-guard';
import { useOrdersStore } from '@/store/ordersStore';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuthActions } from '@/hooks/useAuthActions';
import { navigation } from '@/constants/Navbar';
import { useFetchOrdersForSearch } from '@/services/orders';
import {
  Sidebar,
  TopBar,
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

  const { setSearchQuery } = useOrdersStore();
  const { user, handleUserAction } = useAuthActions();
  const { fetchOrdersForSearch } = useFetchOrdersForSearch();
  const pathname = usePathname();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);

  // Check if we're on the order details page (pattern: /dashboard/orders/[number])
  const isOrderDetailsPage = useCallback(() => {
    const orderDetailsPattern = /^\/dashboard\/orders\/\d+$/;
    return orderDetailsPattern.test(pathname);
  }, [pathname]);

  // Handle search - behavior depends on current page
  const handleSearch = useCallback(async (query: string) => {
    if (isOrderDetailsPage()) {
      // On order details page: search and navigate to first result
      setIsSearching(true);
      try {
        const response = await fetchOrdersForSearch({ search: query, limit: 1, page: 1 });
        if (response.data && response.data.length > 0) {
          const firstOrder = response.data[0];
          router.push(`/dashboard/orders/${firstOrder.id}`);
        } else {
          toast.info('لا يوجد بيانات للبحث');
        }
      } catch (error) {
        console.error('Search failed:', error);
        toast.error('فشل البحث');
      } finally {
        setIsSearching(false);
      }
    } else {
      // On any other page: update store and navigate to all orders page
      setSearchQuery(query);
      if (!pathname.includes('/dashboard/orders/allOrders')) {
        router.push('/dashboard/orders/allOrders');
      }
    }
  }, [pathname, router, setSearchQuery, isOrderDetailsPage, fetchOrdersForSearch]);

  // Handle clear search - clear the store to refetch all orders
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

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
              onSearch={handleSearch}
              onClearSearch={handleClearSearch}
              isSearching={isSearching}
              username={user?.username}
              onUserAction={handleUserAction}
            />

            <PageContent>{children}</PageContent>
          </MainContent>
        </div>
      </ErrorBoundary>
    </AuthGuard>
  );
}
