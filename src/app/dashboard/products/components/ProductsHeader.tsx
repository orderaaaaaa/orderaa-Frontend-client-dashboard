import React from 'react';

function ProductsHeader() {
  return (
    <header className="mb-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-1 h-8 bg-primary rounded-full"></div>
        <h1 className="text-3xl font-bold text-gray-900">صفحة المنتجات</h1>
      </div>
    </header>
  );
}

export default ProductsHeader;
