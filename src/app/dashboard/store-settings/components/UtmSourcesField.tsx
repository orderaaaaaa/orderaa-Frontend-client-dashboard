'use client';

import { LiaTagSolid } from 'react-icons/lia';
import { UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import { TagListField } from './TagListField';

interface UtmSourcesFieldProps {
  watch: UseFormWatch<OrderSettingsFormData>;
  setValue: UseFormSetValue<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
}

export function UtmSourcesField({ watch, setValue, errors }: UtmSourcesFieldProps) {
  const values = watch('utmSources') || [];

  const update = (next: string[]) =>
    setValue('utmSources', next, { shouldValidate: true, shouldDirty: true });

  return (
    <TagListField
      id="settings-utm-sources"
      icon={LiaTagSolid}
      title="مصادر الطلبات"
      description="أضف مصادر الطلبات التي تظهر في صفحة إضافة الطلبات اليدوية"
      placeholder="اكتب المصدر"
      items={values.map((value) => ({ key: value, label: value }))}
      onAdd={(value) => update([...values, value])}
      onRemove={(item) => update(values.filter((value) => value !== item.key))}
      error={errors.utmSources?.message}
    />
  );
}
