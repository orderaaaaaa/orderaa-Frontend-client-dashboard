'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { LiaPlusSolid } from 'react-icons/lia';
import clsx from 'clsx';
import BaseModal from './base-modal';
import Input from './Input';
import { Button } from './button';
import { useDebounce } from '@/utils/debounce';
import api from '@/lib/api';

export interface SelectableProduct {
  id: number;
  name: string;
  price: number;
  image?: string;
}

interface ProductsApiResponse {
  data: SelectableProduct[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (products: SelectableProduct[]) => void;
  existingProductIds?: string[];
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  existingProductIds = [],
}: ProductSelectionModalProps) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<SelectableProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = useCallback(
    async (pageNum: number, searchQuery: string, append = false) => {
      try {
        setIsLoading(true);
        const response = await api.get<ProductsApiResponse>('/products', {
          params: {
            page: pageNum,
            limit: 10,
            ...(searchQuery && { search: searchQuery }),
          },
        });

        const data = response.data;
        if (append) {
          setProducts((prev) => [...prev, ...data.data]);
        } else {
          setProducts(data.data);
        }
        setHasNextPage(data.hasNextPage);
        setPage(data.currentPage);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setSelectedIds(new Set());
      fetchProducts(1, debouncedSearch, false);
    }
  }, [isOpen, debouncedSearch, fetchProducts]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isLoading) {
      fetchProducts(page + 1, debouncedSearch, true);
    }
  }, [hasNextPage, isLoading, page, debouncedSearch, fetchProducts]);

  const handleToggle = useCallback((productId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const selected = products.filter((p) => selectedIds.has(p.id));
    onConfirm(selected);
    setSelectedIds(new Set());
    setSearch('');
  }, [products, selectedIds, onConfirm]);

  const handleClose = useCallback(() => {
    setSelectedIds(new Set());
    setSearch('');
    onClose();
  }, [onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="اختر المنتجات"
      onConfirm={handleConfirm}
      confirmText={`اضافة (${selectedIds.size})`}
      confirmIcon={<LiaPlusSolid className="w-5 h-5 text-white" />}
      confirmDisabled={selectedIds.size === 0}
      maxWidth="md:max-w-3xl"
    >
      <div className="flex flex-col">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن المنتج.."
        />

        <div className="bg-[#EAEAEA66] p-4 mt-2 rounded-sm flex text-sm font-semibold">
          <div className="w-1/2 text-center">صور المنتج</div>
          <div className="w-1/2 text-center">الاسم</div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {isLoading && products.length === 0 ? (
            <div className="pb-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="border-b mb-2 border-gray-100 rounded-sm bg-white"
                >
                  <div className="flex items-center p-3">
                    <div className="w-1/2 flex justify-center">
                      <div className="h-12 w-12 rounded-md bg-gray-200 animate-pulse" />
                    </div>
                    <div className="w-1/2 flex justify-center">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="px-3 py-8 text-[#878A99] text-center">
              لا توجد نتائج
            </div>
          ) : (
            <div className="pb-4">
              {products.map((product) => {
                const isAlreadyInTable = existingProductIds.includes(
                  String(product.id),
                );
                const isChecked = selectedIds.has(product.id);

                return (
                  <label
                    key={product.id}
                    className={clsx(
                      'flex items-center p-3 border-b mb-2 border-gray-100 rounded-sm transition-colors',
                      isAlreadyInTable
                        ? 'bg-primary/5 opacity-60 cursor-not-allowed'
                        : isChecked
                          ? 'bg-gray-50 cursor-pointer'
                          : 'bg-white hover:bg-gray-50 cursor-pointer',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked || isAlreadyInTable}
                      onChange={() => handleToggle(product.id)}
                      disabled={isAlreadyInTable}
                      className={clsx(
                        'w-4 h-4 accent-primary shrink-0',
                        isAlreadyInTable ? 'cursor-not-allowed' : 'cursor-pointer',
                      )}
                    />

                    <div className="w-1/2 flex justify-center">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                            لا توجد صورة
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-1/2 text-center font-medium flex flex-col items-center gap-1">
                      <span>{product.name}</span>
                      {isAlreadyInTable && (
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          في الفاتورة
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}

              {hasNextPage && (
                <div className="py-4 text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? 'جاري التحميل...' : 'تحميل المزيد'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
