'use client';

import React, { useState, useMemo } from 'react';
import { LiaObjectGroupSolid, LiaEditSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

import { useGetProducts } from '../hooks/useProduct';
import { useProductStore } from '../store/useProductStore';
import { Product, VariantItem } from '../types/products';
import Input from '@/components/ui/Input';
import ProductAddVariantsModal from './modals/productAddVariants';
import MergeProductsModal from './modals/MergeProductsModal';
import ProductVariantCountsModal from './modals/ProductVariantCountsModal';
import LoadingAnimation from '@/components/ui/loadingAnimation';
import ProductsTableMobile from './ProductsTableMobile';
import { getTimeAgo } from '@/utils';

type ProductRow = Product & Record<string, unknown>;

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

  const [showModal, setShowModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState<{
    id: number;
    variants: VariantItem[];
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const [showMergeModal, setShowMergeModal] = useState(false);
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

  const columns = useMemo<DataTableColumn<ProductRow>[]>(
    () => [
      {
        key: 'image',
        header: 'صورة المنتج',
        className: 'text-center',
        render: (_val, row) => (
          <img
            src={
              row.image || row.images?.[0] || 'https://placehold.net/600x600.png'
            }
            className="w-20 h-20 mx-auto rounded-lg object-cover border"
          />
        ),
      },
      {
        key: 'name',
        header: 'الاسم',
        sortable: true,
        className: 'text-center',
      },
      {
        key: 'price',
        header: 'السعر',
        sortable: true,
        className: 'text-center',
      },
      {
        key: 'createdAt',
        header: 'تاريخ الإنشاء',
        sortable: true,
        className: 'text-center text-sm text-gray-800',
        render: (val) => getTimeAgo(val as string),
      },
      {
        key: 'totalSold',
        header: 'عدد القطع المباعة',
        sortable: true,
        className: 'text-center',
        render: (_val, row) => (
          <Button
            variant="ghost"
            onClick={() => openSoldModal(row.id as number)}
            className="font-semibold text-gray-800"
          >
            {row.totalSold as number}
          </Button>
        ),
      },
      {
        key: 'edit',
        header: 'تعديل',
        className: 'text-center',
        render: (_val, row) => (
          <Button
            variant="ghost"
            onClick={() =>
              openEditModal(
                row.id as number,
                (row.extraDetails as { variants?: VariantItem[] })?.variants ||
                  [],
              )
            }
            className="text-primary mx-auto"
          >
            <LiaEditSolid className="size-5" />
            تعديل
          </Button>
        ),
      },
      {
        key: 'totalOrders',
        header: 'الطلبات',
        sortable: true,
        className: 'text-center',
        render: (val) => (
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            {val as number}
          </span>
        ),
      },
    ],
    [],
  );

  const selectedArray = useMemo(() => Array.from(selectedIds) as number[], [selectedIds]);

  const isRefetching = isFetching && !isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-[300px]" />
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-[150px]" />
        </div>
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
          <div className="flex gap-2 items-center flex-wrap">
            <Input
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن المنتج"
              className="!px-5 min-w-[300px]"
              inputClassName='bg-white'
            />
          </div>

          {selectedIds.size >= 2 && (
            <Button
              onClick={() => setShowMergeModal(true)}
              className="bg-primary text-white"
            >
              <LiaObjectGroupSolid className="size-5" />
              دمج المنتجات ({selectedIds.size})
            </Button>
          )}
        </div>

        <div className="hidden md:block">
          <DataTable<ProductRow>
            columns={columns}
            data={(data?.data as ProductRow[]) || []}
            isLoading={isRefetching}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            emptyMessage="لا توجد منتجات"
          />
        </div>

        <ProductsTableMobile
          data={data}
          isRefetching={isRefetching}
          showCheckboxes={true}
          selectedIds={selectedArray}
          sortBy={sortBy}
          sortOrder={sortOrder}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
          toggleSelect={(id: number) => {
            const next = new Set(selectedIds);
            if (next.has(id)) {
              next.delete(id);
            } else {
              next.add(id);
            }
            setSelectedIds(next);
          }}
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
      {showMergeModal && selectedIds.size >= 2 && data?.data && (
        <MergeProductsModal
          isOpen={showMergeModal}
          onClose={() => setShowMergeModal(false)}
          products={data.data.filter((p) => selectedIds.has(p.id))}
          onSuccess={() => {
            setSelectedIds(new Set());
          }}
        />
      )}
    </>
  );
}

export default ProductsTable;
