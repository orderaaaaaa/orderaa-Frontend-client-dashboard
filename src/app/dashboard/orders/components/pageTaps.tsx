import React from 'react';
import {
  Truck,
  Boxes,
  Repeat,
  CircleDollarSign,
  Clock3,
  PhoneCall,
  FileText,
  ClipboardCheck,
  Copy,
} from 'lucide-react';
import { HiOutlineReceiptRefund } from 'react-icons/hi2';

import PageTab from '@/components/ui/PageTab';
import { useOrdersStore } from '@/store/ordersStore';
import { useOrderStatusesQuery } from '@/services/orders';
import {
  MdCheckCircleOutline,
  MdErrorOutline,
  MdLoop,
  MdOutlineBlock,
  MdOutlineCalendarMonth,
  MdOutlineCancel,
  MdOutlineFiberNew,
  MdOutlineInventory2,
  MdOutlineLocalShipping,
  MdOutlinePayments,
  MdOutlinePhoneCallback,
  MdQuestionMark,
  MdReceiptLong,
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { FaBoxesPacking } from 'react-icons/fa6';
import { LuPenOff } from 'react-icons/lu';
import { BsInboxes } from 'react-icons/bs';
import { LiaBusinessTimeSolid, LiaCheckDoubleSolid } from 'react-icons/lia';

interface PageTapsProps {
  data?: any[];
  statusCounts?: Record<string, number>;
  totalOrders?: number;
  onStatusChange?: (status: string | null) => void;
  currentStatus?: string | null;
}

//TODO:Omar Move it to external constant file Later Pls
const ICON_SIZE = 'w-5 h-5';
export const getIconForStatus = (statusValue: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    TRIED_TO_REACH_CUSTOMER: <Repeat className={ICON_SIZE} />,
    WAITING_FOR_PAYMENT: <MdOutlinePayments className={ICON_SIZE} />,
    ON_HOLD: <Clock3 className={ICON_SIZE} />,
    CALLED_CUSTOMER_AGAIN: <PhoneCall className={ICON_SIZE} />,
    CANCELLED: <MdOutlineCancel className={ICON_SIZE} />,
    UNCOMPLETED: <MdErrorOutline className={ICON_SIZE} />,
    CONFIRMED: <MdCheckCircleOutline className={ICON_SIZE} />,
    WAITING_FOR_PACKAGING: <FaBoxesPacking className={ICON_SIZE} />,
    PREPARED: <MdOutlineInventory2 className={ICON_SIZE} />,
    EDIT_REJECTED: <LuPenOff className={ICON_SIZE} />,
    WHATSAPP: <FaWhatsapp className={ICON_SIZE} />,
    SHIPPED: <MdOutlineLocalShipping className={ICON_SIZE} />,
    RETURNED: <Copy className={ICON_SIZE} />,
    DELIVERED: <ClipboardCheck className={ICON_SIZE} />,
    DOWN_PAYMENT: <CircleDollarSign className={ICON_SIZE} />,
    MISSING: <MdQuestionMark className={ICON_SIZE} />,
    NEW_ORDER: <MdOutlineFiberNew className={ICON_SIZE} />,
    STOPPED: <MdOutlineBlock className={ICON_SIZE} />,
    CALL_AGAIN: <MdOutlinePhoneCallback className={ICON_SIZE} />,
    POSTPONED: <MdOutlineCalendarMonth className={ICON_SIZE} />,
    REGISTERED: <MdCheckCircleOutline className={ICON_SIZE} />,
    ATTEMPTED: <MdLoop className={ICON_SIZE} />,
    RETURNED_DELIVERED: <HiOutlineReceiptRefund className={ICON_SIZE} />,
    REPORTS: <FileText className={ICON_SIZE} />,
    SHIPPING: <MdOutlineLocalShipping className={ICON_SIZE} />,
    PARTIAL_DELIVERY: <MdReceiptLong className={ICON_SIZE} />,
    WHATSAPP_CONFIRMED: <LiaCheckDoubleSolid className={ICON_SIZE} />,
    WAITING_FOR_APPROVAL: <LiaBusinessTimeSolid className={ICON_SIZE} />,
  };

  return iconMap[statusValue] || <Boxes width={18} height={18} />;
};

function PageTaps({
  data,
  statusCounts,
  totalOrders,
  onStatusChange,
  currentStatus,
}: PageTapsProps) {
  const { selectedStatus: storeSelectedStatus, setSelectedStatus } =
    useOrdersStore();

  const selectedStatus =
    currentStatus !== undefined ? currentStatus : storeSelectedStatus;

  const { data: statusesData, isLoading: loading } = useOrderStatusesQuery();
  const statuses = statusesData ?? [];

  const handleTabClick = (status: string | null) => {
    if (onStatusChange) {
      onStatusChange(status);
    } else {
      setSelectedStatus(status);
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
        {' '}
        <PageTab
          label="جميع الطلبات"
          count={totalOrders ?? data?.length ?? 0}
          icon={<BsInboxes className={ICON_SIZE} />}
          active={selectedStatus === null}
          onClick={() => handleTabClick(null)}
        />
        {statuses.map((status) => (
          <PageTab
            key={status.key}
            label={status.label}
            count={statusCounts?.[status.key] ?? 0}
            icon={getIconForStatus(status.key)}
            active={selectedStatus === status.key}
            onClick={() => handleTabClick(status.key)}
          />
        ))}
      </div>
    </div>
  );
}

export default PageTaps;
