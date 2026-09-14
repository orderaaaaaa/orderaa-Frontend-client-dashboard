'use client';

import Link from 'next/link';
import { LiaArrowRightSolid, LiaWarehouseSolid } from 'react-icons/lia';
import { STOCK_MANAGEMENT_BASE_PATH } from '../constants';

export function StockScopeNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <LiaWarehouseSolid className="mb-4 size-16" />
      <p className="text-lg font-medium text-gray-600">المخزن غير موجود</p>
      <Link
        href={STOCK_MANAGEMENT_BASE_PATH}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <LiaArrowRightSolid className="size-4" />
        كل المخازن
      </Link>
    </div>
  );
}
