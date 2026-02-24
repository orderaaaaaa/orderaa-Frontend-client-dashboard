'use client';

import React, { useState } from 'react';
import { LiaListSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';

import { useGetProducts } from '../hooks/useProduct';
import { useProductStore } from '../store/useProductStore';
import { VariantItem } from '../types/products';
import Input from '@/components/ui/Input';
import ProductAddVariantsModal from './modals/productAddVariants';
import ProductVariantCountsModal from './modals/ProductVariantCountsModal';
import LoadingAnimation from '@/components/ui/loadingAnimation';
import ProductsTableDesktop from './ProductsTableDesktop';
import ProductsTableMobile from './ProductsTableMobile';

function ProductsTable() {
  const {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    setSearch,
    setSortBy,
    setSortOrder,
  } = useProductStore();

  const { data, isLoading, isFetching } = useGetProducts({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });

  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState<{
    id: number;
    variants: VariantItem[];
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldProductId, setSoldProductId] = useState<number | null>(null);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (!data?.data) return;
    setSelectedIds(
      selectedIds.length === data.data.length ? [] : data.data.map((p) => p.id),
    );
  };

  const openSoldModal = (productId: number) => {
    setSoldProductId(productId);
    setShowSoldModal(true);
  };

  const closeSoldModal = () => {
    setShowSoldModal(false);
    setSoldProductId(null);
  };

  const openEditModal = (productId: number, variants: VariantItem[]) => {
    setActiveProduct({ id: productId, variants });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveProduct(null);
  };

  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-[300px]" />
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-[150px]" />
      </div>
      <LoadingAnimation />
    </div>
  );

  const isRefetching = isFetching && !isLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
          <div className="flex gap-2 items-center flex-wrap">
            <Input
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن المنتج"
              className="!px-5 min-w-[300px]"
            />
          </div>

          <Button onClick={() => setShowCheckboxes((prev) => !prev)}>
            <LiaListSolid className="size-5" />
            {showCheckboxes ? 'إخفاء التحديد' : 'تحديد المنتجات'}
          </Button>
        </div>

        {/* Desktop Table */}
        <ProductsTableDesktop
          data={data}
          isRefetching={isRefetching}
          showCheckboxes={showCheckboxes}
          selectedIds={selectedIds}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSort={handleSort}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          openSoldModal={openSoldModal}
          openEditModal={openEditModal}
        />

        {/* Mobile Table */}
        <ProductsTableMobile
          data={data}
          isRefetching={isRefetching}
          showCheckboxes={showCheckboxes}
          selectedIds={selectedIds}
          sortBy={sortBy}
          sortOrder={sortOrder}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
          toggleSelect={toggleSelect}
          openSoldModal={openSoldModal}
          openEditModal={openEditModal}
        />
      </div>

      {showModal && activeProduct && (
        <ProductAddVariantsModal
          productId={activeProduct.id}
          variants={activeProduct.variants}
          isOpen={showModal}
          onClose={closeModal}
        />
      )}
      {showSoldModal && soldProductId && (
        <ProductVariantCountsModal
          productId={soldProductId}
          isOpen={showSoldModal}
          onClose={closeSoldModal}
        />
      )}
    </>
  );
}

export default ProductsTable;
