'use client';

import { memo } from 'react';

const ReceiptsHeader = memo(() => {
  return (
    <div className="sm:px-8 py-2 flex flex-row-reverse justify-between items-start gap-4">
      <div />
      <div>
        <h1 className="ps-2 border-s-4 border-primary text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
          إدارة الاستلامات
        </h1>
      </div>
    </div>
  );
});

ReceiptsHeader.displayName = 'ReceiptsHeader';

export default ReceiptsHeader;
