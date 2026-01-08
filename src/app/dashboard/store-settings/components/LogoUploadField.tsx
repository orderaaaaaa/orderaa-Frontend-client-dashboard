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
      setPreview(settings.logo);
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
    <div className="w-full md:w-2/3 xl:w-1/2 flex flex-col gap-4 border-b border-gray-100 pb-6">
      <div className="w-full flex items-start gap-2">
        <LiaImageSolid className="w-6 h-6 text-primary mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold leading-tight">شعار المتجر</h3>
          <p className="text-sm text-gray-500">
            قم برفع شعار المتجر الخاص بك لكي يظهر علي بوليصةالشحن
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-4">
        <div
          className={`flex-1 w-full min-h-[120px] border-2 border-dashed rounded-lg transition-all ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 bg-gray-50 hover:border-primary'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-6">
            {preview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-32 object-contain rounded"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveImage();
                  }}
                  className="absolute top-0 right-0 cursor-pointer bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <IoMdClose className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <LiaCloudUploadAltSolid className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  اسحب الصورة وأفلتها هنا
                </p>
                <p className="text-xs text-gray-400">أو</p>
                <span className="text-sm text-primary font-medium mt-1">
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
