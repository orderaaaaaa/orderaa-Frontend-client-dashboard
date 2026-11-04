"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"
import { ModalContainerContext } from "./base-modal"
import { useAppHeaderHeight } from "./app-header-height"
import { OverlayLayerContext } from "./overlay-layer"

const basePopoverClasses = "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-(--z-popover) w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden";

type Sides = { top: number; right: number; bottom: number; left: number };

const toSides = (padding: number | Partial<Sides> | undefined): Sides => {
  if (typeof padding === 'number') return { top: padding, right: padding, bottom: padding, left: padding };
  return { top: 0, right: 0, bottom: 0, left: 0, ...padding };
};

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  collisionPadding,
  collisionBoundary,
  hideWhenDetached = true,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const modalContainer = React.useContext(ModalContainerContext);
  const inOverlayLayer = React.useContext(OverlayLayerContext);
  const headerHeight = useAppHeaderHeight();
  const isModalLayer = modalContainer != null || inOverlayLayer;
  const sides = toSides(collisionPadding);
  const resolvedPadding = isModalLayer
    ? collisionPadding
    : { ...sides, top: Math.max(sides.top, headerHeight > 0 ? headerHeight + 8 : 0) };
  const resolvedBoundary = isModalLayer || headerHeight === 0
    ? collisionBoundary
    : collisionBoundary ?? (typeof document !== 'undefined' ? document.body : undefined);
  return (
    <PopoverPrimitive.Portal container={modalContainer ?? undefined}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        {...props}
        collisionPadding={resolvedPadding}
        collisionBoundary={resolvedBoundary}
        hideWhenDetached={hideWhenDetached}
        className={cn(
          basePopoverClasses,
          !isModalLayer && 'max-h-(--radix-popover-content-available-height) overflow-y-auto',
          className
        )}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
