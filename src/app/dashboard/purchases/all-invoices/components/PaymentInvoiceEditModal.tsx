'use client';

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { uploadFile } from '@/lib/api/upload';
import type { SupplierEmployeeRef, UpdateSupplierInvoiceDto } from '@/lib/api/suppliers';
import { supplierInvoiceErrorMessage } from '@/lib/api/supplierInvoiceErrors';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import { useEmployeesQuery } from '@/services/employees';
import { useUpdateSupplierInvoiceMutation } from '@/services/suppliers';
import { getApiErrorStatus } from '@/utils/apiError';
import { hasAtMostTwoDecimals } from '@/utils/money';

export interface EditablePaymentInvoice {
  id: number;
  code: string;
  paymentAmount?: number | null;
  externalInvoiceNumber?: string | null;
  createdByEmployee?: SupplierEmployeeRef | null;
}

interface PaymentInvoiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: EditablePaymentInvoice;
}

const STALE_STATUSES = [404, 409];

export function PaymentInvoiceEditModal({ isOpen, onClose, invoice }: PaymentInvoiceEditModalProps) {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateSupplierInvoiceMutation(invoice.id);
  const canAttribute = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_ATTRIBUTE);
  const { data: employeesData } = useEmployeesQuery();
  const employeeOptions = useMemo(
    () => (employeesData ?? []).map((e) => ({ key: String(e.id), value: e.fullName })),
    [employeesData],
  );

  const [amountInput, setAmountInput] = useState(
    invoice.paymentAmount != null ? String(invoice.paymentAmount) : '',
  );
  const [amountError, setAmountError] = useState<string>();
  const [externalNumber, setExternalNumber] = useState(invoice.externalInvoiceNumber ?? '');
  const [employeeId, setEmployeeId] = useState<number | undefined>(invoice.createdByEmployee?.id);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const parseAmount = (): number | null => {
    const trimmed = amountInput.trim();
    if (!trimmed || !hasAtMostTwoDecimals(trimmed)) {
      setAmountError('أدخل مبلغاً بمنزلتين عشريتين كحد أقصى');
      return null;
    }
    const value = Number(trimmed);
    if (!(value > 0)) {
      setAmountError('يجب أن يكون المبلغ أكبر من صفر');
      return null;
    }
    setAmountError(undefined);
    return value;
  };

  const handleConfirm = async () => {
    const amount = parseAmount();
    if (amount === null) return;
    try {
      let images: string[] | undefined;
      if (imageFile) {
        setIsUploading(true);
        try {
          const uploaded = await uploadFile(imageFile);
          if (uploaded?.url) {
            images = [uploaded.url];
          }
        } finally {
          setIsUploading(false);
        }
      }

      const body: UpdateSupplierInvoiceDto = { paymentAmount: amount };
      const trimmedNumber = externalNumber.trim();
      if (trimmedNumber !== (invoice.externalInvoiceNumber ?? '')) {
        body.externalInvoiceNumber = trimmedNumber;
      }
      if (images) {
        body.images = images;
      }
      if (
        canAttribute &&
        employeeId !== undefined &&
        employeeId !== invoice.createdByEmployee?.id
      ) {
        body.createdByEmployeeId = employeeId;
      }

      await updateMutation.mutateAsync(body);
      toast.success('تم حفظ الدفعة');
      onClose();
    } catch (err: unknown) {
      toast.error(supplierInvoiceErrorMessage(err, 'تعذّر حفظ الدفعة'));
      const status = getApiErrorStatus(err);
      if (status !== undefined && STALE_STATUSES.includes(status)) {
        await invalidateAndWait(queryClient, [
          [QUERY_KEYS.SUPPLIER_INVOICES],
          [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, invoice.id],
        ]);
      }
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل الدفعة"
      onConfirm={handleConfirm}
      confirmText="حفظ الدفعة"
      isLoading={updateMutation.isPending || isUploading}
      maxWidth="md:max-w-lg"
    >
      <div className="flex flex-col gap-5 text-sm text-foreground">
        <p className="text-muted-foreground">
          تعديل الدفعة المستقلة{' '}
          <span dir="ltr" className="font-semibold tabular-nums text-foreground">
            {invoice.code}
          </span>{' '}
          متاح قبل الاعتماد فقط.
        </p>
        <Input
          label="المبلغ المدفوع"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          dir="ltr"
          required
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          error={amountError}
        />
        <Input
          label="رقم فاتورة المورد الخارجي"
          value={externalNumber}
          onChange={(e) => setExternalNumber(e.target.value)}
        />
        <ImageUploadField
          value={imageFile}
          onChange={setImageFile}
          title="صورة الدفعة"
          description="اختياري: ارفع صورة جديدة لإيصال الدفع"
        />
        <div className="flex flex-col gap-2">
          <span className="text-base font-normal">الموظف المنشئ</span>
          <SearchableSelect
            value={employeeId !== undefined ? String(employeeId) : ''}
            onChange={(val) => setEmployeeId(Number(val))}
            options={employeeOptions}
            placeholder="اختر الموظف"
            disabled={!canAttribute}
          />
        </div>
      </div>
    </BaseModal>
  );
}
