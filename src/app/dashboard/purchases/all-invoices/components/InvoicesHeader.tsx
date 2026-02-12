'use client';

import { memo } from 'react';
import { LiaPlusSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';

const InvoicesHeader = memo(() => {
  return (
    <div className="sm:px-8 py-2 flex flex-row-reverse justify-between items-start gap-4">
      <Button variant="default" size="lg" className="rounded-full font-semibold flex items-center gap-2 text-xs sm:text-sm">
        <LiaPlusSolid className="w-5 h-5 sm:w-7 sm:h-7" />
        <p>انشاء فاتورة جديدة</p>
      </Button>
      <div>
        <h1 className="ps-2 border-s-4 border-primary text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">ادارة الفواتير</h1>
        <p className="ps-3 text-base sm:text-2xl text-black/90">نظام ادارة الفواتير و المشتريات</p>
      </div>
    </div>
  );
});

InvoicesHeader.displayName = 'InvoicesHeader';

export default InvoicesHeader;
