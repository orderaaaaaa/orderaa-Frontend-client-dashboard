'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Search } from 'lucide-react';
import { LiaSearchSolid, LiaTimesSolid } from 'react-icons/lia';
import Input from '../ui/Input';
import { UserMenu } from './UserMenu';
import { UserMenuKey } from '@/hooks/useSidebar';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

interface TopBarProps {
  onMenuToggle: () => void;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
  isSearching?: boolean;
  username?: string;
  onUserAction: (key: UserMenuKey) => void;
}

export function TopBar({
  onMenuToggle,
  onSearch,
  onClearSearch,
  isSearching = false,
  username,
  onUserAction,
}: TopBarProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const authUser = useAuthStore((state) => state.user);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onClearSearch();
  };

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
        'max-lg:bg-gradient-to-b from-[#5D24E1] to-[#33147B] max-sm:text-white border-b',
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
          <div className="relative">
            <Input
              name="search"
              placeholder="بحث"
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
              className="bg-white text-black placeholder:text-[#5d24e1] h-10 placeholder:font-medium border-2 !border-[#5D24E1]/30 rounded-lg !pl-20"
            />
            <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <Button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  aria-label="مسح البحث"
                >
                  <LiaTimesSolid className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="p-1.5 bg-[#5D24E1] hover:bg-[#4a1db8] text-white rounded-md disabled:opacity-70"
                aria-label="بحث"
              >
                {isSearching ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LiaSearchSolid className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Desktop version */}
      <div className="hidden lg:grid grid-cols-[1fr_auto] gap-4 items-center w-full h-16">
        <div className="relative">
          <Input
            name="search"
            placeholder="البحث"
            icon={Search}
            className="sm:rounded-[38px] lg:rounded-[38px] bg-[#5D24E1]/8 border-0 !pl-24"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
            aria-label="Search"
          />
          <div className="absolute left-0 top-1/2 -translate-y-4 flex items-center gap-1">
            {searchQuery && (
              <Button
                variant="ghost"
                type="button"
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-gray-600"
                aria-label="مسح البحث"
              >
                <LiaTimesSolid className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="p-2 bg-[#5D24E1] hover:bg-[#4a1db8] text-white rounded-full disabled:opacity-70"
              aria-label="بحث"
            >
              {isSearching ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LiaSearchSolid className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

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
