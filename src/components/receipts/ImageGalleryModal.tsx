'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /**
   * Already-resolved upload URLs. They are stored and validated by the uploads
   * scheme, so they are rendered as given and never constructed here.
   */
  images: string[];
}

/**
 * Pages through several images rather than showing only the first — code
 * sheets are an array and routinely hold more than one.
 *
 * Built as a shared component because T12's pickup page is the same shape with
 * one image field instead of two.
 */
export function ImageGalleryModal({
  isOpen,
  onClose,
  title,
  images,
}: ImageGalleryModalProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (isOpen) setIndex(0);
  }, [isOpen]);

  const total = images.length;
  const current = images[Math.min(index, Math.max(0, total - 1))];

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} showFooter={false}>
      {total === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">
          لا توجد صور مرفقة
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="relative w-full h-[60vh] bg-gray-50 rounded-lg overflow-hidden">
            <Image
              src={current}
              alt={`${title} ${index + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {total > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </Button>

              <span className="text-xs text-gray-500">
                {index + 1} / {total}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={index >= total - 1}
                onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </BaseModal>
  );
}
