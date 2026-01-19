import { useState, useEffect } from 'react';
import { LiaTimesSolid, LiaCloudUploadAltSolid, LiaImageSolid } from 'react-icons/lia';
import { UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import clsx from 'clsx';
import { OrderSettingsFormData } from '../schemas/store';
import { useMerchantSettings } from '../hooks/useStoreSettings';

interface LogoUploadFieldProps {
  watch: UseFormWatch<OrderSettingsFormData>;
  setValue: UseFormSetValue<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
}

function formatBase64Image(base64: string): string {
  if (!base64) return '';
  if (base64.startsWith('data:image')) return base64;
  if (base64.startsWith('http://') || base64.startsWith('https://')) return base64;
  return `data:image/png;base64,${base64}`;
}

export function LogoUploadField({
  watch,
  setValue,
  errors,
}: LogoUploadFieldProps) {
  const { settings } = useMerchantSettings();
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const logoFile = watch('logo');

  useEffect(() => {
    if (settings?.logo && !logoFile) {
      setPreview(formatBase64Image(settings.logo));
    }
  }, [settings?.logo, logoFile]);

  useEffect(() => {
    if (logoFile && logoFile[0] instanceof File) {
      const objectUrl = URL.createObjectURL(logoFile[0]);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [logoFile]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileChange(file);
      }
    }
  };

  const handleFileChange = (file: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    setValue('logo', dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setValue('logo', undefined);
    setPreview(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <LiaImageSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            شعار المتجر
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            قم برفع شعار المتجر الخاص بك لكي يظهر علي بوليصة الشحن
          </p>
        </div>
      </div>

      <div
        className={clsx(
          'w-full min-h-[140px] sm:min-h-[160px] border-2 border-dashed rounded-xl transition-all',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-gray-50/80'
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
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveImage();
                }}
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
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </label>
      </div>

      <p className="text-xs text-gray-400">
        يرجى اختيار صورة بصيغة PNG أو JPG (الحد الأقصى: 5MB)
      </p>

      {errors.logo && (
        <p className="text-red-500 text-base">{errors.logo.message as string}</p>
      )}
    </div>
  );
}
