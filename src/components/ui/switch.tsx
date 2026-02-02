'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'relative peer inline-flex h-[30px] w-[66px] shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-200',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block h-[30px] w-[30px] rounded-full bg-white border border-gray-300 shadow-sm ring-0 transition-transform duration-300 data-[state=checked]:translate-x-[36px] data-[state=unchecked]:translate-x-0 rtl:data-[state=checked]:-translate-x-[36px] rtl:data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
