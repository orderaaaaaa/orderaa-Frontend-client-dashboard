'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Search } from 'lucide-react';
import Input from '../ui/Input';
import { UserMenu } from './UserMenu';
import { UserMenuKey } from '@/hooks/useSidebar';
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
        'flex flex-col lg:flex-row justify-between items-center mb-8',
        'px-4 lg:px-6 py-1 pb-4 lg:py-0',
        'max-sm:bg-gradient-to-t from-[#33147B] to-[#5D24E1] max-sm:text-white border-b rounded-b-2xl',
        'relative'
      )}
    >
      {/* ✅ Mobile: email + burger menu */}
      <div className="flex items-center justify-between w-full lg:hidden mt-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <UserMenu
            username={username}
            onUserAction={onUserAction}
            variant="mobile"
          />
        </div>
      </div>

      {/* ✅ Mobile: search bar */}
      <div className="w-[80%] top-12 absolute  lg:hidden">
        <Input
          name="search"
          placeholder="بحث"
          icon={Search}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className=" bg-white text-black placeholder:text-[#5d24e1] h-9 placeholder:font-medium border-2 !border-[#5D24E1]/30"
        />
      </div>

      {/* ✅ Desktop version */}
      <div className="hidden lg:flex justify-between items-center w-full h-16">
        <Input
          name="search"
          placeholder="ابحث هنا..."
          icon={Search}
          className="sm:rounded-[38px] lg:w-lg lg:rounded-[38px]"
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
