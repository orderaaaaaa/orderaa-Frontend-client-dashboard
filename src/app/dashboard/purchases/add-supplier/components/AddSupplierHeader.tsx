'use client';

import { memo } from 'react';

const AddSupplierHeader = memo(() => {
  return (
    <div className="sm:px-8 py-2">
      <h1 className="ps-2 border-s-4 border-primary text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
        إضافة مورد جديد
      </h1>
      <p className="ps-3 text-base sm:text-2xl text-black/90">
        قم بإضافة بيانات المورد الجديد
      </p>
    </div>
  );
});

AddSupplierHeader.displayName = 'AddSupplierHeader';

export default AddSupplierHeader;
