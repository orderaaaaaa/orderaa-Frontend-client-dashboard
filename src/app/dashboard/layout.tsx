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
  ArrowLeft,
  ChevronRight,
  ChevronUp,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthGuard } from '@/components/auth-guard';
import Input from '../../components/ui/Input';
import Dropdown from '../../components/ui/Drobdown';

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

//TODO: Refactor and clean this
//TODO: Fix the two first tabs size issue
//TODO: Update the navbar icons to match the design

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapse
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // User menu state
  const [userMenuValue, setUserMenuValue] = useState<string>('');

  const userOptions = [
    { key: 'settings', value: 'الإعدادات' },
    { key: 'logout', value: 'تسجيل الخروج' },
  ];

  const handleUserMenuChange = (key: string) => {
    // Reset selection so the placeholder (username) remains visible
    setUserMenuValue('');

    if (key === 'settings') {
      router.push('/dashboard/settings');
      return;
    }
    if (key === 'logout') {
      // Implement your actual logout logic here (e.g., call signOut, clear tokens, etc.)
      // For now we redirect to a login route as an example:
      router.push('/signin');
      return;
    }
  };

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

  // Handle global search - navigate to orders page with search query
  const handleSearch = (e: React.FormEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Navigate to orders page with search query
      router.push(`/dashboard/orders/allOrders?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  // New helper: close mobile sidebar on small screens OR collapse sidebar on large screens
  const handleNavItemClick = () => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1024) {
      // mobile: close drawer
      setSidebarOpen(false);
    } else {
      // large screens: collapse the sidebar (hide / minimize)
      setIsCollapsed(true);
    }
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
            className="fixed inset-0 z-40 lg:hidden"
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
    relative flex flex-col h-full transition-[width] duration-300 ease-in-out
    ${isCollapsed ? sidebarWidthCollapsed : sidebarWidthExpanded}
    rounded-md border border-gray-700 overflow-hidden
    bg-[radial-gradient(circle_at_10%_10%,_#431F94_0%,_#5D24E1_100%)]
    shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06),_0_4px_6px_-1px_rgba(0,0,0,0.10)]
  `}
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
                className="lg:hidden text-white hover:bg-white/10 text-[20px] font-bold"
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
                          if (
                            typeof window !== 'undefined' &&
                            window.innerWidth < 1024
                          ) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`
                        flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors
                        ${
                          isActive || isOpen
                            ? 'bg-white/20 text-white font-bold text-[20px]'
                            : 'text-white/80 hover:bg-white/10 hover:text-white text-[20px]'
                        }
                            
                      `}
                        style={{ direction: 'rtl' }}
                      >
                        <span className="flex items-center gap-2 text-[20px] font-bold">
                          <item.icon className="h-5 w-5 shrink-0" />
                          {!isCollapsed && (
                            <span className="pr-2 text-[20px] font-bold">
                              {item.name}
                            </span>
                          )}
                        </span>
                        {!isCollapsed &&
                          (isOpen ? (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronUp className="h-4 w-4 shrink-0" />
                          ))}
                      </button>

                      {/* Submenu */}
                      {!isCollapsed && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen
                              ? 'max-h-40 opacity-100 mt-2'
                              : 'max-h-0 opacity-0'
                          }
                              
                          `}
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
                                      ? 'bg-white/20 text-white text-[20px]'
                                      : 'text-white/70 hover:bg-white/10 hover:text-white text-[20px]'
                                  }
                                `}
                                  onClick={() => {
                                    handleNavItemClick();
                                  }}
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
                    onClick={() => {
                      handleNavItemClick();
                    }}
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
          <header className="flex justify-between items-center px-4 lg:px-6 h-16 bg-white border-b border-border">
            {/* Mobile open */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Input
              name="search"
              placeholder="ابحث هنا..."
              icon={Search}
              className="sm:rounded-[38px] lg:w-lg lg:rounded-[38px]"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
            />

            <div className="flex items-center gap-3">
              {
                /* User name displayed as placeholder; dropdown used for actions */
                //TODO: Fix the spacing issue
              }
              <Dropdown
                value={userMenuValue}
                onChange={handleUserMenuChange}
                options={userOptions}
                placeholder="جاد علي"
                className="w-auto"
                placeholderClassName="text-[#1F1F1F] font-bold text-[20px]"
                selectClassName="border-0"
              />
            </div>
          </header>

          {/* Breadcrumb: Parent > Child (if child exists) */}
          <div
            className="flex items-center gap-2 text-base lg:text-lg font-semibold text-gray-800 p-5"
            style={{ direction: 'rtl' }}
          >
            <span className="text-[#5D24E1]">{breadcrumb.parent}</span>
            {breadcrumb.child && (
              <>
                <ArrowLeft
                  className="h-4 w-4 opacity-60"
                  color="#292D32"
                  width={15}
                  height={15}
                />
                <span className="font-normal text-gray-700">
                  {breadcrumb.child}
                </span>
              </>
            )}
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
