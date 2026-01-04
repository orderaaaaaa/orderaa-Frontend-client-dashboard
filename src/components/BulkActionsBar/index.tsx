import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Edit, Truck, CircleAlert } from 'lucide-react';
import type { Order } from '@/types/orders';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { OrderStatusItem } from '@/types/orders';

interface BulkActionsBarProps {
  selectedOrders: Order[];
  onEditStatus?: (statusKey: string) => void;
  statusOptions?: OrderStatusItem[];
  onExportExcel?: () => void;
  onShareWhatsApp?: () => void;
  onShipping?: () => void;
  onOther?: () => void;
  position?: 'fixed' | 'sticky' | 'absolute';
  className?: string;
  isAllSelected?: boolean;
  totalStoreOrders?: number;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedOrders,
  onEditStatus,
  statusOptions = [],
  onExportExcel,
  onShareWhatsApp,
  onShipping,
  onOther,
  position = 'fixed',
  className = '',
  isAllSelected = false,
  totalStoreOrders = 0,
}) => {
  if (selectedOrders.length === 0 && !isAllSelected) {
    return null;
  }

  const positionClasses = {
    fixed: 'fixed bottom-0 left-0 right-0 z-50',
    sticky: 'sticky bottom-0 z-10',
    absolute: 'absolute bottom-0 left-0 right-0 z-10',
  }[position];

  const handleStatusSelect = (statusKey: string) => {
    if (onEditStatus) {
      onEditStatus(statusKey);
    }
  };

  const selectedCount = isAllSelected
    ? totalStoreOrders
    : selectedOrders.length;

  return (
    <div
      className={`${positionClasses} bg-white border-t border-gray-200 shadow-lg py-4 px-6 ${className}`}
    >
      <div className="mx-auto overflow-x-auto scrollbar-hide">
        <div className="pb-2 flex flex-row gap-2 items-center justify-center max-w-7xl w-max mx-auto">
          {/* Status Dropdown using Select */}
          {/* <Select onValueChange={handleStatusSelect}>
            <SelectTrigger className="group flex items-center gap-2 px-4 py-2 rounded-3xl !bg-white border border-primary !text-primary hover:!bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap w-auto h-auto focus:ring-0 focus:ring-offset-0 ring-offset-0">
              <Edit className="h-4 w-4 group-hover:text-white" />
              <span className="group-hover:text-white">
                تعديل الحالة ({selectedCount})
              </span>
            </SelectTrigger>
            <SelectContent align="end" className="max-h-[300px]">
              {statusOptions.length > 0 ? (
                statusOptions.map((status) => (
                  <SelectItem
                    key={status.key}
                    value={status.key}
                    className="cursor-pointer justify-end  hover:!text-white hover:!bg-primary "
                  >
                    {status.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-gray-500">
                  لا توجد حالات متاحة
                </div>
              )}
            </SelectContent>
          </Select> */}

          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
            onClick={onExportExcel}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>مشاركة شيت اكسيل</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap [&:hover_svg]:fill-white h-10"
            onClick={onShareWhatsApp}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              fill="#5D24E1"
              viewBox="0 0 640 640"
              className="transition-colors"
            >
              <path d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z" />
            </svg>
            <span>مشاركة واتساب</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
            onClick={onShipping}
          >
            <Truck className="h-4 w-4" />
            <span>شحن</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
            onClick={onOther}
          >
            <CircleAlert className="h-4 w-4" />
            <span>اخرى</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;
