import React from 'react';
import { TRANSACTIONS_LOG } from '../constants/transactions';

function WalletTransactionLog() {
  const headers = ['التاريخ', 'الاشتراك', 'طريقة الدفع', 'المبلغ'];

  return (
    <div className="container mx-auto mt-10 px-4 mb-20" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-right">سجل المعاملات</h2>

      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-4 bg-white border border-[#ebebeb] rounded-xl py-5 px-6 mb-1 text-center">
          {headers.map((header, index) => (
            <span key={index} className="text-gray-600 font-medium text-lg">
              {header}
            </span>
          ))}
        </div>

        {/* Table Body / Rows */}
        <div className="flex flex-col gap-4">
          {TRANSACTIONS_LOG.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-4 items-center bg-white border border-[#ebebeb] rounded-xl py-4 px-6 hover:shadow-sm transition-shadow text-center"
            >
              <div className="text-gray-800 font-medium">{row.date}</div>
              <div className="text-gray-800 font-medium">{row.planName}</div>
              <div className="text-gray-800 font-medium">
                {row.paymentMethod}
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-gray-900 font-medium">
                  {row.amountUSD}
                </span>
                <span className="text-gray-500 text-sm">{row.amountEGP}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WalletTransactionLog;
