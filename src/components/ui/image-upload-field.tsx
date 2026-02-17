'use client';

import { useState, useEffect, useCallback } from 'react';
import { LiaTimesSolid, LiaCloudUploadAltSolid, LiaImageSolid } from 'react-icons/lia';
import clsx from 'clsx';

interface ImageUploadFieldProps {
  value?: File | FileList | string | null;
  onChange: (file: File | null) => void;
  error?: string;
  title?: string;
  description?: string;
  accept?: string;
  maxSizeLabel?: string;
}

function getFileFromValue(value?: File | FileList | string | null): File | null {
  if (!value) return null;
  if (value instanceof File) return value;
  if (typeof value === 'object' && 'length' in value && value.length > 0) {
    return value[0] instanceof File ? value[0] : null;
  }
  return null;
}

function getStringFromValue(value?: File | FileList | string | null): string | null {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('data:image')) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `data:image/png;base64,${value}`;
}

export function ImageUploadField({
  value,
  onChange,
  error,
  title = 'رفع صورة',
  description = 'قم برفع الصورة المطلوبة',
  accept = 'image/*',
  maxSizeLabel = '5MB',
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const file = getFileFromValue(value);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    const strUrl = getStringFromValue(value);
    if (strUrl) {
      setPreview(strUrl);
      return;
    }

    setPreview(null);
  }, [value]);

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

      const files = e.dataTransfer.files;
      if (files && files[0] && files[0].type.startsWith('image/')) {
        onChange(files[0]);
      }
    },
    [onChange],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
        onChange(files[0]);
      }
    },
    [onChange],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onChange(null);
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <LiaImageSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>

      <div
        className={clsx(
          'w-full min-h-[140px] sm:min-h-[160px] border-2 border-dashed rounded-xl transition-all',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-gray-50/80',
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-4 sm:p-6">
          {preview ? (
            <div className="relative flex items-center justify-center">
              <img
                src={preview}
                alt="Preview"
                className="max-h-28 sm:max-h-32 max-w-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="cursor-pointer absolute -top-2 -left-20 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
              >
                <LiaTimesSolid className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <LiaCloudUploadAltSolid className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-2" />
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                اسحب الصورة وأفلتها هنا
              </p>
              <p className="text-xs text-gray-400">أو</p>
              <span className="text-xs sm:text-sm text-primary font-medium mt-1">
                تصفح الملفات
              </span>
            </div>
          )}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileInputChange}
          />
        </label>
      </div>

      <p className="text-xs text-gray-400">
        يرجى اختيار صورة بصيغة PNG أو JPG (الحد الأقصى: {maxSizeLabel})
      </p>

      {error && <p className="text-red-500 text-base">{error}</p>}
    </div>
  );
}
