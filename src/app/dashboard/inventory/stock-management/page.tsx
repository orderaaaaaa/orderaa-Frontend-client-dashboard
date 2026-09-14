'use client';

import { StockScopeCards } from './components';

export default function StockManagementPage() {
  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ادارة المخزن</h1>
        <p className="mt-1 text-sm text-gray-500">
          اختر مخزنًا لعرض أرصدة المنتجات فيه
        </p>
      </div>
      <StockScopeCards />
    </div>
  );
}
