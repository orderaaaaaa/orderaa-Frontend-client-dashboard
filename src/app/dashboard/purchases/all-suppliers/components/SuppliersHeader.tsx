'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { LiaPlusSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';

const SuppliersHeader = memo(() => {
  const router = useRouter();

  return (
    <div className="sm:px-8 py-2 flex flex-row-reverse justify-between items-start gap-4">
      <Button
        variant="default"
        size="lg"
        className="rounded-full font-semibold flex items-center gap-2 text-xs sm:text-sm"
        onClick={() => router.push('/dashboard/purchases/add-supplier')}
      >
        <LiaPlusSolid className="w-5 h-5 sm:w-7 sm:h-7" />
        <p>إضافة مورد جديد</p>
      </Button>
      <div>
        <h1 className="ps-2 border-s-4 border-primary text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
          إدارة الموردين
        </h1>
        <p className="ps-3 text-base sm:text-2xl text-black/90">
          إدارة و متابعة جميع الموردين
        </p>
      </div>
    </div>
  );
});

SuppliersHeader.displayName = 'SuppliersHeader';

export default SuppliersHeader;
