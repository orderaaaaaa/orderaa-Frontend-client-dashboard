"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: " الرئيسية", href: "/dashboard", icon: LayoutDashboard },
  { name: " المنتجات", href: "/dashboard/products", icon: Package },
  {
    name: " الطلبات ",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    children: [
      { name: "جميع الطلبات", href: "/dashboard/orders/allOrders" },
      { name: "تأكيد الطلبات ", href: "/dashboard/orders/completed" },
    ],
  },
  {
    name: "قسم خدمة العملاء",
    href: "/dashboard/customers",
    icon: Users,
    children: [
      { name: "تأكيد الطلبات", href: "/dashboard/customers/inquiries" },
      { name: "متابعة الطلبات", href: "/dashboard/customers/complaints" },
    ],
  },
  {
    name: "قسم الشحن",
    href: "/dashboard/analytics",
    icon: BarChart3,
    children: [
      { name: "تقارير ", href: "/dashboard/analytics/new" },
      { name: " موظفين الشحن", href: "/dashboard/analytics/completed" },
    ],
  },
  {
    name: "قسم التجهيز",
    href: "/dashboard",
    icon: Settings,
    children: [
      { name: " تقارير", href: "/dashboard/settings/pending" },
      { name: " موظفين الشحن", href: "/dashboard/settings/done" },
    ],
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();
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
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-background">
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
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div
          className="flex flex-col h-full"
          style={{ backgroundColor: "#5D24E1" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
            <h1 className="text-xl font-bold text-white m-auto">Ordera</h1>
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
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              // If item has children (dropdown)
              if (item.children) {
                const isOpen = openDropdown === item.name;
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : item.name)}
                      className={`
                        flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
                        ${
                          isActive || isOpen
                            ? "bg-white/20 text-white"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }
                      `}
                    >
                      <span className="flex items-center">
                        <item.icon className="mx-3 h-5 w-5" />
                        {item.name}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      )}
                    </button>

                    {/* Submenu with smooth animation */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "max-h-40 opacity-100 mt-2"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="ml-10 space-y-2">
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
                                    ? "bg-white/20 text-white"
                                    : "text-white/70 hover:bg-white/10 hover:text-white"
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
                  </div>
                );
              }

              // Regular nav item
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mx-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-white/10">
            <Link
              href="/dashboard/settings"
              className={`
      flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
      ${
        pathname === "/dashboard/settings"
          ? "bg-white/20 text-white"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }
    `}
            >
              <Settings className="mx-3 h-5 w-5" />
              الاعدادات
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="mx-3 h-5 w-5" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-border h-16 flex items-center px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground">Welcome, Admin</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
