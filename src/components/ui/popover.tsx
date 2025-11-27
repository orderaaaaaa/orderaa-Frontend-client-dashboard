"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

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
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Use useLayoutEffect to fix positioning before browser paints
  React.useLayoutEffect(() => {
    console.log('🎯 PopoverContent Mounted', { align, sideOffset, className });

    // Fix RTL positioning issue - runs synchronously before paint
    const fixPositioning = () => {
      if (contentRef.current) {
        const wrapper = contentRef.current.parentElement;
        if (wrapper) {
          const currentTransform = wrapper.style.transform;
          console.log('🔧 Current transform:', currentTransform);

          // Fix negative percentage transforms that push content off-screen
          if (currentTransform && (currentTransform.includes('-200%') || currentTransform.includes('-100%'))) {
            // Replace negative percentages with positive ones
            const fixedTransform = currentTransform
              .replace('translate(0px, -200%)', 'translate(0px, 100%)')
              .replace('translate(0px, -100%)', 'translate(0px, 100%)');

            wrapper.style.transform = fixedTransform;
            console.log('✅ Transform fixed to:', fixedTransform);
          }
        }
      }
    };

    fixPositioning();

    // Also set up a MutationObserver to catch any dynamic style changes
    const observer = new MutationObserver(fixPositioning);
    if (contentRef.current?.parentElement) {
      observer.observe(contentRef.current.parentElement, {
        attributes: true,
        attributeFilter: ['style']
      });
    }

    return () => {
      console.log('🎯 PopoverContent Unmounted');
      observer.disconnect();
    };
  }, []);

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={contentRef}
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[9999] w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        onOpenAutoFocus={(e) => {
          console.log('✨ Popover Auto Focus Event');
        }}
        {...props}
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
