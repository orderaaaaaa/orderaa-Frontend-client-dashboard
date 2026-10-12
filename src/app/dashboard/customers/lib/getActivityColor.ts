import type { CustomerBadge } from '../types/customer';

const BADGE_COLORS: Record<CustomerBadge, string> = {
  loyal: 'bg-green-50 text-green-700 border border-green-200',
  bulk: 'bg-purple-50 text-purple-700 border border-purple-200',
  high: 'bg-amber-50 text-amber-700 border border-amber-200',
  ghost: 'bg-[#fef0ef] text-[#d00003] border border-red-200',
  window: 'bg-slate-50 text-slate-700 border border-slate-200',
};

export const getActivityColor = (badge: CustomerBadge) => BADGE_COLORS[badge];
