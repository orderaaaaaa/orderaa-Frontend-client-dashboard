'use client';

import clsx from 'clsx';
import {
  LiaBoxSolid,
  LiaTimesCircleSolid,
  LiaUndoAltSolid,
} from 'react-icons/lia';
import type { IconType } from 'react-icons';
import type { CategoryBucket } from '../../types';

interface TotalsChipsProps {
  counts: Record<CategoryBucket, number>;
}

interface ChipConfig {
  bucket: CategoryBucket;
  label: string;
  icon: IconType;
  classes: string;
}

const CHIPS: ChipConfig[] = [
  {
    bucket: 'RESEND',
    label: 'إعادة إرسال',
    icon: LiaUndoAltSolid,
    classes: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  {
    bucket: 'FINAL_RETURN',
    label: 'مرتجع نهائي',
    icon: LiaTimesCircleSolid,
    classes: 'bg-rose-50 border-rose-200 text-rose-800',
  },
  {
    bucket: 'WAREHOUSE',
    label: 'مخزن المرتجعات',
    icon: LiaBoxSolid,
    classes: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  },
];

export function TotalsChips({ counts }: TotalsChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map(({ bucket, label, icon: Icon, classes }) => (
        <div
          key={bucket}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
            classes,
          )}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
          <span className="font-mono font-bold">{counts[bucket] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}
