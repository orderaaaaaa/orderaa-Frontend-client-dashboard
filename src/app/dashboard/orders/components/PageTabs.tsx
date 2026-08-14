'use client';

import React from 'react';
import {
  Boxes,
  BadgePlus,
  Repeat,
  PhoneCall,
  Ban,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import PageTab from '@/components/ui/PageTab';
import { useOrderStatusesQuery } from '@/services/orders';

interface PageTabsProps {
  statusCounts?: Record<string, number>;
  totalOrders?: number;
  onStatusChange?: (status: string | null) => void;
  currentStatus?: string | null;
}

const getIconForStatus = (statusValue: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    NEW_ORDER: <BadgePlus width={18} height={18} />,
    ATTEMPTED: <Repeat width={18} height={18} />,
    CALL_AGAIN: <PhoneCall width={18} height={18} />,
    POSTPONED: <Clock3 width={18} height={18} />,
    CONFIRMED: <CheckCircle2 width={18} height={18} />,
    CANCELLED: <Ban width={18} height={18} />,
    STOPPED: <Ban width={18} height={18} />,
  };

  return iconMap[statusValue] || <Boxes width={18} height={18} />;
};

export function PageTabs({
  statusCounts,
  totalOrders,
  onStatusChange,
  currentStatus,
}: PageTabsProps) {
  const { data: statusesData, isLoading: loading } = useOrderStatusesQuery();
  // Permission-scoped on purpose — tabs, not the full label dictionary.
  const statuses = statusesData?.statuses ?? [];

  const handleTabClick = (status: string | null) => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex md:grid sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 overflow-x-auto pb-2 md:overflow-x-visible scrollbar-thin -mx-1 px-1">
          <div className="animate-pulse h-10 bg-gray-200 rounded-lg min-w-[150px]"></div>
          <div className="animate-pulse h-10 bg-gray-200 rounded-lg min-w-[150px]"></div>
          <div className="animate-pulse h-10 bg-gray-200 rounded-lg min-w-[150px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex md:grid sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 overflow-x-auto pb-2 md:overflow-x-visible scrollbar-hide -mx-1 px-1">
        <PageTab
          label="جميع الطلبات"
          count={totalOrders ?? 0}
          icon={<Boxes width={18} height={18} />}
          active={currentStatus === null}
          onClick={() => handleTabClick(null)}
        />
        {statuses.map((status) => (
          <PageTab
            key={status.key}
            label={status.label}
            count={statusCounts?.[status.key] ?? 0}
            icon={getIconForStatus(status.key)}
            active={currentStatus === status.key}
            onClick={() => handleTabClick(status.key)}
          />
        ))}
      </div>
    </div>
  );
}
