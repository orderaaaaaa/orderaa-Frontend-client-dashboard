'use client';

import { useState, type ReactNode } from 'react';
import clsx from 'clsx';
import {
  LiaAngleDownSolid,
  LiaTimesSolid,
} from 'react-icons/lia';
import type { IconType } from 'react-icons';
import { Button } from '@/components/ui/button';
import { getCustomerDisplay, type ReturnOrder } from '../../types';

export interface BucketSectionProps {
  title: string;
  icon: IconType;
  accentClasses: string;
  countBadgeClasses: string;
  codes: string[];
  orderCache: Record<string, ReturnOrder>;
  onRemove: (code: string) => void;
  emptyMessage: string;
  defaultOpen?: boolean;
  children?: ReactNode;
}

export function BucketSection({
  title,
  icon: Icon,
  accentClasses,
  countBadgeClasses,
  codes,
  orderCache,
  onRemove,
  emptyMessage,
  defaultOpen = true,
  children,
}: BucketSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const count = codes.length;

  return (
    <div
      className={clsx(
        'border rounded-xl overflow-hidden transition-colors',
        accentClasses,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full h-auto justify-between gap-3 px-4 py-3 rounded-none hover:bg-black/[0.02] [&_svg:not([class*='size-'])]:size-5"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="shrink-0" />
          <span className="font-bold text-sm sm:text-base truncate">
            {title}
          </span>
          <span
            className={clsx(
              'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-bold',
              countBadgeClasses,
            )}
          >
            {count}
          </span>
        </div>
        <LiaAngleDownSolid
          className={clsx(
            'shrink-0 transition-transform !size-4',
            open ? 'rotate-180' : 'rotate-0',
          )}
        />
      </Button>

      {open && (
        <div className="border-t border-current/10 bg-white">
          {count === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              {emptyMessage}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {codes.map((code) => {
                const order = orderCache[code];
                const display = order ? getCustomerDisplay(order) : null;
                return (
                  <li
                    key={code}
                    className="flex items-center justify-between px-4 py-2 text-gray-900"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-mono text-sm font-semibold">
                        {code}
                      </span>
                      {order && display && (
                        <span className="text-xs text-gray-500 truncate">
                          {display.name} · {order.governorate}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemove(code)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      aria-label="إزالة من هذا التصنيف"
                    >
                      <LiaTimesSolid className="w-4 h-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
          {children && (
            <div className="border-t border-gray-100 p-3 bg-gray-50/60">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
