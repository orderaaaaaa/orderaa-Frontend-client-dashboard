'use client';

import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { AlertTriangle, Check, ChevronDown, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  MergeVariantPlanEntry,
  ProductDetailVariant,
} from '../../types/products';
import {
  variantDisplayLabel,
  variantFullLabel,
  type MergeVariantRef,
} from '../../utils/mergePlan';
import { VARIANT_DELETE_REASON_LABELS } from '../../utils/productApiError';

export type MergeChipChoice =
  | { action: 'KEEP' }
  | { action: 'MERGE_INTO'; intoVariantId: number }
  | { action: 'DROP' };

interface MergeVariantChipProps {
  variantRef: MergeVariantRef;
  entry: MergeVariantPlanEntry;
  intoRef: MergeVariantRef | null;
  mergeTargets: MergeVariantRef[];
  errors: string[];
  colliding: boolean;
  disabled: boolean;
  onChoose: (choice: MergeChipChoice) => void;
}

const itemClass =
  'flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:bg-gray-100';

const dropReason = (variant: ProductDetailVariant) =>
  variant.notDeletableReason
    ? `لا يمكن الحذف: ${VARIANT_DELETE_REASON_LABELS[variant.notDeletableReason]}`
    : null;

const actionText = (
  variantRef: MergeVariantRef,
  entry: MergeVariantPlanEntry,
  intoRef: MergeVariantRef | null,
) => {
  if (entry.action === 'DROP') return 'سيُحذف';
  if (entry.action === 'MERGE_INTO' && intoRef) {
    return `يُدمج مع ${variantFullLabel(intoRef)}`;
  }
  return variantRef.isTarget ? 'يبقى' : 'يُنقل إلى المنتج الرئيسي';
};

export function MergeVariantChipPreview({ variantRef }: { variantRef: MergeVariantRef }) {
  return (
    <div className="rounded-lg border border-primary bg-white px-3 py-2 text-sm font-medium shadow-xl ring-2 ring-primary/20">
      {variantDisplayLabel(variantRef.variant)}
    </div>
  );
}

