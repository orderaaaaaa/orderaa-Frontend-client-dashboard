'use client';

import { LiaUndoAltSolid } from 'react-icons/lia';
import {
  usePostShippingReasons,
  useCreatePostShippingReason,
  useDeletePostShippingReason,
} from '@/services/logistics';
import { TagListField } from './TagListField';

export function PostShippingReasonsField() {
  const { data: reasons, isLoading } = usePostShippingReasons();
  const { mutate: createReason, isPending: isCreating } = useCreatePostShippingReason();
  const {
    mutate: deleteReason,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeletePostShippingReason();

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
      onAdd={(value) => createReason(value)}
      onRemove={(item) => deleteReason(Number(item.key))}
      isAdding={isCreating}
      removingKey={isDeleting ? deletingId : null}
    />
  );
}
