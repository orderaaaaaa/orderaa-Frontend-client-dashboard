'use client';

import type { SyntheticEvent } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { LiaEllipsisVSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { PERMISSION_CODES } from '@/lib/generated/permission-codes';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

interface CustomerActionsMenuProps {
  customerName: string;
  isBlocked: boolean;
  isPending: boolean;
  onToggleBlockRequest: () => void;
  onNewOrder: () => void;
}

const stop = (event: SyntheticEvent) => event.stopPropagation();

export function CustomerActionsMenu({
  customerName,
  isBlocked,
  isPending,
  onToggleBlockRequest,
  onNewOrder,
}: CustomerActionsMenuProps) {
  const { hasPermission } = usePermissionCheck();
  const canCreateOrder = hasPermission(PERMISSION_CODES.ORDERS_CREATE);

  return (
    <DropdownMenuPrimitive.Root dir="rtl" modal={false}>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="touch"
          aria-label={`إجراءات العميل ${customerName}`}
          onClick={stop}
          onKeyDown={stop}
        >
          <LiaEllipsisVSolid className="size-5 text-gray-600" />
        </Button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={4}
          collisionPadding={8}
          onClick={stop}
          onKeyDown={stop}
          className="z-(--z-popover) min-w-[140px] overflow-hidden rounded-lg border bg-card p-1 shadow-lg"
        >
          {canCreateOrder && (
            <DropdownMenuPrimitive.Item
              onSelect={onNewOrder}
              className="cursor-pointer rounded-md px-3 py-2.5 text-sm font-medium text-gray-800 outline-none data-[highlighted]:bg-gray-100"
            >
              طلب جديد
            </DropdownMenuPrimitive.Item>
          )}
          <DropdownMenuPrimitive.Item
            disabled={isPending}
            onSelect={onToggleBlockRequest}
            className={cn(
              'cursor-pointer rounded-md px-3 py-2.5 text-sm font-medium outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:bg-gray-100',
              isBlocked ? 'text-green-700' : 'text-red-600'
            )}
          >
            {isPending ? 'جاري...' : isBlocked ? 'إلغاء الحظر' : 'حظر'}
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
