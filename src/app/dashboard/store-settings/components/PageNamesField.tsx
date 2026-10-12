'use client';

import { LiaFileAltSolid } from 'react-icons/lia';
import { UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import { TagListField } from './TagListField';

interface PageNamesFieldProps {
  watch: UseFormWatch<OrderSettingsFormData>;
  setValue: UseFormSetValue<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
}

export function PageNamesField({ watch, setValue, errors }: PageNamesFieldProps) {
  const values = watch('pageNames') || [];

  const update = (next: string[]) =>
    setValue('pageNames', next, { shouldValidate: true, shouldDirty: true });

  return (
    <TagListField
      id="settings-page-names"
      icon={LiaFileAltSolid}
      title="أسماء الصفحات"
      description="أضف أسماء الصفحات التي تظهر في صفحة إضافة الطلبات اليدوية"
      placeholder="اكتب اسم الصفحة"
      items={values.map((value) => ({ key: value, label: value }))}
      onAdd={(value) => update([...values, value])}
      onRemove={(item) => update(values.filter((value) => value !== item.key))}
      error={errors.pageNames?.message}
    />
  );
}
