import React, { useEffect, useState } from "react";
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
import { OrderStatus, OrderStatusItem } from "@/types/orders";
import { useOrdersStore } from "@/store/ordersStore";
import { LiaWhatsapp } from "react-icons/lia";
import { getOrderStatuses } from "@/lib/api/order";

interface PageTapsProps {
  data?: any[];
  statusCounts?: Record<string, number>;
  totalOrders?: number;
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

function PageTaps({ data, statusCounts, totalOrders }: PageTapsProps) {
  const { selectedStatus, setSelectedStatus } = useOrdersStore();
  const [statuses, setStatuses] = useState<OrderStatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await getOrderStatuses();
        setStatuses(response.statuses);
      } catch (error) {
        console.error('Failed to fetch order statuses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  const handleTabClick = (status: OrderStatus | null) => {
    setSelectedStatus(status);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          <div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>
          <div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>
          <div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {/* All Orders Tab */}
        <PageTab
          label="جميع الطلبات"
          count={totalOrders ?? data?.length ?? 0}
          icon={<Boxes width={18} height={18} />}
          active={selectedStatus === null}
          onClick={() => handleTabClick(null)}
        />

        {/* Dynamic Status Tabs from API */}
        {statuses.map((status) => (
          <PageTab
            key={status.value}
            label={status.label}
            count={statusCounts?.[status.value] ?? 0}
            icon={getIconForStatus(status.value)}
            active={selectedStatus === status.value as OrderStatus}
            onClick={() => handleTabClick(status.value as OrderStatus)}
          />
        ))}
      </div>
    </div>
  );
}

export default PageTaps;
