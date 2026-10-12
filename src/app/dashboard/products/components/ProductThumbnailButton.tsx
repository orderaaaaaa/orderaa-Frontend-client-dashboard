'use client';

import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/utils';
import type { Product } from '../types/products';
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  productGalleryImages,
} from '../utils/productLinks';

interface ProductThumbnailButtonProps {
  product: Product;
  onOpen: (product: Product) => void;
  className?: string;
}

export function ProductThumbnailButton({
  product,
  onOpen,
  className,
}: ProductThumbnailButtonProps) {
  const images = productGalleryImages(product);
  const src = product.image || images[0] || PRODUCT_IMAGE_PLACEHOLDER;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpen(product);
      }}
      aria-label={`عرض صور ${product.name}`}
      className={cn(
        'relative block shrink-0 overflow-hidden rounded-lg border cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        className,
      )}
    >
      <Image
        src={src}
        alt={images.length > 0 ? product.name : `${product.name} بدون صورة`}
        fill
        sizes="96px"
        className="object-cover"
        unoptimized
      />
      {images.length > 1 && (
        <span className="absolute bottom-1 end-1 rounded-full bg-black/60 px-1.5 text-[10px] font-semibold text-white">
          {images.length}
        </span>
      )}
    </button>
  );
}
