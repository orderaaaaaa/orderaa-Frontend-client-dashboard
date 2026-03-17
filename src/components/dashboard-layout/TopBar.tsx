'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Menu, Search } from 'lucide-react';
import { LiaSearchSolid, LiaTimesSolid, LiaSyncSolid } from 'react-icons/lia';
import Input from '../ui/Input';
import { UserMenu } from './UserMenu';
import { UserMenuKey } from '@/hooks/useSidebar';
import { useAuthStore } from '@/store/authStore';
import { useDebounce } from '@/utils/debounce';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // Use ref to store onSearch to avoid triggering effect when callback reference changes
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  // Debounce search query for auto-search
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      onSearchRef.current(debouncedSearchQuery.trim());
    }
  }, [debouncedSearchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onClearSearch();
  };

  const handleRefreshStatistics = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.ORDER_STATISTICS],
    });
    await queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.PRINT_ORDER_STATISTICS],
    });
    setIsRefreshing(false);
  }, [queryClient]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDER_STATISTICS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRINT_ORDER_STATISTICS],
      });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [queryClient]);

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
        'max-lg:bg-gradient-to-b from-primary to-[#33147B] max-sm:text-white border-b',
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
        {/* ✅ Mobile: Refresh + User dropdown */}
        <div className="lg:hidden flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-10 w-10"
            onClick={handleRefreshStatistics}
            disabled={isRefreshing}
            aria-label="تحديث الإحصائيات"
          >
            <LiaSyncSolid
              className={clsx('h-5 w-5', isRefreshing && 'animate-spin')}
            />
          </Button>
          <UserMenu
            username={authUser?.name || username}
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
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === 'Enter' && handleSearch()
              }
              inputClassName="bg-[#f3f4f6] text-black placeholder:text-primary w-full placeholder:font-medium border-2 !border-primary/30 rounded-lg !pl-20 !py-2"
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
                className="p-1.5 bg-primary hover:bg-[#4a1db8] text-white rounded-md disabled:opacity-70"
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
            inputClassName="sm:rounded-[38px] lg:rounded-[38px] bg-primary/8 border-0 !pl-24 !py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              e.key === 'Enter' && handleSearch()
            }
            aria-label="Search"
          />
          <div className="absolute end-1 top-1/2 transform -translate-y-1/2 text-primary">
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
              className="p-2 bg-primary hover:bg-[#4a1db8] text-white rounded-full disabled:opacity-70"
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
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:bg-gray-100 h-10 w-10 rounded-full"
            onClick={handleRefreshStatistics}
            disabled={isRefreshing}
            aria-label="تحديث الإحصائيات"
          >
            <LiaSyncSolid
              className={clsx('h-5 w-5', isRefreshing && 'animate-spin')}
            />
          </Button>
          <UserMenu
            username={authUser?.name || username}
            email={authUser?.email}
            onUserAction={onUserAction}
            variant="desktop"
          />
        </div>
      </div>
    </header>
  );
}
