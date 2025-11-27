'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Search, User } from 'lucide-react';
import Input from '../ui/Input';
import { UserMenu } from './UserMenu';
import { UserMenuKey } from '@/hooks/useSidebar';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

interface TopBarProps {
  onMenuToggle: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  username?: string;
  onUserAction: (key: UserMenuKey) => void;
}

export function TopBar({
  onMenuToggle,
  searchQuery,
  onSearchChange,
  username,
  onUserAction,
}: TopBarProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const authUser = useAuthStore((state) => state.user);

  // ✅ Update the browser top bar color
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#5D24E1');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      newMeta.content = '#5D24E1';
      document.head.appendChild(newMeta);
    }
  }, []);

  return (
    <header
      className={clsx(
        'flex flex-col lg:flex-row justify-between items-center',
        'px-4 lg:px-6 py-3 lg:py-0',
        'max-sm:bg-gradient-to-b from-[#5D24E1] to-[#33147B] max-sm:text-white border-b',
        'relative'
      )}
      style={{ boxShadow: '0px 4px 12px 0px #00000014' }}
    >
      {/* Top row with menu, search icon, and user name */}
      <div className="flex items-center justify-between w-full lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-10 w-10"
            onClick={onMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-10 w-10"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-white">
            <span className="font-medium text-base">
              {authUser?.username || username || 'جاد علي'}
            </span>
            <User className="h-5 w-5" />
          </div>
        </div>
        {/* ✅ Mobile: User dropdown */}
        <div className="lg:hidden">
          <UserMenu
            username={authUser?.username || username}
            email={authUser?.email}
            onUserAction={onUserAction}
            variant="mobile"
          />
        </div>
      </div>


      {/* ✅ Mobile: Search bar (toggleable) */}
      {showMobileSearch && (
        <div className="w-full lg:hidden mt-3">
          <Input
            name="search"
            placeholder="بحث"
            icon={Search}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-white text-black placeholder:text-[#5d24e1] h-10 placeholder:font-medium border-2 !border-[#5D24E1]/30 rounded-lg"
          />
        </div>
      )}

      {/* ✅ Desktop version */}
      <div className="hidden lg:grid grid-cols-[1fr_auto] gap-4 items-center w-full h-16">
        <Input
          name="search"
          placeholder="البحث"
          icon={Search}
          className="sm:rounded-[38px] lg:rounded-[38px] bg-[#5D24E1]/8 border-0"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search"
        />

        <div className="flex items-center gap-3">
          <UserMenu
            username={username}
            onUserAction={onUserAction}
            variant="desktop"
          />
        </div>
      </div>
    </header>
  );
}
