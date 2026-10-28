'use client';

import { memo } from 'react';

interface AddInvoiceHeaderProps {
  isEdit?: boolean;
  code?: string;
}

const AddInvoiceHeader = memo(({ isEdit = false, code }: AddInvoiceHeaderProps) => {
  return (
    <div className="sm:px-8 py-2">
      <h1 className="ps-2 border-s-4 border-primary text-xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-4">
        {isEdit ? 'تعديل الفاتورة' : 'اضافة فاتورة جديدة'}
      </h1>
      <p className="ps-3 text-base sm:text-2xl text-black/90">
        {isEdit ? (
          <>
            قم بتعديل الفاتورة{' '}
            <span dir="ltr" className="tabular-nums">
              {code}
            </span>
          </>
        ) : (
          'قم بإضافة فاتورة مشتريات جديدة'
        )}
      </p>
    </div>
  );
});

AddInvoiceHeader.displayName = 'AddInvoiceHeader';

export default AddInvoiceHeader;
