import React from "react";
import {
  Truck,
  Boxes,
  BadgePlus,
  Repeat,
  CircleDollarSign,
  Clock3,
  PhoneCall,
  Ban,
  CircleX,
  CheckCircle2,
  FileText,
  FileX,
  FileScan,
  ClipboardCheck,
  Copy,
  PackageCheck,
} from "lucide-react";
import PageTab from "@/components/ui/PageTab";
import { OrderStatus } from "@/types/orders";
import { useOrdersStore } from "@/store/ordersStore";
import { LiaWhatsapp } from "react-icons/lia";
import { useOrderStatusesQuery } from "@/services/orders";

interface PageTapsProps {
  data?: any[];
  statusCounts?: Record<string, number>;
  totalOrders?: number;
  onStatusChange?: (status: OrderStatus | null) => void;
}

// Icon mapping based on status value
const getIconForStatus = (statusValue: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    TRIED_TO_REACH_CUSTOMER: <Repeat width={18} height={18} />,
    WAITING_FOR_PAYMENT: <CircleDollarSign width={18} height={18} />,
    ON_HOLD: <Clock3 width={18} height={18} />,
    CALLED_CUSTOMER_AGAIN: <PhoneCall width={18} height={18} />,
    CANCELLED: <CircleX width={18} height={18} />,
    CONFIRMED: <CheckCircle2 width={18} height={18} />,
    PREPARED: <PackageCheck width={18} height={18} />,
    SHIPPED: <Truck width={18} height={18} />,
    RETURNED: <Copy width={18} height={18} />,
    DELIVERED: <ClipboardCheck width={18} height={18} />,
    DOWN_PAYMENT: <CircleDollarSign width={18} height={18} />,
    MISSING: <FileX width={18} height={18} />,
    NEW_ORDER: <BadgePlus width={18} height={18} />,
    STOPPED: <Ban width={18} height={18} />,
    CALL_AGAIN: <PhoneCall width={18} height={18} />,
    POSTPONED: <Clock3 width={18} height={18} />,
    REGISTERED: <LiaWhatsapp width={18} height={18} />,
    ATTEMPTED: <Repeat width={18} height={18} />,
    RETURNED_DELIVERED: <Copy width={18} height={18} />,
    REPORTS: <FileText width={18} height={18} />,
    SHIPPING: <Truck width={18} height={18} />,
    PARTIAL_DELIVERY: <FileScan width={18} height={18} />,
  };

  return iconMap[statusValue] || <Boxes width={18} height={18} />;
};

function PageTaps({ data, statusCounts, totalOrders, onStatusChange }: PageTapsProps) {
  const { selectedStatus, setSelectedStatus } = useOrdersStore();

  const { data: statusesData, isLoading: loading } = useOrderStatusesQuery();
  const statuses = statusesData ?? [];

  const handleTabClick = (status: OrderStatus | null) => {
    setSelectedStatus(status); 
    onStatusChange?.(status); 
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
      <div className="flex md:grid sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 overflow-x-auto pb-2 md:overflow-x-visible scrollbar-thin -mx-1 px-1">
        <PageTab
          label="جميع الطلبات"
          count={totalOrders ?? data?.length ?? 0}
          icon={<Boxes width={18} height={18} />}
          active={selectedStatus === null}
          onClick={() => handleTabClick(null)}
        />

        {statuses.map((status) => (
          <PageTab
            key={status.key}
            label={status.label}
            count={statusCounts?.[status.key] ?? 0}
            icon={getIconForStatus(status.key)}
            active={selectedStatus === status.key as OrderStatus}
            onClick={() => handleTabClick(status.key as OrderStatus)}
          />
        ))}
      </div>
    </div>
  );
}

export default PageTaps;
