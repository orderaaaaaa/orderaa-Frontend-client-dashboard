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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop (not modal content)
    if (e.target === e.currentTarget) {
      handlers.handleToggleDropdown();
    }
  };

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

        {/* Modal Overlay and Content */}
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black opacity-50 z-40"
              onClick={handleBackdropClick}
            />

            {/* Modal Content */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-5xl max-h-[80vh] overflow-hidden rounded-3xl">
              <DropdownContent
                filteredProducts={filteredProducts}
                selectedVariants={selectedVariants}
                expandedProductId={expandedProductId}
                onProductClick={handlers.handleProductClick}
                onVariantSelect={handlers.handleVariantSelect}
                onAddProduct={handlers.handleAddProduct}
                search={search}
                onSearchChange={handlers.handleSearchChange}
                onClose={handlers.handleToggleDropdown}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
