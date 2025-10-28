'use client';

import React from 'react';
import { ProductDropdownProps } from '@/types/orders';
import { useProductDropdown } from './useProductDropdown';
import { DropdownContent } from './DropdownContent';
import { DropdownInput } from './DropdownInput';

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
    expandedProductId,
    filteredProducts,
    handlers,
  } = useProductDropdown();

  return (
    <div ref={ref} className={className}>
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
        {isOpen && (
          <DropdownContent
            filteredProducts={filteredProducts}
            selectedVariants={selectedVariants}
            expandedProductId={expandedProductId}
            onProductClick={handlers.handleProductClick}
            onVariantSelect={handlers.handleVariantSelect}
            onAddProduct={handlers.handleAddProduct}
          />
        )}
      </div>
    </div>
  );
}
