'use client';

import { LiaBanSolid } from 'react-icons/lia';
import {
  useCancellationReasons,
  useCreateCancellationReason,
  useUpdateCancellationReason,
} from '@/services/orders';
import { TagListField } from './TagListField';

export function ShippingCancellationReasonsField() {
  const { data: reasons, isLoading } = useCancellationReasons(true, 'SHIPPING_CANCELLATION');
  const { mutate: createReason, isPending: isCreating } = useCreateCancellationReason();
  const {
    mutate: updateReason,
    isPending: isUpdating,
    variables: updatingVariables,
  } = useUpdateCancellationReason();

  return (
    <TagListField
      id="settings-shipping-cancellation-reasons"
      icon={LiaBanSolid}
      title="أسباب إلغاء الشحن"
      description="أضف الأسباب التي تظهر عند إلغاء الشحنة"
      placeholder="اكتب السبب"
      isLoading={isLoading}
      items={(reasons ?? []).map((reason) => ({
        key: reason.id,
        label: reason.reasonName,
      }))}
      onAdd={(value) => createReason({ reasonName: value, type: 'SHIPPING_CANCELLATION' })}
      onRemove={(item) => updateReason({ id: Number(item.key), payload: { isActive: false } })}
      isAdding={isCreating}
      removingKey={isUpdating ? (updatingVariables?.id ?? null) : null}
    />
  );
}
