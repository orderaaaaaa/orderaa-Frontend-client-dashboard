'use client';

import React, { useEffect, useState } from 'react';
import { LiaCheckSolid, LiaUserCheckSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import { useMergeCustomersMutation } from '@/app/dashboard/customers/hooks/useMergeCustomers';
import { MergeableCustomer } from '@/app/dashboard/customers/types/merge';
import { CustomerId } from '@/app/dashboard/customers/types/customerId';
import { getApiErrorMessage } from '@/utils/apiError';

export interface CustomerMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The two candidates. Whichever the user picks becomes the merge target. */
  customerA: MergeableCustomer;
  customerB: MergeableCustomer;
  onSuccess?: (merged: CustomerId) => void;
}

/** ISO date string (or null) → `yyyy-mm-dd` for a native date input. */
function toDateInputValue(value: string | null): string {
  return value ? value.slice(0, 10) : '';
}

function CustomerSummaryCard({
  customer,
  isSurvivor,
  onSelect,
}: {
  customer: MergeableCustomer;
  isSurvivor: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-right w-full rounded-xl border-2 p-4 space-y-2 transition-colors ${
        isSurvivor
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-gray-900 truncate">{customer.name}</span>
        {isSurvivor && (
          <span className="flex items-center gap-1 text-xs font-medium text-primary flex-shrink-0">
            <LiaUserCheckSolid className="w-4 h-4" />
            سيبقى بعد الدمج
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 truncate">
        {customer.email || 'لا يوجد بريد إلكتروني'}
      </p>
      <p className="text-sm text-gray-500">
        {customer.phoneNumbers.length > 0
          ? customer.phoneNumbers.join(' · ')
          : 'لا توجد أرقام هاتف'}
      </p>
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
          {customer.ordersCount} طلب
        </span>
        <span
          className={`px-2 py-0.5 rounded-full ${
            customer.isBlocked
              ? 'bg-red-50 text-red-600'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {customer.isBlocked ? 'محظور' : 'غير محظور'}
        </span>
      </div>
      {customer.notes.length > 0 && (
        <div className="text-xs text-gray-400 space-y-0.5 pt-1 border-t border-dashed border-gray-200">
          {customer.notes.map((note, i) => (
            <p key={i} className="truncate">
              {note}
            </p>
          ))}
        </div>
      )}
    </button>
  );
}

/**
 * Shared merge popup for T4 — both entry points (the phone conflict on the
 * order page, and selecting two customers on the Customers page) render this
 * same component. The user picks which record survives (the target), may
 * edit the survivor's name/email, decides the blocked state explicitly
 * (never an automatic rule), then confirms. The other record is deleted.
 */
export default function CustomerMergeModal({
  isOpen,
  onClose,
  customerA,
  customerB,
  onSuccess,
}: CustomerMergeModalProps) {
  const [survivorId, setSurvivorId] = useState(customerA.id);
  const [name, setName] = useState(customerA.name);
  const [email, setEmail] = useState(customerA.email || '');
  const [isBlocked, setIsBlocked] = useState(customerA.isBlocked);
  const [blockedUntil, setBlockedUntil] = useState(
    toDateInputValue(customerA.blockedUntil)
  );
  const [error, setError] = useState('');

  // Reset everything to customer A whenever the popup is (re)opened, or a
  // different pair is passed in — mirrors EditCustomerModal's reset-on-open
  // convention (`useEffect` keyed on `isOpen`).
  useEffect(() => {
    if (!isOpen) return;
    setSurvivorId(customerA.id);
    setName(customerA.name);
    setEmail(customerA.email || '');
    setIsBlocked(customerA.isBlocked);
    setBlockedUntil(toDateInputValue(customerA.blockedUntil));
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, customerA.id, customerB.id]);

  const survivor = survivorId === customerA.id ? customerA : customerB;
  const loser = survivorId === customerA.id ? customerB : customerA;

  const handleSelectSurvivor = (candidate: MergeableCustomer) => {
    setSurvivorId(candidate.id);
    setName(candidate.name);
    setEmail(candidate.email || '');
    setIsBlocked(candidate.isBlocked);
    setBlockedUntil(toDateInputValue(candidate.blockedUntil));
  };

  const { mutate, isPending } = useMergeCustomersMutation({
    onSuccess: (data) => {
      toast.success('تم دمج العملاء بنجاح');
      onSuccess?.(data);
      onClose();
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, 'حدث خطأ أثناء دمج العملاء'));
    },
  });

  const handleConfirm = () => {
    if (!name.trim()) {
      setError('اسم العميل مطلوب');
      return;
    }
    setError('');
    mutate({
      targetCustomerId: survivor.id,
      payload: {
        sourceCustomerId: [loser.id],
        name: name.trim(),
        email: email.trim() || undefined,
        isBlocked,
        blockedUntil: isBlocked
          ? blockedUntil
            ? new Date(blockedUntil).toISOString()
            : null
          : null,
      },
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="دمج العملاء المكررين"
      onConfirm={handleConfirm}
      confirmText="تأكيد الدمج"
      confirmIcon={<LiaCheckSolid className="w-5 h-5 text-white" />}
      isLoading={isPending}
      confirmDisabled={isPending}
      maxWidth="md:max-w-3xl"
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-gray-600">
          اختر السجل الذي سيبقى بعد الدمج. يمكنك تعديل الاسم والبريد الإلكتروني
          وتحديد حالة الحظر للسجل الباقي قبل التأكيد.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomerSummaryCard
            customer={customerA}
            isSurvivor={survivorId === customerA.id}
            onSelect={() => handleSelectSurvivor(customerA)}
          />
          <CustomerSummaryCard
            customer={customerB}
            isSurvivor={survivorId === customerB.id}
            onSelect={() => handleSelectSurvivor(customerB)}
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
          سيتم نقل {loser.ordersCount} طلب وجميع أرقام الهاتف من &quot;{loser.name}&quot;
          إلى &quot;{survivor.name}&quot;، ودمج الملاحظات، ثم حذف &quot;{loser.name}&quot; نهائيًا.
          هذا الإجراء لا يمكن التراجع عنه.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="اسم العميل بعد الدمج"
            name="mergedCustomerName"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="البريد الإلكتروني بعد الدمج"
            name="mergedCustomerEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 gap-4">
          <div>
            <p className="font-medium text-gray-900">حظر العميل بعد الدمج</p>
            <p className="text-xs text-gray-500">
              {customerA.name}: {customerA.isBlocked ? 'محظور' : 'غير محظور'} ·{' '}
              {customerB.name}: {customerB.isBlocked ? 'محظور' : 'غير محظور'}
            </p>
          </div>
          <Switch checked={isBlocked} onCheckedChange={setIsBlocked} />
        </div>

        {isBlocked && (
          <Input
            label="محظور حتى (اختياري)"
            name="mergedBlockedUntil"
            type="date"
            value={blockedUntil}
            onChange={(e) => setBlockedUntil(e.target.value)}
          />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
