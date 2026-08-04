import { useState, useEffect, useCallback } from 'react';
import { UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import { useMerchantSettings } from '../hooks/useStoreSettings';
import { ImageUploadField } from '@/components/ui/image-upload-field';

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
  const logoFile = watch('logo');
  const [initialLogo, setInitialLogo] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.logo && !logoFile) {
      setInitialLogo(settings.logo ?? '');
    }
  }, [settings?.logo, logoFile]);

  const currentValue = logoFile || initialLogo;

  const handleChange = useCallback(
    (file: File | null) => {
      if (file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        setValue('logo', dataTransfer.files);
      } else {
        setValue('logo', undefined);
        setInitialLogo(null);
      }
    },
    [setValue],
  );

  return (
    <ImageUploadField
      value={currentValue}
      onChange={handleChange}
      error={errors.logo?.message as string}
      title="شعار المتجر"
      description="قم برفع شعار المتجر الخاص بك لكي يظهر علي بوليصة الشحن"
    />
  );
}
