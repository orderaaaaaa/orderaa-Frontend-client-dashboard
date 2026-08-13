'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WarehousesTab } from './WarehousesTab';
import { StockWorkflowsTab } from './StockWorkflowsTab';
import { StockMovementsTab } from './StockMovementsTab';
import { WAREHOUSE_TABS } from '../constants';

const TABS = [
  { value: WAREHOUSE_TABS.WAREHOUSES, label: 'المخازن' },
  { value: WAREHOUSE_TABS.WORKFLOWS, label: 'قواعد حركة المخزون' },
  { value: WAREHOUSE_TABS.MOVEMENTS, label: 'سجل حركات المخزون' },
];

const VALID_TABS: string[] = Object.values(WAREHOUSE_TABS);

export function WarehouseManagementContent() {
  // Tab lives in the URL so the ledger/rules views are deep-linkable and a
  // refresh doesn't bounce the user back to the first tab.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requested = searchParams.get('tab') ?? '';
  const tab = VALID_TABS.includes(requested)
    ? requested
    : WAREHOUSE_TABS.WAREHOUSES;

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
              {TABS.map((item) => (
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
            <TabsContent
              value={WAREHOUSE_TABS.WORKFLOWS}
              forceMount
              className="data-[state=inactive]:hidden"
            >
              <StockWorkflowsTab />
            </TabsContent>
            <TabsContent value={WAREHOUSE_TABS.MOVEMENTS}>
              <StockMovementsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