export function MergeVariantChip({
  variantRef,
  entry,
  intoRef,
  mergeTargets,
  errors,
  colliding,
  disabled,
  onChoose,
}: MergeVariantChipProps) {
  const { variant } = variantRef;
  const label = variantDisplayLabel(variant);
  const isKept = entry.action === 'KEEP';
  const storeLinked = variant.deleteConfirmation === 'HAS_EXTERNAL_LINK';
  const blockedReason = dropReason(variant);
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `variant:${variant.id}`,
    data: { variantId: variant.id },
    disabled,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `into:${variant.id}`,
    data: { kind: 'into', variantId: variant.id },
    disabled: !isKept || disabled,
  });
  const setRefs = (node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };
  const hasProblem = errors.length > 0 || colliding;

  return (
    <div
      ref={setRefs}
      {...attributes}
      {...listeners}
      tabIndex={-1}
      role="group"
      aria-label={`${label}، ${actionText(variantRef, entry, intoRef)}`}
      className={cn(
        'rounded-lg border bg-white p-2 transition-colors md:cursor-grab',
        entry.action === 'KEEP' && 'border-primary/30',
        entry.action === 'MERGE_INTO' && 'border-sky-300 bg-sky-50',
        entry.action === 'DROP' && 'border-red-200 bg-red-50',
        hasProblem && 'border-red-500 ring-1 ring-red-500',
        isOver && 'border-primary bg-primary/10',
        isDragging && 'opacity-40',
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'break-words text-sm font-medium text-gray-900',
              entry.action === 'DROP' && 'text-red-700 line-through',
            )}
          >
            {label}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {!variant.deletable && (
              <span
                className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800"
                title={blockedReason ?? undefined}
              >
                مستخدم
              </span>
            )}
            {storeLinked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                <Link2 className="size-3" aria-hidden />
                مرتبط بالمتجر
              </span>
            )}
            {variant.sku && (
              <span className="text-xs text-gray-500" dir="ltr">
                {variant.sku}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-600">
            {actionText(variantRef, entry, intoRef)}
          </p>
        </div>
        <DropdownMenuPrimitive.Root dir="rtl">
          <DropdownMenuPrimitive.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="min-h-10 shrink-0 gap-1 px-2 text-xs"
              aria-label={`نقل ${label} إلى…`}
              onMouseDown={(event) => event.stopPropagation()}
            >
              نقل إلى…
              <ChevronDown className="size-4" aria-hidden />
            </Button>
          </DropdownMenuPrimitive.Trigger>
          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              align="end"
              sideOffset={4}
              collisionPadding={8}
              className="z-[60] max-h-[min(360px,var(--radix-dropdown-menu-content-available-height))] w-72 max-w-[calc(100vw-16px)] overflow-y-auto rounded-lg border bg-white p-1 shadow-lg"
            >
              <DropdownMenuPrimitive.Item
                className={itemClass}
                onSelect={() => onChoose({ action: 'KEEP' })}
              >
                {entry.action === 'KEEP' ? (
                  <Check className="size-4 text-primary" aria-hidden />
                ) : (
                  <span className="size-4" aria-hidden />
                )}
                إبقاء في المنتج الرئيسي
              </DropdownMenuPrimitive.Item>
              <DropdownMenuPrimitive.Separator className="my-1 h-px bg-gray-100" />
              <DropdownMenuPrimitive.Label className="px-3 py-1.5 text-xs font-semibold text-gray-500">
                دمج مع متغير…
              </DropdownMenuPrimitive.Label>
              {mergeTargets.length === 0 ? (
                <DropdownMenuPrimitive.Item className={itemClass} disabled>
                  <span className="size-4" aria-hidden />
                  لا يوجد متغير باقٍ للدمج معه
                </DropdownMenuPrimitive.Item>
              ) : (
                mergeTargets.map((target) => (
                  <DropdownMenuPrimitive.Item
                    key={target.variant.id}
                    className={itemClass}
                    onSelect={() =>
                      onChoose({
                        action: 'MERGE_INTO',
                        intoVariantId: target.variant.id,
                      })
                    }
                  >
                    {entry.action === 'MERGE_INTO' &&
                    entry.intoVariantId === target.variant.id ? (
                      <Check className="size-4 shrink-0 text-primary" aria-hidden />
                    ) : (
                      <span className="size-4 shrink-0" aria-hidden />
                    )}
                    <span className="min-w-0 break-words">
                      {variantFullLabel(target)}
                    </span>
                  </DropdownMenuPrimitive.Item>
                ))
              )}
              <DropdownMenuPrimitive.Separator className="my-1 h-px bg-gray-100" />
              <DropdownMenuPrimitive.Item
                className={cn(itemClass, 'text-red-600')}
                disabled={!variant.deletable}
                onSelect={() => onChoose({ action: 'DROP' })}
              >
                {entry.action === 'DROP' ? (
                  <Check className="size-4 shrink-0" aria-hidden />
                ) : (
                  <span className="size-4 shrink-0" aria-hidden />
                )}
                <span className="flex min-w-0 flex-col">
                  حذف
                  {blockedReason && (
                    <span className="text-xs text-gray-500">{blockedReason}</span>
                  )}
                </span>
              </DropdownMenuPrimitive.Item>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </div>
      {(errors.length > 0 || colliding) && (
        <ul role="alert" className="mt-2 space-y-1 text-xs text-red-700">
          {colliding && (
            <li className="flex items-start gap-1">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden />
              له نفس قيم متغير آخر باقٍ، ادمج أحدهما في الآخر أو احذفه
            </li>
          )}
          {errors.map((message) => (
            <li key={message} className="flex items-start gap-1">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden />
              {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
