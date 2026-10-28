'use client';

import { EmptyState } from '@/components/ui/state-panels';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSION_CODES, hasPermissionCodeStrict } from '@/lib/permissions';
import { StockModeSection, StockScopeList } from './components';

export default function StockManagementPage() {
  const permissions = usePermissions();
  const canRead = [
    PERMISSION_CODES.WAREHOUSES_STOCK_READ,
    PERMISSION_CODES.STOCK_WORKFLOWS_READ,
    PERMISSION_CODES.VIRTUAL_WAREHOUSES_READ,
  ].some((code) => hasPermissionCodeStrict(permissions, code));

  if (!canRead) {
    return <EmptyState title="ليست لديك صلاحية عرض المخزن" />;
  }

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة المخزن</h1>
        <p className="mt-1 text-sm text-gray-500">
          اختر مخزنًا لعرض أرصدة المنتجات فيه
        </p>
      </div>
      <StockModeSection />
      <StockScopeList />
    </div>
  );
}
