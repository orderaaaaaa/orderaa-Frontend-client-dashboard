'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  value = value || 0;
  return (
    <div className="relative max-w-[420px]">
      {' '}
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          'w-full bg-primary/20 relative h-2 overflow-hidden !rounded-sm',
          className
        )}
        {...props}
      >
        {' '}
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="bg-gradient-to-l from-[#5A3FFF] to-[#5D24E199] h-full w-full flex-1 transition-all"
          style={{ transform: `translateX(${100 - value}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}

export { Progress };
