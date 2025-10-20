import React from 'react';
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
} from 'lucide-react';
import PageTab from '@/components/ui/PageTab';
import { OrderStatus } from '@/types/orders';

interface PageTapsProps {
  data?: any[];
  activeStatus?: OrderStatus | 'all';
  onStatusChange?: (status: OrderStatus | 'all') => void;
  stats?: Record<OrderStatus, number>;
}

function PageTaps({ data, activeStatus = 'all', onStatusChange, stats }: PageTapsProps) {
  const handleTabClick = (status: OrderStatus | 'all') => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  return (
    <div className="flex gap-4 md:flex-wrap overflow-x-auto hide">
      <div onClick={() => handleTabClick('all')}>
        <PageTab
          label="جميع الطلبات"
          count={data?.length}
          icon={<Boxes width={18} height={18} />}
          active={activeStatus === 'all'}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.TRIED_TO_REACH_CUSTOMER)}>
        <PageTab
          label="تم المحاولة"
          count={stats?.[OrderStatus.TRIED_TO_REACH_CUSTOMER]}
          icon={<Repeat width={18} height={18} />}
          active={activeStatus === OrderStatus.TRIED_TO_REACH_CUSTOMER}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.WAITING_FOR_PAYMENT)}>
        <PageTab
          label="في انتظار الدفع"
          count={stats?.[OrderStatus.WAITING_FOR_PAYMENT]}
          icon={<CircleDollarSign width={18} height={18} />}
          active={activeStatus === OrderStatus.WAITING_FOR_PAYMENT}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.ON_HOLD)}>
        <PageTab
          label="وقوف التشغيل"
          count={stats?.[OrderStatus.ON_HOLD]}
          icon={<Ban width={18} height={18} />}
          active={activeStatus === OrderStatus.ON_HOLD}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.CALLED_CUSTOMER_AGAIN)}>
        <PageTab
          label="اعادة اتصال"
          count={stats?.[OrderStatus.CALLED_CUSTOMER_AGAIN]}
          icon={<PhoneCall width={18} height={18} />}
          active={activeStatus === OrderStatus.CALLED_CUSTOMER_AGAIN}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.CANCELLED)}>
        <PageTab
          label="تم الغاء"
          count={stats?.[OrderStatus.CANCELLED]}
          icon={<CircleX width={18} height={18} />}
          active={activeStatus === OrderStatus.CANCELLED}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.CONFIRMED)}>
        <PageTab
          label="طلبات جديده"
          count={stats?.[OrderStatus.CONFIRMED]}
          icon={<BadgePlus width={18} height={18} />}
          active={activeStatus === OrderStatus.CONFIRMED}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.PREPARED)}>
        <PageTab
          label="تم التحضير"
          count={stats?.[OrderStatus.PREPARED]}
          icon={<CheckCircle2 width={18} height={18} />}
          active={activeStatus === OrderStatus.PREPARED}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.SHIPPED)}>
        <PageTab
          label="في الشحن"
          count={stats?.[OrderStatus.SHIPPED]}
          icon={<Truck width={18} height={18} />}
          active={activeStatus === OrderStatus.SHIPPED}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.RETURNED)}>
        <PageTab
          label="مرتجع مسلم"
          count={stats?.[OrderStatus.RETURNED]}
          icon={<Copy width={18} height={18} />}
          active={activeStatus === OrderStatus.RETURNED}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.DELIVERED)}>
        <PageTab
          label="تم التحصيل"
          count={stats?.[OrderStatus.DELIVERED]}
          icon={<ClipboardCheck width={18} height={18} />}
          active={activeStatus === OrderStatus.DELIVERED}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.DOWN_PAYMENT)}>
        <PageTab
          label="تأجيلات"
          count={stats?.[OrderStatus.DOWN_PAYMENT]}
          icon={<Clock3 width={18} height={18} />}
          active={activeStatus === OrderStatus.DOWN_PAYMENT}
        />
      </div>
      <div onClick={() => handleTabClick(OrderStatus.MISSING)}>
        <PageTab
          label="طلبات مفقوده"
          count={stats?.[OrderStatus.MISSING]}
          icon={<FileX width={18} height={18} />}
          active={activeStatus === OrderStatus.MISSING}
        />
      </div>
    </div>
  );
}

export default PageTaps;
