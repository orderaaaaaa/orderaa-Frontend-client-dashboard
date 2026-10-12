import type { IconType } from 'react-icons';
import {
  LiaBoxesSolid,
  LiaEyeSolid,
  LiaGemSolid,
  LiaGhostSolid,
  LiaMedalSolid,
} from 'react-icons/lia';
import { cn } from '@/lib/utils';
import { getActivityColor } from '../lib/getActivityColor';
import { CUSTOMER_BADGE_LABELS } from '../constants/SearchConst';
import type { CustomerBadge } from '../types/customer';

const BADGE_ICONS: Record<CustomerBadge, IconType> = {
  loyal: LiaMedalSolid,
  bulk: LiaBoxesSolid,
  high: LiaGemSolid,
  ghost: LiaGhostSolid,
  window: LiaEyeSolid,
};

interface CustomerBadgeChipProps {
  badge: CustomerBadge | null;
  className?: string;
}

export function CustomerBadgeChip({ badge, className }: CustomerBadgeChipProps) {
  if (!badge) return null;
  const Icon = BADGE_ICONS[badge];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap',
        getActivityColor(badge),
        className
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span>{CUSTOMER_BADGE_LABELS[badge]}</span>
    </span>
  );
}
