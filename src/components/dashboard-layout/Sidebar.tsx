'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Upload,
  FileOutput,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { navigation, NavigationItem } from '@/constants/Navbar';
import { SIDEBAR_WIDTH } from '@/constants/dashboard-layout';
import Logo from '@/assets/images/updated-logo.png';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { hasPermissionCode } from '@/lib/permissions';

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  openDropdown: string | null;
  onToggle: () => void;
  onCollapseToggle: () => void;
  onDropdownToggle: (itemName: string) => void;
  onNavItemClick: () => void;
}

export function Sidebar({
  open,
  collapsed,
  openDropdown,
  onToggle,
  onCollapseToggle,
  onDropdownToggle,
  onNavItemClick,
}: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);

  const isMerchant = !!user?.merchantId;
  const isEmployee = !!user?.employeeId;
  const permissions = usePermissions();

  const filteredNavigation = useMemo(() => {
    const extraOrderChildren: NavigationItem[] = [];
    if (isMerchant) {
      extraOrderChildren.push({
        name: 'رفع شيت التحصيل',
        href: '/dashboard/orders/settlement/upload',
        icon: Upload,
      });
    }
    if (isEmployee) {
      extraOrderChildren.push({
        name: 'تحصيل ناقص',
        href: '/dashboard/orders/settlement/shortfall',
        icon: FileOutput,
      });
    }
    const withExtras =
      extraOrderChildren.length === 0
        ? navigation
        : navigation.map((item) => {
            if (item.name === 'الطلبات' && item.children) {
              return {
                ...item,
                children: [...item.children, ...extraOrderChildren],
              };
            }
            return item;
          });

    // ABAC: drop entries the caller has no permission for, then drop parents
    // whose children all disappeared. Entries without `permission` stay.
    const allowed = (item: NavigationItem) =>
      !item.permission || hasPermissionCode(permissions, item.permission);

    return withExtras.reduce<NavigationItem[]>((acc, item) => {
      if (!allowed(item)) return acc;
      if (!item.children) {
        acc.push(item);
        return acc;
      }
      const children = item.children.filter(allowed);
      if (children.length === 0) return acc;
      acc.push({ ...item, children });
      return acc;
    }, []);
  }, [isMerchant, isEmployee, permissions]);

  const activeItemStyle: React.CSSProperties = {
    backgroundColor: '#2C028F',
    boxShadow: '0px 2px 4px 0px #00000080 inset',
    fontWeight: 500,
  };

  const handleDropdownClick = (itemName: string, element: HTMLElement) => {
    if (collapsed) {
      onCollapseToggle();
      setTimeout(() => onDropdownToggle(itemName), 100);
    } else {
      onDropdownToggle(itemName);
    }
    const isOpening = openDropdown !== itemName;
    if (isOpening) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 350);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden" onClick={onToggle} />
      )}

      <div
        className={`
          fixed inset-y-0 right-0 z-40 transform transition-transform duration-300
          ${open ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}
          lg:translate-x-0 lg:pointer-events-auto lg:sticky lg:top-0 lg:h-dvh
        `}
      >
        <div
          className={`
            relative flex flex-col h-full transition-[width] duration-300
            ${collapsed ? SIDEBAR_WIDTH.COLLAPSED : SIDEBAR_WIDTH.EXPANDED}
            border border-gray-700 overflow-hidden
            shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06),_0_4px_6px_-1px_rgba(0,0,0,0.10)]
          `}
          style={{
            background: 'linear-gradient(180deg, #5D24E1 0%, #33147B 100%)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-3 border-b border-white/10">
            <div className="flex-1 flex justify-center">
              {!collapsed && (
                <Image
                  src={Logo}
                  alt="Ordera Logo"
                  width={200}
                  height={26}
                  priority
                />
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-white hover:bg-white/10"
              onClick={onCollapseToggle}
            >
              {collapsed ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={onToggle}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;

              if (item.children) {
                const isOpen = openDropdown === item.name;
                const hasActiveChild = item.children.some((sub) =>
                  pathname.startsWith(sub.href)
                );

                return (
                  <div key={item.name}>
                    <button
                      onClick={(e) => handleDropdownClick(item.name, e.currentTarget)}
                      className={`
                        flex items-center justify-between w-full px-3 py-3 rounded-lg cursor-pointer
                        ${
                          hasActiveChild
                            ? 'text-white'
                            : 'text-white/80 hover:bg-white/10'
                        }
                      `}
                      style={{
                        direction: 'rtl',
                        ...(hasActiveChild ? activeItemStyle : {}),
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {item.icon && <item.icon className="h-5 w-5" />}
                        {!collapsed && item.name}
                      </span>

                      {!collapsed &&
                        (isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </button>

                    {!collapsed && (
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mt-2"
                          >
                            <div className="px-4 space-y-1">
                              {item.children.map((sub) => {
                                const SubIcon = sub.icon;

                                if (sub.children) {
                                  const isSubOpen = openSubDropdown === sub.name;
                                  const hasActiveLeaf = sub.children.some((leaf) =>
                                    pathname.startsWith(leaf.href)
                                  );

                                  return (
                                    <div key={sub.name}>
                                      <button
                                        onClick={() =>
                                          setOpenSubDropdown((prev) =>
                                            prev === sub.name ? null : sub.name
                                          )
                                        }
                                        className={`
                                          flex items-center justify-between w-full px-3 py-2 rounded-md cursor-pointer
                                          ${
                                            hasActiveLeaf
                                              ? 'text-white'
                                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                                          }
                                        `}
                                        style={{
                                          direction: 'rtl',
                                          ...(hasActiveLeaf ? activeItemStyle : {}),
                                        }}
                                      >
                                        <span className="flex items-center gap-3">
                                          {SubIcon && <SubIcon className="h-5 w-5" />}
                                          {sub.name}
                                        </span>
                                        {isSubOpen ? (
                                          <ChevronUp className="h-4 w-4" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4" />
                                        )}
                                      </button>

                                      <AnimatePresence initial={false}>
                                        {isSubOpen && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden mt-1"
                                          >
                                            <div className="ps-4 space-y-1">
                                              {sub.children.map((leaf) => {
                                                const isLeafActive = pathname.startsWith(leaf.href);
                                                const LeafIcon = leaf.icon;
                                                return (
                                                  <Link
                                                    key={leaf.name}
                                                    href={leaf.href}
                                                    className={`
                                                      flex items-center gap-3 px-3 py-2 rounded-md
                                                      ${
                                                        isLeafActive
                                                          ? 'text-white'
                                                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                      }
                                                    `}
                                                    style={isLeafActive ? activeItemStyle : {}}
                                                    onClick={onNavItemClick}
                                                  >
                                                    {LeafIcon && <LeafIcon className="h-5 w-5" />}
                                                    {leaf.name}
                                                  </Link>
                                                );
                                              })}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                }

                                const isSubActive = pathname.startsWith(sub.href);

                                return (
                                  <Link
                                    key={sub.name}
                                    href={sub.href}
                                    className={`
                                      flex items-center gap-3 px-3 py-2 rounded-md
                                      ${
                                        isSubActive
                                          ? 'text-white'
                                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                                      }
                                    `}
                                    style={isSubActive ? activeItemStyle : {}}
                                    onClick={onNavItemClick}
                                  >
                                    {SubIcon && <SubIcon className="h-5 w-5" />}
                                    {sub.name}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-3 rounded-lg
                    ${
                      isActive
                        ? 'text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                  style={{
                    direction: 'rtl',
                    ...(isActive ? activeItemStyle : {}),
                  }}
                  onClick={(e) => {
                    if (isActive) {
                      e.preventDefault();
                      return;
                    }
                    onNavItemClick();
                  }}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  {!collapsed && <span className="pr-2">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
