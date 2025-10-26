'use client';

import { Button } from '@/components/ui/button';
import { Menu, Search } from 'lucide-react';
import Input from '../ui/Input';
import { UserMenu } from './UserMenu';
import { UserMenuKey } from '@/hooks/useSidebar';

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
  return (
    <header className="flex justify-between items-center px-4 lg:px-6 h-16 bg-white border-b border-border">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden mr-2"
        onClick={onMenuToggle}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search input */}
      <Input
        name="search"
        placeholder="ابحث هنا..."
        icon={Search}
        className="sm:rounded-[38px] lg:w-lg lg:rounded-[38px]"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search"
      />

      {/* User menu */}
      <div className="flex items-center gap-3">
        <UserMenu username={username} onUserAction={onUserAction} />
      </div>
    </header>
  );
}
