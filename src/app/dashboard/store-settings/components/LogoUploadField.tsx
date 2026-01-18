import { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { LiaCloudUploadAltSolid, LiaImageSolid } from 'react-icons/lia';

import { UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
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
    <div className="w-full max-w-full md:w-2/3 xl:w-1/2 flex flex-col gap-4 border-b border-gray-100 pb-6 min-w-0">
      <div className="w-full max-w-full flex items-start gap-2 min-w-0">
        <LiaImageSolid className="w-6 h-6 text-primary mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold leading-tight break-words">شعار المتجر</h3>
          <p className="text-xs sm:text-sm text-gray-500 break-words">
            قم برفع شعار المتجر الخاص بك لكي يظهر علي بوليصةالشحن
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-4 w-full max-w-full min-w-0">
        <div
          className={`flex-1 w-full max-w-full min-h-[120px] border-2 border-dashed rounded-lg transition-all overflow-hidden ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 bg-gray-50 hover:border-primary'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 min-w-0">
            {preview ? (
              <div className="relative w-full h-full flex items-center justify-center min-w-0 max-w-full">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-32 max-w-full object-contain rounded"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveImage();
                  }}
                  className="absolute top-0 right-0 cursor-pointer bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shrink-0"
                >
                  <IoMdClose className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center min-w-0 max-w-full">
                <LiaCloudUploadAltSolid className="w-10 h-10 text-gray-400 mb-2 shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 mb-1 break-words px-2">
                  اسحب الصورة وأفلتها هنا
                </p>
                <p className="text-xs text-gray-400">أو</p>
                <span className="text-xs sm:text-sm text-primary font-medium mt-1 break-words">
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
      </div>

      <div className="text-xs text-gray-400">
        يرجى اختيار صورة بصيغة PNG أو JPG (الحد الأقصى: 5MB)
      </div>

      {errors.logo && (
        <p className="text-red-500 text-xs">{errors.logo.message as string}</p>
      )}
    </div>
  );
}
