'use client';

import React from 'react';
import { LiaPlusSolid } from 'react-icons/lia';
import { useProductDropdown } from './useProductDropdown';
import { DropdownContent } from './DropdownContent';
import { DropdownInput } from './DropdownInput';
import BaseModal from '../ui/base-modal';
import { MissingAttributesHint } from '../ui/missing-attributes-hint';
import { missingAttributesOfPending } from '@/store/productDropdownStore';

interface ProductDropdownProps {
  label?: string;
  placeholder?: string;
  className?: string;
  selectClassName?: string;
  placeholderClassName?: string;
  placeholderStyle?: React.CSSProperties;
  icon?: React.ComponentType<{ size?: number }>;
}

export default function ProductDropdown({
  label,
  placeholder = 'ابحث عن منتج',
  className = 'w-full',
  selectClassName,
  placeholderClassName,
  placeholderStyle,
  icon,
}: ProductDropdownProps) {
  const {
    ref,
    isOpen,
    search,
    selectedProducts,
    selectedVariants,
    pendingSelections,
    expandedProductId,
    products,
    isLoading,
    loadError,
    hasNextPage,
    handlers,
  } = useProductDropdown();

  const pendingSelectionsCount = Object.keys(selectedVariants).length;
  const incompleteSelections = Object.values(pendingSelections)
    .map((pending) => ({
      productId: pending.product.id,
      productName: pending.product.name,
      missing: missingAttributesOfPending(pending),
    }))
    .filter((selection) => selection.missing.length > 0);

  return (
    <div ref={ref} className={`${className}`}>
      {label && (
        <label className="block mb-4 font-medium text-[16px]">{label}</label>
      )}
      <div className="relative">
        <DropdownInput
          isOpen={isOpen}
          search={search}
          selectedProducts={selectedProducts}
          placeholder={placeholder}
          selectClassName={selectClassName}
          placeholderClassName={placeholderClassName}
          placeholderStyle={placeholderStyle}
          icon={icon}
          onToggle={handlers.handleToggleDropdown}
          onSearchChange={handlers.handleSearchChange}
          onSearchFocus={handlers.handleSearchFocus}
        />

        <BaseModal
          isOpen={isOpen}
          onClose={handlers.handleToggleDropdown}
          title="اختر المنتجات"
          onConfirm={handlers.handleAddProduct}
          confirmText={`إضافة (${pendingSelectionsCount})`}
          confirmIcon={<LiaPlusSolid className="w-5 h-5 text-white" />}
          confirmDisabled={
            pendingSelectionsCount === 0 || incompleteSelections.length > 0
          }
          maxWidth="md:max-w-5xl"
        >
          <DropdownContent
            products={products}
            selectedVariants={selectedVariants}
            selectedProducts={selectedProducts}
            expandedProductId={expandedProductId}
            onProductClick={handlers.handleProductClick}
            onVariantSelect={handlers.handleVariantSelect}
            onAddProductWithoutVariants={handlers.handleAddProductWithoutVariants}
            onRemoveProductFromPending={handlers.handleRemoveProductFromPending}
            search={search}
            onSearchChange={handlers.handleSearchChange}
            isLoading={isLoading}
            loadError={loadError}
            onRetry={handlers.handleRetry}
            hasNextPage={hasNextPage}
            onLoadMore={handlers.handleLoadMore}
          />
          {incompleteSelections.length > 0 && (
            <div className="mt-3 flex flex-col gap-1 px-0 sm:px-4">
              {incompleteSelections.map((selection) => (
                <MissingAttributesHint
                  key={selection.productId}
                  productName={selection.productName}
                  missing={selection.missing}
                />
              ))}
            </div>
          )}
        </BaseModal>
      </div>
    </div>
  );
}
