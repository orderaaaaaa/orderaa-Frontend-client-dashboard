'use client';

import React from 'react';
import { LiaFileImportSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { useSyncProducts } from '../hooks/useProduct';

function ProductsHeader() {
  const { mutate: syncProducts, isPending } = useSyncProducts();

  return (
    <header className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900">صفحة المنتجات</h1>
        </div>
        <Button onClick={() => syncProducts()} disabled={isPending}>
          {isPending ? (
            <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <LiaFileImportSolid className="size-5" />
          )}
          استيراد المنتجات
        </Button>
      </div>
    </header>
  );
}

export default ProductsHeader;
