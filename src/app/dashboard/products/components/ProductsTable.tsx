'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LiaObjectGroupSolid, LiaEditSolid } from 'react-icons/lia';
import { PackageSearch, Scan, ScanLine, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { ImageGalleryModal } from '@/components/receipts/ImageGalleryModal';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/lib/permissions';
import { useDebounce } from '@/utils/debounce';

import {
  useGetProducts,
  usePendingConfirmOutOfStockIds,
  useStoreConfirmOutOfStock,
  useUpdateProductConfirmOutOfStock,
} from '../hooks/useProduct';
import { ConfirmOutOfStockControl } from './ConfirmOutOfStockControl';
import { useProductStore } from '../store/useProductStore';
import { Product } from '../types/products';
import Input from '@/components/ui/Input';
import MergeProductsModal from './modals/MergeProductsModal';
import ProductVariantCountsModal from './modals/ProductVariantCountsModal';
import LoadingAnimation from '@/components/ui/loadingAnimation';
import ProductsTableMobile from './ProductsTableMobile';
import { ProductThumbnailButton } from './ProductThumbnailButton';
import { productEditHref, productGalleryImages } from '../utils/productLinks';
import { getTimeAgo } from '@/utils';
import { FIXED_BOTTOM_BAR_CLASS } from '@/constants/dashboard-layout';

type ProductRow = Product & Record<string, unknown>;

const SEARCH_DEBOUNCE_MS = 400;

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

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedSearch !== search) setSearch(debouncedSearch);
  }, [debouncedSearch, search, setSearch]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetProducts({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });

  const storeConfirmMode = useStoreConfirmOutOfStock();
  const { mutate: saveConfirmOutOfStock } = useUpdateProductConfirmOutOfStock();
  const pendingConfirmIds = usePendingConfirmOutOfStockIds();

  const [select, setSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const [selectedProductsMap, setSelectedProductsMap] = useState<
    Map<number, Product>
  >(new Map());
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldProductId, setSoldProductId] = useState<number | null>(null);
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!select) {
      setSelectedIds(new Set());
      setSelectedProductsMap(new Map());
    }
  }, [select]);

  const handleSelectionChange = useCallback(
    (ids: Set<string | number>) => {
      setSelectedIds(ids);
      setSelectedProductsMap((prev) => {
        const next = new Map(prev);
        for (const key of next.keys()) {
          if (!ids.has(key)) next.delete(key);
        }
        for (const id of ids) {
          const numericId = Number(id);
          if (!next.has(numericId)) {
            const product = (data?.data ?? []).find((p) => p.id === numericId);
            if (product) next.set(numericId, product);
          }
        }
        return next;
      });
    },
    [data],
  );

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

  const columns = useMemo<DataTableColumn<ProductRow>[]>(
    () => [
      {
        key: 'image',
        header: 'صورة المنتج',
        className: 'text-center',
        render: (_val, row) => (
          <ProductThumbnailButton
            product={row}
            onOpen={setGalleryProduct}
            className="w-20 h-20 mx-auto"
          />
        ),
      },
      {
        key: 'name',
        header: 'الاسم',
        sortable: true,
        className: 'text-center',
        render: (_val, row) => (
          <span className="font-semibold text-foreground break-words">
            {row.name}
          </span>
        ),
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
            onClick={() => openSoldModal(row.id)}
            className="font-semibold text-gray-800"
            aria-label={`تفاصيل القطع المباعة من ${row.name}`}
          >
            {row.totalSold}
          </Button>
        ),
      },
      {
        key: 'confirmOutOfStock',
        header: 'تأكيد بدون مخزون',
        className: 'text-center',
        render: (_val, row) => (
          <div
            className="mx-auto w-[200px] text-right"
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            <ConfirmOutOfStockControl
              value={row.confirmOutOfStockMode}
              storeMode={storeConfirmMode}
              disabled={pendingConfirmIds.includes(row.id)}
              onChange={(confirmOutOfStockMode) =>
                saveConfirmOutOfStock({
                  productId: row.id,
                  confirmOutOfStockMode,
                })
              }
            />
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'الإجراءات',
        className: 'text-center',
        render: (_val, row) => (
          <Can code={PERMISSIONS.PRODUCTS_UPDATE}>
            <Button asChild variant="ghost" className="text-primary">
              <Link href={productEditHref(row.id)}>
                <LiaEditSolid className="size-5" />
                تعديل المنتج
              </Link>
            </Button>
          </Can>
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
    [storeConfirmMode, pendingConfirmIds, saveConfirmOutOfStock],
  );

  const selectedArray = useMemo(() => Array.from(selectedIds) as number[], [selectedIds]);

  const isRefetching = isFetching && !isLoading;
  const emptyContent = (
    <EmptyState
      icon={<PackageSearch className="size-10 text-gray-300" aria-hidden />}
      title={search ? 'لا توجد منتجات تطابق البحث' : 'لا توجد منتجات'}
      className="py-6"
    />
  );

  const toolbar = (
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
      <Input
        name="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="ابحث عن المنتج"
        aria-label="ابحث عن المنتج"
        className="w-full sm:w-auto sm:min-w-[300px]"
        inputClassName="bg-white !px-5"
      />

      <div className="flex flex-row items-center justify-end gap-3">
        {select && selectedIds.size > 0 && (
          <div className="flex flex-row items-center justify-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="touch"
              onClick={() => setSelect(false)}
              aria-label="إلغاء التحديد"
              className="text-primary"
            >
              <X className="h-5 w-5" />
            </Button>
            <span className="text-sm text-gray-600">
              تم تحديد {selectedIds.size} منتج
            </span>
          </div>
        )}
        <button
          type="button"
          aria-pressed={select}
          onClick={() => setSelect(!select)}
          className="bg-primary text-white flex flex-row items-center justify-center gap-3 px-5 min-h-10 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
        >
          <span>تحديد</span>
          {select ? (
            <ScanLine className="text-white" aria-hidden />
          ) : (
            <Scan className="text-white" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full sm:w-[300px]" />
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-[150px]" />
        </div>
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {toolbar}

        {isError && !data ? (
          <ErrorState
            error={error}
            fallback="تعذر تحميل المنتجات"
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <div className="hidden lg:block">
              <DataTable<ProductRow>
                columns={columns}
                data={(data?.data as ProductRow[]) || []}
                isLoading={isRefetching}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                selectable={select}
                selectedIds={selectedIds}
                onSelectionChange={handleSelectionChange}
                emptyContent={emptyContent}
              />
            </div>

            <ProductsTableMobile
              products={data?.data ?? []}
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
                handleSelectionChange(next);
              }}
              openSoldModal={openSoldModal}
              openGallery={setGalleryProduct}
              emptyContent={emptyContent}
            />
          </>
        )}
      </div>

      {showBulkActions && (
        <div
          className={`${FIXED_BOTTOM_BAR_CLASS} bg-white border-t border-gray-200 shadow-lg py-4 px-6`}
        >
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

      {showSoldModal && soldProductId && (
        <ProductVariantCountsModal
          productId={soldProductId}
          isOpen={showSoldModal}
          onClose={closeSoldModal}
        />
      )}
      {showMergeModal && selectedProductsMap.size >= 2 && (
        <MergeProductsModal
          isOpen={showMergeModal}
          onClose={() => setShowMergeModal(false)}
          products={Array.from(selectedProductsMap.values())}
          onSuccess={() => {
            setSelectedIds(new Set());
            setSelectedProductsMap(new Map());
            setSelect(false);
          }}
        />
      )}

      <ImageGalleryModal
        isOpen={galleryProduct !== null}
        onClose={() => setGalleryProduct(null)}
        title={galleryProduct?.name ?? ''}
        images={galleryProduct ? productGalleryImages(galleryProduct) : []}
        actions={
          galleryProduct && (
            <Can code={PERMISSIONS.PRODUCTS_UPDATE}>
              <Button asChild className="min-h-10">
                <Link href={productEditHref(galleryProduct.id)}>
                  <LiaEditSolid className="size-5" />
                  تعديل المنتج
                </Link>
              </Button>
            </Can>
          )
        }
      />
    </>
  );
}

export default ProductsTable;
