'use client';

import clsx from 'clsx';
import {
  LiaBoxSolid,
  LiaTimesCircleSolid,
  LiaUndoAltSolid,
} from 'react-icons/lia';
import type { IconType } from 'react-icons';
import { Button } from '@/components/ui/button';
import type { CategoryBucket } from '../../types';

interface CategoryButtonsProps {
  value?: CategoryBucket;
  onChange: (bucket: CategoryBucket) => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

interface ButtonConfig {
  bucket: CategoryBucket;
  label: string;
  icon: IconType;
  selectedClasses: string;
}

const BUTTONS: ButtonConfig[] = [
  {
    bucket: 'RESEND',
    label: 'إعادة إرسال',
    icon: LiaUndoAltSolid,
    selectedClasses: 'bg-amber-100 border-amber-400 text-amber-900',
  },
  {
    bucket: 'FINAL_RETURN',
    label: 'مرتجع نهائي',
    icon: LiaTimesCircleSolid,
    selectedClasses: 'bg-rose-100 border-rose-400 text-rose-900',
  },
  {
    bucket: 'WAREHOUSE',
    label: 'مخزن المرتجعات',
    icon: LiaBoxSolid,
    selectedClasses: 'bg-indigo-100 border-indigo-400 text-indigo-900',
  },
];

export function CategoryButtons({
  value,
  onChange,
  disabled,
  size = 'sm',
}: CategoryButtonsProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      {BUTTONS.map(({ bucket, label, icon: Icon, selectedClasses }) => {
        const selected = value === bucket;
        return (
          <Button
            key={bucket}
            type="button"
            variant="outline"
            size={size}
            disabled={disabled}
            onClick={() => onChange(bucket)}
            aria-pressed={selected}
            className={clsx(
              'transition-colors',
              selected && selectedClasses,
              selected && 'font-bold',
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Button>
        );
      })}
    </div>
  );
}
