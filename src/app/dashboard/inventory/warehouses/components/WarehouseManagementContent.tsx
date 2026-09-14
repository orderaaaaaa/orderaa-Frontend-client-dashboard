'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WarehousesTab } from './WarehousesTab';
import { StockWorkflowsTab } from './StockWorkflowsTab';
import { StockMovementsTab } from './StockMovementsTab';
import { VirtualWarehousesTab } from './VirtualWarehousesTab';
import { WAREHOUSE_TABS } from '../constants';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES, type PermissionCode } from '@/lib/permissions';

type WarehouseTab = (typeof WAREHOUSE_TABS)[keyof typeof WAREHOUSE_TABS];

const ALL_TABS: {
  value: WarehouseTab;
  label: string;
  permission?: PermissionCode;
}[] = [
  { value: WAREHOUSE_TABS.WAREHOUSES, label: 'المخازن' },
  {
    value: WAREHOUSE_TABS.WORKFLOWS,
    label: 'قواعد حركة المخزون',
    permission: PERMISSION_CODES.STOCK_WORKFLOWS_READ,
  },
  {
    value: WAREHOUSE_TABS.VIRTUAL,
    label: 'المخازن الافتراضية',
    permission: PERMISSION_CODES.VIRTUAL_WAREHOUSES_READ,
  },
  { value: WAREHOUSE_TABS.MOVEMENTS, label: 'سجل حركات المخزون' },
];

export function WarehouseManagementContent() {
  // Tab lives in the URL so the ledger/rules views are deep-linkable and a
  // refresh doesn't bounce the user back to the first tab.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { hasPermission } = usePermissionCheck();
  const tabs = useMemo(
    () =>
      ALL_TABS.filter(
        (item) => !item.permission || hasPermission(item.permission)
      ),
    [hasPermission]
  );
  const visibleTabs = useMemo(
    () => new Set<string>(tabs.map((item) => item.value)),
    [tabs]
  );

  const requested = searchParams.get('tab') ?? '';
  const tab = visibleTabs.has(requested) ? requested : tabs[0].value;

  const setTab = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">إدارة المخازن</h1>
        <p className="mt-1 text-sm text-gray-500">
          أنشئ مخازنك، حدد قواعد حركة المخزون بين حالات الطلبات، وتابع سجل
          الحركات.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              {tabs.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={WAREHOUSE_TABS.WAREHOUSES}>
              <WarehousesTab />
            </TabsContent>
            {/* forceMount: the rules grid holds unsaved rows — Radix unmounts
                inactive tab content, which would silently discard them. */}
            {visibleTabs.has(WAREHOUSE_TABS.WORKFLOWS) && (
              <TabsContent
                value={WAREHOUSE_TABS.WORKFLOWS}
                forceMount
                className="data-[state=inactive]:hidden"
              >
                <StockWorkflowsTab />
              </TabsContent>
            )}
            {visibleTabs.has(WAREHOUSE_TABS.VIRTUAL) && (
              <TabsContent value={WAREHOUSE_TABS.VIRTUAL}>
                <VirtualWarehousesTab />
              </TabsContent>
            )}
            <TabsContent value={WAREHOUSE_TABS.MOVEMENTS}>
              <StockMovementsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
