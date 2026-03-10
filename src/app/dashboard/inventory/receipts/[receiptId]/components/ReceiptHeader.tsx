'use client';

import { memo } from 'react';
import {
  LiaFileInvoiceSolid,
  LiaUserTieSolid,
  LiaClockSolid,
  LiaBoxOpenSolid,
} from 'react-icons/lia';
import { getTimeAgo } from '@/utils/timeAgo';

interface ReceiptHeaderProps {
  invoiceNumber: string;
  companyName: string;
  employeeName: string;
  createdAt: string;
  itemsCount: number;
}

const ReceiptHeader = memo(
  ({ invoiceNumber, companyName, employeeName, createdAt, itemsCount }: ReceiptHeaderProps) => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    return (
      <div className="w-full bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-2">
            <LiaFileInvoiceSolid className="text-primary shrink-0" style={{ width: 24, height: 24 }} />
            <span className="text-lg font-bold text-gray-800">
              فاتورة رقم {invoiceNumber}
            </span>
          </div>
          <span className="ps-11 text-sm text-gray-500">{companyName}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-10">
          <div className="flex flex-col items-start sm:items-center gap-1.5">
            <span className="text-base text-gray-400">موظف مشتريات</span>
            <div className="flex items-center gap-1.5">
              <LiaUserTieSolid className="w-4 h-4 text-primary" />
              <span className="text-base font-semibold text-gray-800">{employeeName}</span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-center gap-1.5">
            <span className="text-base text-gray-400">التاريخ والوقت</span>
            <div className="flex items-center gap-1.5">
              <LiaClockSolid className="w-4 h-4 text-primary" />
              <span className="text-base font-semibold text-gray-800">{getTimeAgo(createdAt)}</span>
            </div>
            <span className="text-sm text-gray-400">{formatDate(createdAt)}</span>
          </div>

          <div className="flex flex-col items-start sm:items-center gap-1.5">
            <span className="text-base text-gray-400">عدد القطع</span>
            <div className="flex items-center gap-1.5">
              <LiaBoxOpenSolid className="w-4 h-4 text-primary" />
              <span className="text-base font-semibold text-gray-800">عدد القطع {itemsCount}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReceiptHeader.displayName = 'ReceiptHeader';

export default ReceiptHeader;
