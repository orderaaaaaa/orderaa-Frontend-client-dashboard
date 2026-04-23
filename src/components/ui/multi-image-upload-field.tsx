'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LiaTimesSolid,
  LiaCloudUploadAltSolid,
  LiaImagesSolid,
  LiaPlusSolid,
} from 'react-icons/lia';
import clsx from 'clsx';

interface MultiImageUploadFieldProps {
  value?: File[];
  onChange: (files: File[]) => void;
  error?: string;
  title?: string;
  description?: string;
  accept?: string;
  maxSizeLabel?: string;
  maxCount?: number;
  required?: boolean;
}

export function MultiImageUploadField({
  value,
  onChange,
  error,
  title = 'رفع الصور',
  description = 'قم برفع الصور المطلوبة',
  accept = 'image/*',
  maxSizeLabel = '5MB',
  maxCount = 10,
  required = false,
}: MultiImageUploadFieldProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const files = value ?? [];

  useEffect(() => {
    if (files.length === 0) {
      setPreviews([]);
      return;
    }
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const appendFiles = useCallback(
    (incoming: File[]) => {
      const imageFiles = incoming.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) return;
      const combined = [...files, ...imageFiles].slice(0, maxCount);
      onChange(combined);
    },
    [files, maxCount, onChange],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      appendFiles(dropped);
    },
    [appendFiles],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files ? Array.from(e.target.files) : [];
      appendFiles(selected);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [appendFiles],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const next = files.filter((_, i) => i !== index);
      onChange(next);
    },
    [files, onChange],
  );

  const canAddMore = files.length < maxCount;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <LiaImagesSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            {title}
            {required && <span className="text-red-500 ms-1">*</span>}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {description}
          </p>
        </div>
        <span className="text-xs text-gray-400 shrink-0 mt-1">
          {files.length} / {maxCount}
        </span>
      </div>

      <div
        className={clsx(
          'w-full min-h-[140px] sm:min-h-[160px] border-2 border-dashed rounded-xl transition-all p-3 sm:p-4',
          error
            ? 'border-red-500 bg-red-50/30'
            : isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-gray-50/80',
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length === 0 ? (
          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-4 sm:p-6">
            <LiaCloudUploadAltSolid className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-2" />
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              اسحب الصور وأفلتها هنا
            </p>
            <p className="text-xs text-gray-400">أو</p>
            <span className="text-xs sm:text-sm text-primary font-medium mt-1">
              تصفح الملفات
            </span>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
          </label>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {previews.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white"
              >
                <img
                  src={src}
                  alt={`صورة ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="cursor-pointer absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                  aria-label="حذف الصورة"
                >
                  <LiaTimesSolid className="w-3 h-3" />
                </button>
              </div>
            ))}

            {canAddMore && (
              <label className="cursor-pointer aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1">
                <LiaPlusSolid className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500">إضافة</span>
                <input
                  ref={inputRef}
                  type="file"
                  accept={accept}
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </label>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        يرجى اختيار صور بصيغة PNG أو JPG (الحد الأقصى لكل صورة: {maxSizeLabel})
      </p>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
