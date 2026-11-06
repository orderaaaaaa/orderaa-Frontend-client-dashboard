'use client';

import { useState } from 'react';
import { useIsMutating } from '@tanstack/react-query';
import { ArrowDown, ArrowLeft } from 'lucide-react';
import { MoveStockForm, type MoveStockLine } from '@/components/stock/MoveStockForm';
import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { WarehouseSelect } from '@/components/stock/WarehouseSelect';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { useStockWarehouseOptions } from '@/services/productStock';
import { TRANSFER_STOCK_MUTATION_KEY } from '@/services/warehouses';
import { STOCK_MANAGEMENT_BASE_PATH } from '../../constants';
import { TransferProductPicker } from './TransferProductPicker';

export function TransferContent() {
  const warehouses = useStockWarehouseOptions();
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [selectedDestinationId, setSelectedDestinationId] = useState<number | null>(null);
  const [lines, setLines] = useState<MoveStockLine[]>([]);
  const isMoving = useIsMutating({ mutationKey: TRANSFER_STOCK_MUTATION_KEY }) > 0;

  const sourceId =
    selectedSourceId !== null && warehouses.isMoveAllowed(selectedSourceId)
      ? selectedSourceId
      : null;
  const destinationId =
    selectedDestinationId !== null &&
    selectedDestinationId !== sourceId &&
    warehouses.isMoveAllowed(selectedDestinationId)
      ? selectedDestinationId
      : null;
  const destinationOptions = warehouses.movePickerOptions.filter(
    (option) => option.key !== String(sourceId)
  );
  const sourceBlocked =
    selectedSourceId !== null && sourceId === null && !warehouses.isLoading;
  const tooFewWarehouses =
    !warehouses.isLoading && !warehouses.isError && warehouses.movePickerOptions.length < 2;

  const onSourceChange = (id: number) => {
    if (id === selectedSourceId) return;
    setSelectedSourceId(id);
    setLines([]);
    if (id === selectedDestinationId) setSelectedDestinationId(null);
  };

  const toggleLine = (line: MoveStockLine) =>
    setLines((current) =>
      current.some((item) => item.variantId === line.variantId)
        ? current.filter((item) => item.variantId !== line.variantId)
        : [...current, line]
    );

  const removeLine = (variantId: number) =>
    setLines((current) => current.filter((item) => item.variantId !== variantId));

  const applyShortage = (shortage: { variantId: number; available: number }[]) =>
    setLines((current) =>
      current.map((line) => {
        const hit = shortage.find((item) => item.variantId === line.variantId);
        return hit ? { ...line, available: hit.available } : line;
      })
    );

  const clearLines = () => setLines([]);

  return (
    <>
      <StockPageHeader
        title="نقل المخزون"
        subtitle="انقل الكميات بين المخازن المسموح بالنقل بينها"
        breadcrumbs={[
          { label: 'إدارة المخزن', href: STOCK_MANAGEMENT_BASE_PATH },
          { label: 'نقل المخزون' },
        ]}
      />

      {warehouses.isError ? (
        <ErrorState error={undefined} fallback="تعذر تحميل المخازن" onRetry={warehouses.onRetry} />
      ) : tooFewWarehouses ? (
        <EmptyState
          title="لا توجد مخازن كافية للنقل"
          description="يلزم مخزنان على الأقل مسموح بالنقل بينهما"
        />
      ) : (
        <>
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-end md:gap-4 md:p-5">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-sm font-medium text-foreground">من مخزن</span>
              <WarehouseSelect
                value={sourceId}
                onChange={onSourceChange}
                source={{ ...warehouses, pickerOptions: warehouses.movePickerOptions }}
                placeholder="اختر المخزن الذي ستنقل منه"
                disabled={isMoving}
              />
              {sourceBlocked && (
                <p className="text-xs text-destructive">
                  لم يعد هذا المخزن مسموحًا بالنقل، اختر مخزنًا آخر
                </p>
              )}
            </div>
            <ArrowLeft aria-hidden="true" className="hidden size-5 shrink-0 text-muted-foreground md:block" />
            <ArrowDown aria-hidden="true" className="size-5 shrink-0 text-muted-foreground md:hidden" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-sm font-medium text-foreground">إلى مخزن</span>
              <WarehouseSelect
                value={destinationId}
                onChange={setSelectedDestinationId}
                source={{ ...warehouses, pickerOptions: destinationOptions }}
                placeholder="اختر مخزن الوجهة"
                disabled={isMoving}
              />
            </div>
          </section>

          {sourceId === null ? (
            <EmptyState
              title="اختر مخزنًا لعرض منتجاته"
              description="بعد اختيار المخزن أضف المتغيرات التي تريد نقلها"
            />
          ) : (
            <div className="grid items-start gap-6 xl:grid-cols-[3fr_2fr]">
              <TransferProductPicker
                key={sourceId}
                warehouseId={sourceId}
                lines={lines}
                disabled={isMoving}
                onToggleLine={toggleLine}
              />
              <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 md:p-5">
                <h2 className="text-base font-semibold text-foreground">
                  سلة النقل <span className="text-muted-foreground">({lines.length})</span>
                </h2>
                {lines.length === 0 ? (
                  <EmptyState
                    title="لم تُضف متغيرات بعد"
                    description="أضف المتغيرات من قائمة المنتجات"
                  />
                ) : (
                  <MoveStockForm
                    key={sourceId}
                    fromWarehouseId={sourceId}
                    lines={lines}
                    destination={{ id: destinationId, onChange: setSelectedDestinationId }}
                    onRemoveLine={removeLine}
                    onShortage={applyShortage}
                    onDone={clearLines}
                    onCancel={clearLines}
                  />
                )}
              </section>
            </div>
          )}
        </>
      )}
    </>
  );
}
