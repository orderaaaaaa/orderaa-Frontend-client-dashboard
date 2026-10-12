'use client';

import { LiaBanSolid } from 'react-icons/lia';
import {
  useShippingCancellationReasons,
  useCreateShippingCancellationReason,
  useDeleteShippingCancellationReason,
} from '@/services/logistics';
import { TagListField } from './TagListField';

export function ShippingCancellationReasonsField() {
  const { data: reasons, isLoading } = useShippingCancellationReasons();
  const { mutate: createReason, isPending: isCreating } = useCreateShippingCancellationReason();
  const {
    mutate: deleteReason,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteShippingCancellationReason();

  return (
    <TagListField
      id="settings-shipping-cancellation-reasons"
      icon={LiaBanSolid}
      title="اسباب الغاء الشحن"
      description="أضف الأسباب التي تظهر عند إلغاء الشحنة"
      placeholder="اكتب السبب"
      isLoading={isLoading}
      items={(reasons ?? []).map((reason) => ({
        key: reason.id,
        label: reason.reasonName,
      }))}
      onAdd={(value) => createReason(value)}
      onRemove={(item) => deleteReason(Number(item.key))}
      isAdding={isCreating}
      removingKey={isDeleting ? deletingId : null}
    />
  );
}
