'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthGuard } from '@/components/auth-guard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: ' الرئيسية', href: '/dashboard', icon: LayoutDashboard },
  { name: ' المنتجات', href: '/dashboard/products', icon: Package },
  {
    name: ' الطلبات ',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    children: [
      { name: 'جميع الطلبات', href: '/dashboard/orders/allOrders' },
      { name: 'تأكيد الطلبات ', href: '/dashboard/orders/completed' },
    ],
  },
  {
    name: 'قسم خدمة العملاء',
    href: '/dashboard/customers',
    icon: Users,
    children: [
      { name: 'تأكيد الطلبات', href: '/dashboard/customers/inquiries' },
      { name: 'متابعة الطلبات', href: '/dashboard/customers/complaints' },
    ],
  },
  {
    name: 'قسم الشحن',
    href: '/dashboard/analytics',
    icon: BarChart3,
    children: [
      { name: 'تقارير ', href: '/dashboard/analytics/new' },
      { name: ' موظفين الشحن', href: '/dashboard/analytics/completed' },
    ],
  },
  {
    name: 'قسم التجهيز',
    href: '/dashboard',
    icon: Settings,
    children: [
      { name: ' تقارير', href: '/dashboard/settings/pending' },
      { name: ' موظفين الشحن', href: '/dashboard/settings/done' },
    ],
  },
];

/* ===== Breadcrumb helper ===== */
function getBreadcrumb(pathname: string) {
  for (const item of navigation) {
    if (item.children) {
      const child = item.children.find((c) => pathname.startsWith(c.href));
      if (child) {
        return { parent: item.name, child: child.name };
      }
    }
    if (pathname === item.href) {
      return { parent: item.name, child: null as string | null };
    }
  }
  const parent = navigation.find((n) => pathname.startsWith(n.href));
  return {
    parent: parent?.name ?? 'لوحة التحكم',
    child: null as string | null,
  };
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapse
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Restore collapse preference
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === '1') setIsCollapsed(true);
  }, []);
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed ? '1' : '0');
  }, [isCollapsed]);

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
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const breadcrumb = getBreadcrumb(pathname);

  const sidebarWidthExpanded = 'w-64';
  const sidebarWidthCollapsed = 'w-16';

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
        >
          <div
            className={`
            flex flex-col h-full transition-[width] duration-300 ease-in-out
            ${isCollapsed ? sidebarWidthCollapsed : sidebarWidthExpanded}
          `}
            style={{ backgroundColor: '#5D24E1' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-3 border-b border-white/10">
              <div className="flex-1 flex justify-center items-center">
                {!isCollapsed && (
                  <Image
                    src="/images/logo-2.PNG"
                    alt="Logo"
                    width={106}
                    height={26}
                    className="object-contain"
                  />
                )}
              </div>
              {/* Desktop collapse toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex text-white hover:bg-white/10"
                onClick={() => setIsCollapsed((v) => !v)}
                title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
              {/* Mobile close */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;

                // Dropdown item
                if (item.children) {
                  const isOpen = openDropdown === item.name;

                  return (
                    <div key={item.name} className="group">
                      <button
                        onClick={() => {
                          if (isCollapsed) {
                            setIsCollapsed(false);
                            setOpenDropdown(item.name);
                          } else {
                            setOpenDropdown(isOpen ? null : item.name);
                          }
                          // Close mobile sidebar when clicking dropdown on mobile
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`
                        flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors
                        ${
                          isActive || isOpen
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }
                      `}
                        style={{ direction: 'rtl' }}
                      >
                        <span className="flex items-center gap-2">
                          <item.icon className="h-5 w-5 shrink-0" />
                          {!isCollapsed && (
                            <span className="pr-2">{item.name}</span>
                          )}
                        </span>
                        {!isCollapsed &&
                          (isOpen ? (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronLeft className="h-4 w-4 shrink-0" />
                          ))}
                      </button>

                      {/* Submenu */}
                      {!isCollapsed && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen
                              ? 'max-h-40 opacity-100 mt-2'
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div
                            className="mr-8 space-y-2"
                            style={{ direction: 'rtl' }}
                          >
                            {item.children.map((sub) => {
                              const isSubActive = pathname.startsWith(sub.href);
                              return (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  className={`
                                  block px-3 py-2 text-sm rounded-md transition-colors
                                  ${
                                    isSubActive
                                      ? 'bg-white/20 text-white'
                                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                                  }
                                `}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  {sub.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Regular nav item
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                    flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                    onClick={() => setSidebarOpen(false)}
                    style={{ direction: 'rtl' }}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="pr-2">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="bg-white border-b border-border h-16 flex items-center px-4 lg:px-6">
            {/* Mobile open */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumb: Parent > Child (if child exists) */}
            <div
              className="flex items-center gap-2 text-base lg:text-lg font-semibold text-gray-800"
              style={{ direction: 'rtl' }}
            >
              <span className="text-[#5D24E1]">{breadcrumb.parent}</span>
              {breadcrumb.child && (
                <>
                  <ChevronLeft className="h-4 w-4 opacity-60" />
                  <span className="font-normal text-gray-700">
                    {breadcrumb.child}
                  </span>
                </>
              )}
            </div>

            <div className="flex-1" />
            <div className="text-sm text-muted-foreground">Welcome, Admin</div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
