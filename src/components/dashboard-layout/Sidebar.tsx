'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { navigation } from '@/constants/Navbar';
import { SIDEBAR_WIDTH } from '@/constants/dashboard-layout';

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

  const handleDropdownClick = (itemName: string) => {
    if (collapsed) {
      onCollapseToggle(); // Expand sidebar first
      // Set timeout to allow expansion before opening dropdown
      setTimeout(() => {
        onDropdownToggle(itemName);
      }, 100);
    } else {
      onDropdownToggle(itemName);
    }
  };

  return (
    <>
      {/* Mobile sidebar overlay - FIXED: Remove background classes */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        <div
          className={`
            relative flex flex-col h-full transition-[width] duration-300 ease-in-out
            ${collapsed ? SIDEBAR_WIDTH.COLLAPSED : SIDEBAR_WIDTH.EXPANDED}
            rounded-l-md border border-gray-700 overflow-hidden
            bg-[radial-gradient(circle_at_10%_10%,_#431F94_0%,_#5D24E1_100%)]
            shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06),_0_4px_6px_-1px_rgba(0,0,0,0.10)]
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-3 border-b border-white/10">
            <div className="flex-1 flex justify-center items-center">
              {!collapsed && (
                <Image
                  src="/images/orderaa-nav.PNG"
                  alt="Logo"
                  width={200}
                  height={26}
                  className="object-contain"
                  priority
                />
              )}
            </div>

            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-white hover:bg-white/10"
              onClick={onCollapseToggle}
              title={collapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
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
              onClick={onToggle}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Main navigation"
            className="flex-1 px-2 py-4 space-y-2"
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              // Dropdown item
              if (item.children) {
                const isOpen = openDropdown === item.name;

                return (
                  <div key={item.name} className="group">
                    <button
                      onClick={() => handleDropdownClick(item.name)}
                      className={`
                        flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors
                        ${
                          isActive || isOpen
                            ? 'bg-white/20 text-white font-bold text-[20px] cursor-default'
                            : 'text-white/80 hover:bg-white/10 hover:text-white text-[20px]'
                        }
                      `}
                      style={{ direction: 'rtl' }}
                      aria-expanded={isOpen}
                      aria-controls={`submenu-${item.name}`}
                    >
                      <span className="flex items-center gap-2 text-[20px] font-bold">
                        {item.icon && (
                          <item.icon
                            className="h-5 w-5 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        {!collapsed && (
                          <span className="pr-2 text-[17px] font-bold">
                            {item.name}
                          </span>
                        )}
                      </span>
                      {!collapsed &&
                        (isOpen ? (
                          <ChevronDown
                            className="h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronUp
                            className="h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                        ))}
                    </button>

                    {/* Submenu */}
                    {!collapsed && (
                      <div
                        id={`submenu-${item.name}`}
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen
                            ? 'max-h-40 opacity-100 mt-2'
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="space-y-2" style={{ direction: 'rtl' }}>
                          {item.children.map((sub) => {
                            const isSubActive = pathname.startsWith(sub.href);
                            const SubIcon = sub.icon;

                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                className={`
                                  flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors
                                  ${
                                    isSubActive
                                      ? 'bg-white/20 text-white text-[17px] cursor-default'
                                      : 'text-white/70 hover:bg-white/10 hover:text-white text-[16px]'
                                  }
                                `}
                                onClick={onNavItemClick}
                                aria-current={isSubActive ? 'page' : undefined}
                              >
                                {SubIcon && (
                                  <SubIcon
                                    className="h-5 w-5 shrink-0"
                                    aria-hidden="true"
                                  />
                                )}
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
                    flex items-center px-3 py-3 text-[20px] font-bold rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-white/20 text-white font-bold cursor-default'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                  onClick={(e) => {
                    if (isActive) {
                      e.preventDefault();
                      return;
                    }
                    onNavItemClick();
                  }}
                  style={{ direction: 'rtl' }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon && (
                    <item.icon
                      className="h-5 w-5 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  {!collapsed && (
                    <span className="pr-2 text-[20px] font-bold">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
