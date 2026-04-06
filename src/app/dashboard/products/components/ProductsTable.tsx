'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { LiaObjectGroupSolid, LiaEditSolid } from 'react-icons/lia';
import { Scan, ScanLine, X } from 'lucide-react';
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
  const [select, setSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldProductId, setSoldProductId] = useState<number | null>(null);

  useEffect(() => {
    if (!select) {
      setSelectedIds(new Set());
    }
  }, [select]);

  const showBulkActions = select && selectedIds.size >= 2;

  useEffect(() => {
    if (showBulkActions) {
      document.body.style.paddingBottom = '80px';
    } else {
      document.body.style.paddingBottom = '0px';
    }
    return () => {
      document.body.style.paddingBottom = '0px';
    };
  }, [showBulkActions]);

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

          <div className="flex flex-row items-center justify-center gap-3 text-white">
            {select && selectedIds.size > 0 && (
              <div className="flex flex-row items-center justify-center gap-2">
                <X
                  onClick={() => setSelect(false)}
                  className="cursor-pointer text-primary h-5 w-5"
                />
                <span className="text-sm text-gray-600">
                  تم تحديد {selectedIds.size} منتج
                </span>
              </div>
            )}
            <div
              className="bg-primary flex flex-row items-center justify-center gap-3 px-5 py-2 rounded-full cursor-pointer"
              onClick={() => setSelect(!select)}
            >
              <p>تحديد</p>
              <div>
                {select ? (
                  <ScanLine className="text-white" />
                ) : (
                  <Scan className="text-white" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable<ProductRow>
            columns={columns}
            data={(data?.data as ProductRow[]) || []}
            isLoading={isRefetching}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            selectable={select}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            emptyMessage="لا توجد منتجات"
          />
        </div>

        <ProductsTableMobile
          data={data}
          isRefetching={isRefetching}
          showCheckboxes={select}
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

      {showBulkActions && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg py-4 px-6">
          <div className="mx-auto overflow-x-auto scrollbar-hide">
            <div className="pb-2 flex flex-row gap-2 items-center justify-center max-w-7xl w-max mx-auto">
              <Button
                variant="outline"
                onClick={() => setShowMergeModal(true)}
                className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
              >
                <LiaObjectGroupSolid className="size-5" />
                <span>دمج المنتجات ({selectedIds.size})</span>
              </Button>
            </div>
          </div>
        </div>
      )}

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
            setSelect(false);
          }}
        />
      )}
    </>
  );
}

export default ProductsTable;
