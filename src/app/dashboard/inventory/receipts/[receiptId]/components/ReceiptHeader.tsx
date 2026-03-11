'use client';

import { memo } from 'react';
import { LiaFileInvoiceSolid } from 'react-icons/lia';

interface ReceiptHeaderProps {
  invoiceNumber: string;
  companyName: string;
}

const ReceiptHeader = memo(
  ({ invoiceNumber, companyName }: ReceiptHeaderProps) => {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-xl px-6 py-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
          <LiaFileInvoiceSolid className="text-primary w-5 h-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-bold text-gray-800">
            فاتورة رقم {invoiceNumber}
          </span>
          <span className="text-sm text-gray-500">{companyName}</span>
        </div>
      </div>
    );
  }
);

ReceiptHeader.displayName = 'ReceiptHeader';

export default ReceiptHeader;
