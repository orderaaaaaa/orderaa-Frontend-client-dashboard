'use client';

import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { ImageIcon, Upload } from 'lucide-react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { uploadFile } from '@/lib/api/upload';
import { cn } from '@/lib/utils';

interface VariantImagePickerProps {
  value: string | null;
  choices: string[];
  onChange: (image: string | null) => void;
  label: string;
  disabled?: boolean;
}

export function VariantImagePicker({
  value,
  choices,
  onChange,
  label,
  disabled = false,
}: VariantImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const options = Array.from(
    new Set([...(value ? [value] : []), ...choices]),
  );

  const pick = (image: string | null) => {
    onChange(image);
    setIsOpen(false);
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('الملف ليس صورة');
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    try {
      const { url } = await uploadFile(file);
      pick(url);
    } catch {
      setUploadError('تعذر رفع الصورة، حاول مرة أخرى');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setUploadError(null);
          setIsOpen(true);
        }}
        aria-label={`صورة ${label}`}
        className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 hover:border-primary disabled:opacity-50"
      >
        {value ? (
          <Image
            src={value}
            alt={`صورة ${label}`}
            fill
            sizes="40px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <ImageIcon className="size-4 text-gray-400" aria-hidden />
        )}
      </button>

      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`صورة ${label}`}
        showFooter={false}
        isLoading={isUploading}
        maxWidth="md:max-w-lg"
      >
        <div className="space-y-4">
          {options.length > 0 ? (
            <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {options.map((image, index) => (
                <li key={image}>
                  <button
                    type="button"
                    onClick={() => pick(image)}
                    aria-pressed={image === value}
                    aria-label={`اختيار الصورة ${index + 1}`}
                    className={cn(
                      'relative block aspect-square w-full overflow-hidden rounded-lg border-2',
                      image === value ? 'border-primary' : 'border-transparent',
                    )}
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="25vw"
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              لا توجد صور محفوظة للمنتج بعد
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-10"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4" />
              {isUploading ? 'جارٍ الرفع...' : 'رفع صورة جديدة'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-10"
              disabled={isUploading || value === null}
              onClick={() => pick(null)}
            >
              بدون صورة
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="اختيار صورة المتغير"
            onChange={(event) => {
              void upload(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          {uploadError && (
            <p role="alert" className="text-sm text-red-500">
              {uploadError}
            </p>
          )}
        </div>
      </BaseModal>
    </>
  );
}
