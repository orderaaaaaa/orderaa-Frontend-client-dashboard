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
import Logo from '@/assets/images/updated-logo.png';

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

  const activeItemStyle: React.CSSProperties = {
    backgroundColor: '#2C028F',
    boxShadow: '0px 2px 4px 0px #00000080 inset',
    fontWeight: 500,
  };

  const handleDropdownClick = (itemName: string) => {
    if (collapsed) {
      onCollapseToggle();
      setTimeout(() => onDropdownToggle(itemName), 100);
    } else {
      onDropdownToggle(itemName);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onToggle} />
      )}

      <div
        className={`
          fixed inset-y-0 right-0 z-[9999] transform transition-transform duration-300
          ${open ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
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
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
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
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              if (item.children) {
                const isOpen = openDropdown === item.name;
                const hasActiveChild = item.children.some((sub) =>
                  pathname.startsWith(sub.href)
                );

                return (
                  <div key={item.name}>
                    <button
                      onClick={() => handleDropdownClick(item.name)}
                      className={`
                        flex items-center justify-between w-full px-3 py-3 rounded-lg
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
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? 'max-h-40 mt-2' : 'max-h-0'
                        }`}
                      >
                        <div className="px-4 space-y-1">
                          {item.children.map((sub) => {
                            const isSubActive = pathname.startsWith(sub.href);
                            const SubIcon = sub.icon;

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
                      </div>
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
