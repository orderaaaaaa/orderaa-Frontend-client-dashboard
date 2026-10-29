'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LiaEllipsisVSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export interface StockActionItem {
  key: string;
  label: string;
  href: string;
  icon: IconType;
}

interface StockActionsMenuProps {
  items: StockActionItem[];
}

export function StockActionsMenu({ items }: StockActionsMenuProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="touch"
          aria-label="إجراءات أخرى للمخزن"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <LiaEllipsisVSolid className="size-5 text-gray-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 gap-0">
        <SheetHeader className="border-b p-4 text-start">
          <SheetTitle>إجراءات المخزن</SheetTitle>
          <SheetDescription>اختر الإجراء المطلوب</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col p-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.key}
                asChild
                variant="ghost"
                className="h-auto w-full justify-start gap-3 py-3 text-sm"
              >
                <Link href={item.href} onClick={() => setOpen(false)}>
                  <Icon className="size-4 text-gray-600" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
