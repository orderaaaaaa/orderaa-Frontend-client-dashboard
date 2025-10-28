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
} from "lucide-react";
import PageTab from "@/components/ui/PageTab";
import { OrderStatus } from "@/types/orders";
import { useOrdersStore } from "@/store/ordersStore";

interface PageTapsProps {
  data?: any[];
  statusCounts?: Record<string, number>;
  totalOrders?: number;
}

function PageTaps({ data, statusCounts, totalOrders }: PageTapsProps) {
  const { selectedStatus, setSelectedStatus } = useOrdersStore();

  const handleTabClick = (status: OrderStatus | null) => {
    setSelectedStatus(status);
  };

  return (
    <div className="flex gap-4 md:flex-wrap overflow-x-auto hide">
      <PageTab
        label="جميع الطلبات"
        count={totalOrders ?? data?.length ?? 0}
        icon={<Boxes width={18} height={18} />}
        active={selectedStatus === null}
        onClick={() => handleTabClick(null)}
      />
      <PageTab
        label="طلبات جديده"
        count={statusCounts?.[OrderStatus.TRIED_TO_REACH_CUSTOMER] ?? 0}
        icon={<BadgePlus width={18} height={18} />}
        active={selectedStatus === OrderStatus.TRIED_TO_REACH_CUSTOMER}
        onClick={() => handleTabClick(OrderStatus.TRIED_TO_REACH_CUSTOMER)}
      />
      <PageTab
        label="في انتظار الدفع"
        count={statusCounts?.[OrderStatus.WAITING_FOR_PAYMENT] ?? 0}
        icon={<CircleDollarSign width={18} height={18} />}
        active={selectedStatus === OrderStatus.WAITING_FOR_PAYMENT}
        onClick={() => handleTabClick(OrderStatus.WAITING_FOR_PAYMENT)}
      />
      <PageTab
        label="تأجيلات"
        count={statusCounts?.[OrderStatus.ON_HOLD] ?? 0}
        icon={<Clock3 width={18} height={18} />}
        active={selectedStatus === OrderStatus.ON_HOLD}
        onClick={() => handleTabClick(OrderStatus.ON_HOLD)}
      />
      <PageTab
        label="اعادة اتصال"
        count={statusCounts?.[OrderStatus.CALLED_CUSTOMER_AGAIN] ?? 0}
        icon={<PhoneCall width={18} height={18} />}
        active={selectedStatus === OrderStatus.CALLED_CUSTOMER_AGAIN}
        onClick={() => handleTabClick(OrderStatus.CALLED_CUSTOMER_AGAIN)}
      />
      <PageTab
        label="تم الغاء"
        count={statusCounts?.[OrderStatus.CANCELLED] ?? 0}
        icon={<CircleX width={18} height={18} />}
        active={selectedStatus === OrderStatus.CANCELLED}
        onClick={() => handleTabClick(OrderStatus.CANCELLED)}
      />
      <PageTab
        label="تم التأكيد"
        count={statusCounts?.[OrderStatus.CONFIRMED] ?? 0}
        icon={<CheckCircle2 width={18} height={18} />}
        active={selectedStatus === OrderStatus.CONFIRMED}
        onClick={() => handleTabClick(OrderStatus.CONFIRMED)}
      />
      <PageTab
        label="تم التحضير"
        count={statusCounts?.[OrderStatus.PREPARED] ?? 0}
        icon={<CheckCircle2 width={18} height={18} />}
        active={selectedStatus === OrderStatus.PREPARED}
        onClick={() => handleTabClick(OrderStatus.PREPARED)}
      />
      <PageTab
        label="في الشحن"
        count={statusCounts?.[OrderStatus.SHIPPED] ?? 0}
        icon={<Truck width={18} height={18} />}
        active={selectedStatus === OrderStatus.SHIPPED}
        onClick={() => handleTabClick(OrderStatus.SHIPPED)}
      />
      <PageTab
        label="مرتجع"
        count={statusCounts?.[OrderStatus.RETURNED] ?? 0}
        icon={<Copy width={18} height={18} />}
        active={selectedStatus === OrderStatus.RETURNED}
        onClick={() => handleTabClick(OrderStatus.RETURNED)}
      />
      <PageTab
        label="تم التسليم"
        count={statusCounts?.[OrderStatus.DELIVERED] ?? 0}
        icon={<ClipboardCheck width={18} height={18} />}
        active={selectedStatus === OrderStatus.DELIVERED}
        onClick={() => handleTabClick(OrderStatus.DELIVERED)}
      />
      <PageTab
        label="دفعة مقدمة"
        count={statusCounts?.[OrderStatus.DOWN_PAYMENT] ?? 0}
        icon={<CircleDollarSign width={18} height={18} />}
        active={selectedStatus === OrderStatus.DOWN_PAYMENT}
        onClick={() => handleTabClick(OrderStatus.DOWN_PAYMENT)}
      />
      <PageTab
        label="طلبات مفقوده"
        count={statusCounts?.[OrderStatus.MISSING] ?? 0}
        icon={<FileX width={18} height={18} />}
        active={selectedStatus === OrderStatus.MISSING}
        onClick={() => handleTabClick(OrderStatus.MISSING)}
      />
    </div>
  );
}

export default PageTaps;
