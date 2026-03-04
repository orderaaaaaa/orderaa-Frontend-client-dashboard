'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { LiaFileExcelSolid } from 'react-icons/lia';

interface SupplierInvoicesActionsBarProps {
  selectedCount: number;
  isVisible: boolean;
  onExportExcel: () => void;
}

const SupplierInvoicesActionsBar = memo(
  ({ selectedCount, isVisible, onExportExcel }: SupplierInvoicesActionsBarProps) => {
    if (!isVisible || selectedCount === 0) return null;

    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg py-4 px-6">
        <div className="mx-auto overflow-x-auto scrollbar-hide">
          <div className="pb-2 flex flex-row gap-2 items-center justify-center max-w-7xl w-max mx-auto">
            <Button
              variant="outline"
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
              onClick={onExportExcel}
            >
              <LiaFileExcelSolid className="size-5" />
              <span>مشاركة شيت اكسيل</span>
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

SupplierInvoicesActionsBar.displayName = 'SupplierInvoicesActionsBar';

export default SupplierInvoicesActionsBar;
