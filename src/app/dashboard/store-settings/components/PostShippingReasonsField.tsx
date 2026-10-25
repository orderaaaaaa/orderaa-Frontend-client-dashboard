'use client';

import { LiaUndoAltSolid } from 'react-icons/lia';
import {
  useCancellationReasons,
  useCreateCancellationReason,
  useUpdateCancellationReason,
} from '@/services/orders';
import { TagListField } from './TagListField';

export function PostShippingReasonsField() {
  const { data: reasons, isLoading } = useCancellationReasons(true, 'REFUSAL_TO_ACCEPT');
  const { mutate: createReason, isPending: isCreating } = useCreateCancellationReason();
  const {
    mutate: updateReason,
    isPending: isUpdating,
    variables: updatingVariables,
  } = useUpdateCancellationReason();

  return (
    <TagListField
      id="settings-post-shipping-reasons"
      icon={LiaUndoAltSolid}
      title="حالات رفض الاستلام / المرتجع بعد الشحن"
      description="أضف الأسباب التي تظهر عند إلغاء أو إرجاع الطلب بعد خروجه لشركة الشحن"
      placeholder="اكتب السبب"
      isLoading={isLoading}
      items={(reasons ?? []).map((reason) => ({
        key: reason.id,
        label: reason.reasonName,
      }))}
      onAdd={(value) => createReason({ reasonName: value, type: 'REFUSAL_TO_ACCEPT' })}
      onRemove={(item) => updateReason({ id: Number(item.key), payload: { isActive: false } })}
      isAdding={isCreating}
      removingKey={isUpdating ? (updatingVariables?.id ?? null) : null}
    />
  );
}
