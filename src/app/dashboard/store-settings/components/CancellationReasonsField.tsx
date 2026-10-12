'use client';

import { LiaHashtagSolid } from 'react-icons/lia';
import { UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import { TagListField } from './TagListField';

interface CancellationReasonsFieldProps {
  watch: UseFormWatch<OrderSettingsFormData>;
  setValue: UseFormSetValue<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
}

export function CancellationReasonsField({ watch, setValue, errors }: CancellationReasonsFieldProps) {
  const values = watch('cancellationReasons') || [];

  const update = (next: string[]) =>
    setValue('cancellationReasons', next, { shouldValidate: true, shouldDirty: true });

  return (
    <TagListField
      id="settings-cancellation-reasons"
      icon={LiaHashtagSolid}
      title="اسباب الغاء الطلب"
      description="أضف الأسباب التي تظهر عند إلغاء الطلب"
      placeholder="اكتب السبب"
      items={values.map((value) => ({ key: value, label: value }))}
      onAdd={(value) => update([...values, value])}
      onRemove={(item) => update(values.filter((value) => value !== item.key))}
      error={errors.cancellationReasons?.message}
    />
  );
}
