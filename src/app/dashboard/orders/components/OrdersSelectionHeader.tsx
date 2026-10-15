import { Button } from '@/components/ui/button';
import { Scan, ScanLine, X } from 'lucide-react';
import React from 'react';

interface OrdersSelectionHeaderProps {
  totalOrders: number;
  selectMode: boolean;
  selectedCount: number;
  allVisibleSelected: boolean;
  toggleSelectMode: () => void;
  handleSelectAllToggle: () => void;
  setSelectMode: (value: boolean) => void;
}

export const OrdersSelectionHeader: React.FC<OrdersSelectionHeaderProps> =
  React.memo(
    ({
      totalOrders,
      selectMode,
      selectedCount,
      allVisibleSelected,
      toggleSelectMode,
      handleSelectAllToggle,
      setSelectMode,
    }) => (
      <div className="flex flex-col sm:flex-row justify-between gap-2 mt-10 mb-6 select-none">
        <div className="flex justify-center sm:justify-start items-center gap-4">
          <p className="text-gray-700">عدد جميع الطلبات: {totalOrders}</p>
          {selectMode && (
            <Button variant="default" size="sm" onClick={handleSelectAllToggle}>
              {allVisibleSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </Button>
          )}
        </div>

        <div className="flex flex-row items-center justify-center gap-3 text-white">
          {selectMode && selectedCount > 0 && (
            <div className="flex flex-row items-center justify-center gap-2">
              <X
                onClick={() => setSelectMode(false)}
                className="cursor-pointer text-primary h-5 w-5"
              />
              <span className="text-sm text-gray-600">
                تم تحديد {selectedCount} طلب
              </span>
            </div>
          )}
          <Button
            variant="default"
            onClick={toggleSelectMode}
            className="rounded-full px-5"
          >
            <span>تحديد</span>
            {selectMode ? <ScanLine /> : <Scan />}
          </Button>
        </div>
      </div>
    )
  );

OrdersSelectionHeader.displayName = 'OrdersSelectionHeader';
export default OrdersSelectionHeader;
