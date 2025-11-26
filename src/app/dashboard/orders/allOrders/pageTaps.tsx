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
  UserPlus,
  FileCheck,
  TruckIcon,
  PackageCheck,
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
      <PageTab
        label="جميع الطلبات"
        count={totalOrders ?? data?.length ?? 0}
        icon={<Boxes width={18} height={18} />}
        active={selectedStatus === null}
        onClick={() => handleTabClick(null)}
      />
      <PageTab
        label="طلبات جديده"
        count={statusCounts?.[OrderStatus.NEW_ORDER] ?? 0}
        icon={<BadgePlus width={18} height={18} />}
        active={selectedStatus === OrderStatus.NEW_ORDER}
        onClick={() => handleTabClick(OrderStatus.NEW_ORDER)}
      />
      <PageTab
        label="وقف التشغيل"
        count={statusCounts?.[OrderStatus.STOPPED] ?? 0}
        icon={<Ban width={18} height={18} />}
        active={selectedStatus === OrderStatus.STOPPED}
        onClick={() => handleTabClick(OrderStatus.STOPPED)}
      />
      <PageTab
        label="اعادة اتصال"
        count={statusCounts?.[OrderStatus.CALL_AGAIN] ?? 0}
        icon={<PhoneCall width={18} height={18} />}
        active={selectedStatus === OrderStatus.CALL_AGAIN}
        onClick={() => handleTabClick(OrderStatus.CALL_AGAIN)}
      />
      <PageTab
        label="تأجيلات"
        count={statusCounts?.[OrderStatus.POSTPONED] ?? 0}
        icon={<Clock3 width={18} height={18} />}
        active={selectedStatus === OrderStatus.POSTPONED}
        onClick={() => handleTabClick(OrderStatus.POSTPONED)}
      />
      <PageTab
        label="انتساب"
        count={statusCounts?.[OrderStatus.REGISTERED] ?? 0}
        icon={<UserPlus width={18} height={18} />}
        active={selectedStatus === OrderStatus.REGISTERED}
        onClick={() => handleTabClick(OrderStatus.REGISTERED)}
      />
      <PageTab
        label="في انتظار الدفع"
        count={statusCounts?.[OrderStatus.WAITING_FOR_PAYMENT] ?? 0}
        icon={<CircleDollarSign width={18} height={18} />}
        active={selectedStatus === OrderStatus.WAITING_FOR_PAYMENT}
        onClick={() => handleTabClick(OrderStatus.WAITING_FOR_PAYMENT)}
      />
      <PageTab
        label="تم المحاولة"
        count={statusCounts?.[OrderStatus.ATTEMPTED] ?? 0}
        icon={<Repeat width={18} height={18} />}
        active={selectedStatus === OrderStatus.ATTEMPTED}
        onClick={() => handleTabClick(OrderStatus.ATTEMPTED)}
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
        icon={<PackageCheck width={18} height={18} />}
        active={selectedStatus === OrderStatus.PREPARED}
        onClick={() => handleTabClick(OrderStatus.PREPARED)}
      />
      <PageTab
        label="مرتجع مسلم"
        count={statusCounts?.[OrderStatus.RETURNED_DELIVERED] ?? 0}
        icon={<Copy width={18} height={18} />}
        active={selectedStatus === OrderStatus.RETURNED_DELIVERED}
        onClick={() => handleTabClick(OrderStatus.RETURNED_DELIVERED)}
      />
      <PageTab
        label="تقارير"
        count={statusCounts?.[OrderStatus.REPORTS] ?? 0}
        icon={<FileText width={18} height={18} />}
        active={selectedStatus === OrderStatus.REPORTS}
        onClick={() => handleTabClick(OrderStatus.REPORTS)}
      />
      <PageTab
        label="في الشحن"
        count={statusCounts?.[OrderStatus.SHIPPING] ?? 0}
        icon={<Truck width={18} height={18} />}
        active={selectedStatus === OrderStatus.SHIPPING}
        onClick={() => handleTabClick(OrderStatus.SHIPPING)}
      />
      <PageTab
        label="تم التسليم"
        count={statusCounts?.[OrderStatus.DELIVERED] ?? 0}
        icon={<ClipboardCheck width={18} height={18} />}
        active={selectedStatus === OrderStatus.DELIVERED}
        onClick={() => handleTabClick(OrderStatus.DELIVERED)}
      />
      <PageTab
        label="طلبات مفقوده"
        count={statusCounts?.[OrderStatus.MISSING] ?? 0}
        icon={<FileX width={18} height={18} />}
        active={selectedStatus === OrderStatus.MISSING}
        onClick={() => handleTabClick(OrderStatus.MISSING)}
      />
      <PageTab
        label="تسليم جزئى"
        count={statusCounts?.[OrderStatus.PARTIAL_DELIVERY] ?? 0}
        icon={<FileScan width={18} height={18} />}
        active={selectedStatus === OrderStatus.PARTIAL_DELIVERY}
        onClick={() => handleTabClick(OrderStatus.PARTIAL_DELIVERY)}
      />
      <PageTab
        label="تم الغاء"
        count={statusCounts?.[OrderStatus.CANCELLED] ?? 0}
        icon={<CircleX width={18} height={18} />}
        active={selectedStatus === OrderStatus.CANCELLED}
        onClick={() => handleTabClick(OrderStatus.CANCELLED)}
      />
    </div>
  );
}

export default PageTaps;
