'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Trash2 } from 'lucide-react';
import { LiaCloudUploadAltSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PRODUCT_EDIT_LIMITS } from '../../types/products';
import { type GalleryItem, nextKey } from './editorModel';

interface ProductImagesFieldProps {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  invalidUrls: string[];
  disabled?: boolean;
}

const itemSrc = (item: GalleryItem) =>
  item.kind === 'url' ? item.url : item.preview;

export function ProductImagesField({
  items,
  onChange,
  invalidUrls,
  disabled = false,
}: ProductImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const previewsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const previews = previewsRef.current;
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const addFiles = (files: File[]) => {
    if (disabled) return;
    const images = files.filter((file) => file.type.startsWith('image/'));
    const rejected = files.length - images.length;
    const room = PRODUCT_EDIT_LIMITS.images - items.length;
    const accepted = images.slice(0, Math.max(0, room));
    const messages: string[] = [];
    if (rejected > 0) messages.push('بعض الملفات ليست صوراً ولم تتم إضافتها');
    if (images.length > accepted.length) {
      messages.push(`الحد الأقصى ${PRODUCT_EDIT_LIMITS.images} صورة للمنتج`);
    }
    setPickError(messages.length > 0 ? messages.join('، ') : null);
    if (accepted.length === 0) return;
    const added: GalleryItem[] = accepted.map((file) => {
      const preview = URL.createObjectURL(file);
      previewsRef.current.add(preview);
      return { key: nextKey('image'), kind: 'file', file, preview };
    });
    onChange([...items, ...added]);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (index: number) => {
    setPickError(null);
    onChange(items.filter((_, i) => i !== index));
  };

  const canAdd = items.length < PRODUCT_EDIT_LIMITS.images && !disabled;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          الصورة الأولى هي الصورة الرئيسية التي تظهر في القائمة والطلبات.
        </p>
        <span className="text-xs text-gray-400">
          {items.length} / {PRODUCT_EDIT_LIMITS.images}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          لا توجد صور لهذا المنتج
        </p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, index) => {
            const invalid =
              item.kind === 'url' && invalidUrls.includes(item.url);
            return (
              <li
                key={item.key}
                className={cn(
                  'flex flex-col overflow-hidden rounded-lg border bg-white',
                  invalid ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200',
                )}
              >
                <div className="relative aspect-square bg-gray-50">
                  <Image
                    src={itemSrc(item)}
                    alt={`صورة المنتج ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                  {index === 0 && (
                    <span className="absolute top-1 start-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                      الرئيسية
                    </span>
                  )}
                  {item.kind === 'file' && (
                    <span className="absolute top-1 end-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                      جديدة
                    </span>
                  )}
                </div>
                {invalid && (
                  <p className="px-2 pt-1 text-xs text-red-600">
                    صورة غير صالحة، احذفها وأعد رفعها
                  </p>
                )}
                <div className="flex items-center justify-between gap-1 p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="touch"
                    disabled={disabled || index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label={`تقديم الصورة ${index + 1}`}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="touch"
                    disabled={disabled || index === 0}
                    onClick={() => move(index, 0)}
                    aria-label={`اجعل الصورة ${index + 1} الرئيسية`}
                    title="اجعلها الرئيسية"
                  >
                    <Star className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="touch"
                    disabled={disabled || index === items.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label={`تأخير الصورة ${index + 1}`}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="touch"
                    disabled={disabled}
                    onClick={() => remove(index)}
                    className="text-red-500 hover:bg-red-50"
                    aria-label={`حذف الصورة ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <Button
          type="button"
          variant="outline"
          className="min-h-10 border-dashed text-primary"
          disabled={!canAdd}
          onClick={() => inputRef.current?.click()}
        >
          <LiaCloudUploadAltSolid className="size-5" />
          إضافة صور
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          aria-label="اختيار صور المنتج"
          onChange={(event) => {
            addFiles(event.target.files ? Array.from(event.target.files) : []);
            event.target.value = '';
          }}
        />
      </div>
      {pickError && (
        <p role="alert" className="text-sm text-red-500">
          {pickError}
        </p>
      )}
    </div>
  );
}
