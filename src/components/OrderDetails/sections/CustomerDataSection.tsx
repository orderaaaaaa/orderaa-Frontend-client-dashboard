import React, { useState } from 'react';
import { LiaUserSolid } from 'react-icons/lia';
import { EditableTextField } from '../fields/EditableTextField';
import { PhoneNumberList } from '../fields/PhoneNumberList';
import { Order } from '@/types/orders';
import { useUpdateCustomer } from '@/services/orders';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES, PERMISSIONS } from '@/lib/permissions';
import { toast } from 'react-toastify';
import { If, Then } from 'react-if';
import { MdBlock } from 'react-icons/md';
import BaseModal from '@/components/ui/base-modal';
import CustomerMergeModal from '../CustomerMergeModal';
import {
  MergeableCustomer,
  PhoneConflictDetails,
} from '@/app/dashboard/customers/types/merge';

/**
 * `order.customers` (the currently-edited customer) → the shape the shared
 * merge popup renders. `notes` on `Order['customers']` can be a single
 * string (legacy) or the real `string[]` the backend actually returns —
 * normalise both into an array.
 */
function toMergeableCustomer(customer: Order['customers']): MergeableCustomer {
  const notes = Array.isArray(customer.notes)
    ? customer.notes
    : customer.notes
      ? [customer.notes]
      : [];

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email ?? undefined,
    phoneNumbers: customer.phone_numbers ?? [],
    notes,
    isBlocked: customer.isBlocked ?? false,
    blockedUntil: customer.blockedUntil ?? null,
    ordersCount: customer.totalCustomerOrders ?? 0,
  };
}

export interface CustomerDataSectionProps {
  order: Order;
  onUpdate: (field: string, value: any) => Promise<Order>;
  onPhoneUpdate?: (phoneNumbers: string[]) => void;
  className?: string;
}

export function CustomerDataSection({
  order,
  onUpdate,
  onPhoneUpdate,
  className = '',
}: CustomerDataSectionProps) {
  const updateCustomerMutation = useUpdateCustomer();
  const { hasPermission } = usePermissionCheck();
  // Customer name / phones go to PATCH /customers/:id (`customers:update`),
  // the order note goes to PATCH /orders/:id (`orders:update`).
  const canUpdateCustomer = hasPermission(PERMISSION_CODES.CUSTOMERS_UPDATE);
  const canUpdateOrder = hasPermission(PERMISSION_CODES.ORDERS_UPDATE);
  const canMergeCustomers = hasPermission(PERMISSIONS.CUSTOMERS_MERGE);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [mergeConflict, setMergeConflict] = useState<PhoneConflictDetails | null>(
    null
  );

  // A phone edit hit a duplicate on another customer (T4). Without
  // `customers:merge` there is nothing the user could do with a merge popup
  // — the backend would 403 the merge anyway — so fall back to the original
  // toast instead of opening a dead-end dialog.
  const handlePhoneConflict = (conflict: PhoneConflictDetails) => {
    if (canMergeCustomers) {
      setMergeConflict(conflict);
    } else {
      toast.error('رقم الهاتف مستخدم بالفعل من قبل عميل آخر');
    }
  };

  const handleCustomerNameUpdate = async (name: string) => {
    try {
      await updateCustomerMutation.mutateAsync({
        customerId: order.customers.id,
        data: { name },
      });

      toast.success('تم تحديث اسم العميل بنجاح');
    } catch (error) {
      const message =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message
          : null;
      toast.error(message || 'فشل في تحديث اسم العميل');
      throw error;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-3 left-3">
        <If condition={order.customers.isBlocked}>
          <Then>
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className="flex items-center gap-1 p-1 px-3 bg-[#f4e2e2] border-2 border-[#eed0d1] rounded-sm cursor-pointer hover:bg-[#f0d4d4] transition-colors"
            >
              <MdBlock size={18} className="text-[#dc0201]" />
              <span className="text-[#dc0201] text-sm lg:text-base font-medium">
                العميل محظور
              </span>
            </button>
          </Then>
        </If>
      </div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-primary font-semibold">بيانات العميل</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EditableTextField
          label="اسم العميل"
          value={order.customers.name}
          icon={LiaUserSolid}
          onSave={handleCustomerNameUpdate}
          canEdit={canUpdateCustomer}
        />

        <PhoneNumberList
          customerId={order.customers.id}
          orderId={order.id}
          phoneNumbers={order.customers.phone_numbers}
          onUpdate={onPhoneUpdate}
          canEdit={canUpdateCustomer}
          onConflict={handlePhoneConflict}
        />

        <div className="md:col-span-4">
          <EditableTextField
            label="ملاحظات"
            value={order.notes}
            onSave={async (value) => {
              await onUpdate('notes', value);
            }}
            multiline
            canEdit={canUpdateOrder}
          />
        </div>
      </div>

      <BaseModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        title="ملاحظات العميل"
        showFooter={false}
      >
        <div className="flex flex-col gap-3">
          {order.customers.notes && (Array.isArray(order.customers.notes) ? order.customers.notes.length > 0 : order.customers.notes.trim().length > 0) ? (
            Array.isArray(order.customers.notes) ? (
              order.customers.notes.map((note, index) => (
                <p key={index} className="text-base text-[#1F1F1F] whitespace-pre-wrap">{note}</p>
              ))
            ) : (
              <p className="text-base text-[#1F1F1F] whitespace-pre-wrap">{order.customers.notes}</p>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <MdBlock size={40} className="text-gray-300" />
              <p className="text-base text-gray-400">لا توجد ملاحظات لهذا العميل</p>
            </div>
          )}
        </div>
      </BaseModal>

      {mergeConflict && (
        <CustomerMergeModal
          isOpen={!!mergeConflict}
          onClose={() => setMergeConflict(null)}
          customerA={toMergeableCustomer(order.customers)}
          customerB={mergeConflict.customer}
          onSuccess={() => setMergeConflict(null)}
        />
      )}
    </div>
  );
}
