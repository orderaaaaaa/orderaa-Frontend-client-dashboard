'use client';

import React from 'react';
import { ProductDropdownProps } from '@/types/orders';
import { useProductDropdown } from './useProductDropdown';
import { DropdownContent } from './DropdownContent';
import { DropdownInput } from './DropdownInput';

export default function ProductDropdown(props: ProductDropdownProps) {
  const {
    ref,
    isOpen,
    search,
    selectedProducts,
    selectedVariants,
    expandedProductId,
    filteredProducts,
    handlers,
  } = useProductDropdown(props);

  return (
    <div ref={ref} className={props.className || 'w-full'}>
      {props.label && (
        <label className="block mb-1 font-medium text-[16px]">
          {props.label}
        </label>
      )}
      <div className="relative">
        <DropdownInput
          isOpen={isOpen}
          search={search}
          selectedProducts={selectedProducts}
          placeholder={props.placeholder || 'ابحث عن منتج'}
          selectClassName={props.selectClassName}
          placeholderClassName={props.placeholderClassName}
          placeholderStyle={props.placeholderStyle}
          icon={props.icon}
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
