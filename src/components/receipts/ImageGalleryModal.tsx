'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  actions?: ReactNode;
  initialIndex?: number;
}

const SWIPE_THRESHOLD = 40;

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
  actions,
  initialIndex = 0,
}: ImageGalleryModalProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) setIndex(Math.max(0, initialIndex));
  }, [isOpen, initialIndex]);

  const total = images.length;
  const safeIndex = Math.min(index, Math.max(0, total - 1));
  const current = images[safeIndex];

  const goPrevious = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1));

  useEffect(() => {
    if (!isOpen || total < 2) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setIndex((i) => Math.min(total - 1, i + 1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, total]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    const end = event.changedTouches[0]?.clientX;
    if (start === null || end === undefined || total < 2) return;
    const delta = end - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta > 0) goNext();
    else goPrevious();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} showFooter={false}>
      {total === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">
          لا توجد صور مرفقة
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className="relative w-full h-[60vh] bg-gray-50 rounded-lg overflow-hidden touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={current}
              alt={`${title} ${safeIndex + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {total > 1 && (
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                className="min-h-11 min-w-11 px-3"
                disabled={safeIndex === 0}
                onClick={goPrevious}
                aria-label="الصورة السابقة"
              >
                <ChevronRight className="w-4 h-4" />
                <span className="max-sm:sr-only">السابق</span>
              </Button>

              <span className="text-xs text-gray-500" aria-live="polite">
                {safeIndex + 1} / {total}
              </span>

              <Button
                variant="outline"
                className="min-h-11 min-w-11 px-3"
                disabled={safeIndex >= total - 1}
                onClick={goNext}
                aria-label="الصورة التالية"
              >
                <span className="max-sm:sr-only">التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      {actions && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">{actions}</div>
      )}
    </BaseModal>
  );
}
