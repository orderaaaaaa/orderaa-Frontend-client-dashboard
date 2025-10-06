import { Truck, Package, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import PageTab from '@/components/ui/PageTab';
import React from 'react';

//TODO: Tell the developer to add the rest of the tabs with their images
export default function AllOrdersRefactor() {
  return (
    <DashboardLayout>
      <div className="flex gap-4 md:flex-wrap">
        <PageTab
          label="جميع الطلبات"
          count={3}
          icon={<Package width={18} height={18} />}
          active
        />
        <PageTab
          label="طلبات جديده"
          count={3}
          icon={<CheckCircle width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={200}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={15000}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={30000}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={67}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={1}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={0}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={2}
          icon={<Truck width={18} height={18} />}
        />
      </div>
    </DashboardLayout>
  );
}
