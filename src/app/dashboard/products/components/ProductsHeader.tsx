'use client';

import React, { useState } from 'react';
import { LiaFileImportSolid, LiaPlusSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { useSyncProducts } from '../hooks/useProduct';
import AddProductModal from './modals/AddProductModal';

function ProductsHeader() {
  const { mutate: syncProducts, isPending } = useSyncProducts();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  return (
    <header className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900">صفحة المنتجات</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAddProductModalOpen(true)}
          >
            <LiaPlusSolid className="size-5" />
            إضافة منتج يدوياً
          </Button>
          <Button onClick={() => syncProducts()} disabled={isPending}>
            {isPending ? (
              <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <LiaFileImportSolid className="size-5" />
            )}
            استيراد المنتجات
          </Button>
        </div>
      </div>

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
      />
    </header>
  );
}

export default ProductsHeader;
