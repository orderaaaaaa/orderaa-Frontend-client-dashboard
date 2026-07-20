'use client';

import type React from 'react';
import { useEffect, useCallback, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { AuthGuard } from '@/components/auth-guard';
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
  ContentError,
} from '@/components/dashboard-layout';
import { ActiveJobIndicator } from '@/components/dashboard-layout/ActiveJobIndicator';

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
  const handleSearch = useCallback(
    async (query: string) => {
      if (isOrderDetailsPage()) {
        // On order details page: search and navigate to first result
        setIsSearching(true);
        try {
          const response = await fetchOrdersForSearch({
            search: query,
            limit: 1,
            page: 1,
          });
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
        // On any other page: navigate to all orders page with search query in URL
        const searchParams = new URLSearchParams();
        searchParams.set('search', query);
        router.push(`/dashboard/orders/allOrders?${searchParams.toString()}`);
      }
    },
    [router, isOrderDetailsPage, fetchOrdersForSearch]
  );

  // Handle clear search - navigate to all orders without search param
  const handleClearSearch = useCallback(() => {
    router.push('/dashboard/orders/allOrders');
  }, [router]);

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
      <div className="flex min-h-dvh bg-gray-50">
        <ErrorBoundary
          fallback={(reset) => <SidebarError onRetry={reset} />}
        >
          <Sidebar
            open={sidebarOpen}
            collapsed={isCollapsed}
            openDropdown={openDropdown}
            onToggle={handleSidebarToggle}
            onCollapseToggle={handleCollapseToggle}
            onDropdownToggle={handleDropdownToggle}
            onNavItemClick={handleNavItemClick}
          />
        </ErrorBoundary>

        <MainContent>
          <div className="sticky top-0 z-10 bg-gray-50">
            <div className="flex-shrink-0 pt-[env(safe-area-inset-top)]">
              <TopBar
                onMenuToggle={handleSidebarToggle}
                onSearch={handleSearch}
                onClearSearch={handleClearSearch}
                isSearching={isSearching}
                username={user?.name}
                onUserAction={handleUserAction}
              />
            </div>

            <div className="flex-shrink-0 px-4 py-1">
              <ActiveJobIndicator />
            </div>
          </div>

          <ErrorBoundary
            fallback={(reset) => <ContentError onRetry={reset} />}
          >
            <PageContent>{children}</PageContent>
          </ErrorBoundary>
        </MainContent>
      </div>
    </AuthGuard>
  );
}
