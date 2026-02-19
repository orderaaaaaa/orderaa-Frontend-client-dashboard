'use client';

import { memo, ReactNode } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';

interface ToggleOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface ToggleGroupProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  disabledTooltip?: string;
  className?: string;
}

function ToggleGroupInner<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  disabledTooltip,
  className,
}: ToggleGroupProps<T>) {
  const content = (
    <div className={clsx('flex items-center gap-1 rounded-full bg-gray-100 p-1', disabled && 'opacity-60 cursor-not-allowed', className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? 'default' : 'ghost'}
          size="sm"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={clsx(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            value === option.value
              ? 'shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-transparent',
            disabled && 'pointer-events-none',
          )}
        >
          {option.icon}
          {option.label}
        </Button>
      ))}
    </div>
  );

  if (disabled && disabledTooltip) {
    return (
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div>{content}</div>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="bottom"
              sideOffset={6}
              className="z-[9999] rounded-lg bg-gray-800 px-3 py-2 text-sm text-white shadow-lg animate-in fade-in-0 zoom-in-95"
            >
              {disabledTooltip}
              <Tooltip.Arrow className="fill-gray-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  return content;
}

const ToggleGroup = memo(ToggleGroupInner) as typeof ToggleGroupInner;

export default ToggleGroup;
