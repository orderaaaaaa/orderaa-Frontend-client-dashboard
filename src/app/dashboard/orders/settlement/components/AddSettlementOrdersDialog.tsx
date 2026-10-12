'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/utils/apiError';
import { parseSettlementFile } from '@/lib/excel/parse-settlement-file';
import ForceSettlementDialog from './ForceSettlementDialog';
import SettlementAcceptedStatusesNote from './SettlementAcceptedStatusesNote';
import { SettlementMobileList, SettlementMobileRow } from './SettlementMobileList';
import {
  addSettlementBatchOrders,
  type SettlementRow,
  type UploadSettlementResponse,
} from '@/lib/api/settlement';

const SINGLE_AMOUNT_PATTERN = /^-?\d+(\.\d{1,2})?$/;

const SINGLE_ROW_STATUSES: ReadonlyArray<{ value: SettlementRow['targetStatus']; label: string }> = [
  { value: 'COLLECTED', label: 'تم التحصيل' },
  { value: 'RETURNED_SETTLED', label: 'مرتجع تمت تسويته' },
];

interface SingleRowDraft {
  orderCode: string;
  shippingCompanyCode: string;
  amount: string;
  targetStatus: SettlementRow['targetStatus'];
}

function buildSingleRow(draft: SingleRowDraft): { row: SettlementRow } | { error: string } {
  const orderCode = draft.orderCode.trim();
  const shippingCompanyCode = draft.shippingCompanyCode.trim();
  if (!orderCode && !shippingCompanyCode) {
    return { error: 'أدخل كود الطلب أو كود الشحن' };
  }
  const amount = draft.amount.trim();
  if (!SINGLE_AMOUNT_PATTERN.test(amount)) {
    return { error: 'أدخل مبلغًا صحيحًا بحد أقصى رقمين عشريين' };
  }
  if (!SINGLE_ROW_STATUSES.some((status) => status.value === draft.targetStatus)) {
    return { error: 'اختر الحالة المطلوبة' };
  }
  return {
    row: {
      orderCode: orderCode || undefined,
      shippingCompanyCode: shippingCompanyCode || undefined,
      settlementAmount: Number(amount),
      targetStatus: draft.targetStatus,
    },
  };
}

interface AddSettlementOrdersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  onSuccess: () => void | Promise<void>;
}

type ForcingTarget =
  | { source: 'failed'; row: number }
  | { source: 'alreadyCollected'; row: number };

export default function AddSettlementOrdersDialog({
  isOpen,
  onClose,
  batchId,
  onSuccess,
}: AddSettlementOrdersDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<SettlementRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadSettlementResponse | null>(null);
  const [forcingTarget, setForcingTarget] = useState<ForcingTarget | null>(null);
  const [draft, setDraft] = useState<SingleRowDraft>({
    orderCode: '', shippingCompanyCode: '', amount: '', targetStatus: 'COLLECTED',
  });
  const [draftError, setDraftError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    try {
      const rows = await parseSettlementFile(file);
      setParsedRows(rows);
      toast.success(`تم تحليل ${rows.length} صف بنجاح`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطأ في تحليل الملف');
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (parsedRows.length === 0) return;
    setIsUploading(true);
    try {
      const response = await addSettlementBatchOrders(batchId, parsedRows);
      setResults(response);
      await onSuccess();
      if (response.success.length > 0) {
        toast.success(`تم إضافة ${response.success.length} صف بنجاح`);
      }
      if (response.alreadyCollected.length > 0) {
        toast.warning(`${response.alreadyCollected.length} صف تم تحصيله مسبقاً`);
      }
      if (response.failed.length > 0) {
        toast.error(`فشل ${response.failed.length} صف`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر رفع البيانات'));
    } finally {
      setIsUploading(false);
    }
  }, [parsedRows, batchId, onSuccess]);

  const handleAddSingleRow = useCallback(async () => {
    const built = buildSingleRow(draft);
    if ('error' in built) {
      setDraftError(built.error);
      return;
    }
    setDraftError(null);
    setIsUploading(true);
    try {
      const rows = [built.row];
      const response = await addSettlementBatchOrders(batchId, rows);
      setParsedRows(rows);
      setResults(response);
      await onSuccess();
      if (response.success.length > 0) {
        toast.success('تم إضافة الطلب بنجاح');
      }
      if (response.alreadyCollected.length > 0) {
        toast.warning('الطلب تم تحصيله مسبقاً');
      }
      if (response.failed.length > 0) {
        toast.error(response.failed[0].reason);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر إضافة الطلب'));
    } finally {
      setIsUploading(false);
    }
  }, [draft, batchId, onSuccess]);

  const forceRow = useCallback(
    async (row: number) => {
      const source = parsedRows[row];
      if (!source) return;
      const response = await addSettlementBatchOrders(batchId, [{ ...source, force: true }]);
      const renumber = <T extends { row: number }>(items: T[]): T[] =>
        items.map((item) => ({ ...item, row }));
      setResults((prev) =>
        prev
          ? {
              success: [...prev.success, ...renumber(response.success)],
              failed: prev.failed
                .filter((item) => item.row !== row)
                .concat(renumber(response.failed)),
              alreadyCollected: prev.alreadyCollected
                .filter((item) => item.row !== row)
                .concat(renumber(response.alreadyCollected)),
              batch: response.batch,
            }
          : prev,
      );
      await onSuccess();
    },
    [batchId, parsedRows, onSuccess],
  );

  const handleConfirmForceTarget = useCallback(async () => {
    if (!forcingTarget) return;
    await forceRow(forcingTarget.row);
    setForcingTarget(null);
  }, [forceRow, forcingTarget]);

  const handleClose = () => {
    setParsedRows([]);
    setResults(null);
    setForcingTarget(null);
    setDraft({ orderCode: '', shippingCompanyCode: '', amount: '', targetStatus: 'COLLECTED' });
    setDraftError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const failedItem =
    forcingTarget?.source === 'failed'
      ? (results?.failed.find((item) => item.row === forcingTarget.row) ?? null)
      : null;
  const alreadyCollectedItem =
    forcingTarget?.source === 'alreadyCollected'
      ? (results?.alreadyCollected.find((item) => item.row === forcingTarget.row) ?? null)
      : null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="إضافة طلبات"
      showFooter={false}
      maxWidth="md:max-w-3xl"
    >
      <div className="space-y-4">
        <div className="rounded-md border border-gray-200 p-3 space-y-3">
          <p className="text-sm font-medium text-gray-700">إضافة طلب واحد</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="settlement-add-order-code" className="text-sm font-medium text-gray-700">كود الطلب</label>
              <input
                id="settlement-add-order-code"
                type="text"
                value={draft.orderCode}
                onChange={(e) => setDraft((prev) => ({ ...prev, orderCode: e.target.value }))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="settlement-add-shipping-code" className="text-sm font-medium text-gray-700">كود الشحن</label>
              <input
                id="settlement-add-shipping-code"
                type="text"
                value={draft.shippingCompanyCode}
                onChange={(e) => setDraft((prev) => ({ ...prev, shippingCompanyCode: e.target.value }))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="settlement-add-amount" className="text-sm font-medium text-gray-700">المبلغ</label>
              <input
                id="settlement-add-amount"
                type="text"
                inputMode="decimal"
                dir="ltr"
                value={draft.amount}
                onChange={(e) => setDraft((prev) => ({ ...prev, amount: e.target.value }))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="settlement-add-target-status" className="text-sm font-medium text-gray-700">الحالة المطلوبة</label>
              <select
                id="settlement-add-target-status"
                value={draft.targetStatus}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    targetStatus: e.target.value as SingleRowDraft['targetStatus'],
                  }))
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-base sm:text-sm bg-white"
              >
                {SINGLE_ROW_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SettlementAcceptedStatusesNote />
          {draftError && <p className="text-xs text-red-600">{draftError}</p>}
          <Button size="sm" className="max-sm:h-10 max-sm:w-full" disabled={isUploading} onClick={handleAddSingleRow}>
            {isUploading ? 'جاري الإضافة...' : 'إضافة الطلب'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            aria-label="ملف Excel"
            onChange={handleFileChange}
            className="text-sm min-w-0 max-w-full"
          />
          <Button
            size="sm"
            className="max-sm:h-10 max-sm:w-full"
            disabled={parsedRows.length === 0 || isUploading}
            onClick={handleUpload}
          >
            {isUploading
              ? 'جاري الإضافة...'
              : `إضافة${parsedRows.length ? ` (${parsedRows.length})` : ''}`}
          </Button>
        </div>

        {isParsing && <p className="text-sm text-muted-foreground">جاري التحليل...</p>}

        {results && (
          <div className="space-y-4">
            {results.failed.length > 0 && (
              <SettlementMobileList className="border-red-200">
                {results.failed.map((item) => (
                  <SettlementMobileRow
                    key={item.row}
                    alert={
                      <p className="whitespace-pre-line text-sm font-medium text-red-700">
                        {item.reason}
                      </p>
                    }
                    fields={[
                      { label: '#', value: item.row + 1 },
                      { label: 'كود الطلب', value: <span className="font-mono">{item.orderCode ?? '—'}</span> },
                    ]}
                    actions={
                      item.bypassable ? (
                        <Button
                          variant="outline"
                          className="h-10 w-full"
                          onClick={() => setForcingTarget({ source: 'failed', row: item.row })}
                        >
                          إضافة رغم الخطأ
                        </Button>
                      ) : undefined
                    }
                  />
                ))}
              </SettlementMobileList>
            )}

            {results.failed.length > 0 && (
              <div className="hidden sm:block rounded-md border border-red-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-3 py-2 text-right font-medium">#</th>
                      <th className="px-3 py-2 text-right font-medium">كود الطلب</th>
                      <th className="px-3 py-2 text-right font-medium">السبب</th>
                      <th className="px-3 py-2 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.failed.map((item) => (
                      <tr key={item.row} className="border-t">
                        <td className="px-3 py-2 text-muted-foreground">{item.row + 1}</td>
                        <td className="px-3 py-2 font-mono">{item.orderCode ?? '—'}</td>
                        <td className="whitespace-pre-line px-3 py-2 text-red-700">{item.reason}</td>
                        <td className="px-3 py-2">
                          {item.bypassable && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setForcingTarget({ source: 'failed', row: item.row })}
                            >
                              إضافة رغم الخطأ
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {results.alreadyCollected.length > 0 && (
              <SettlementMobileList className="border-amber-200">
                {results.alreadyCollected.map((item) => (
                  <SettlementMobileRow
                    key={item.row}
                    fields={[
                      { label: '#', value: item.row + 1 },
                      { label: 'كود الطلب', value: <span className="font-mono">{item.orderCode}</span> },
                    ]}
                    actions={
                      item.bypassable && !item.sameBatch ? (
                        <Button
                          variant="outline"
                          className="h-10 w-full"
                          onClick={() =>
                            setForcingTarget({ source: 'alreadyCollected', row: item.row })
                          }
                        >
                          نقل إلى هذا التحصيل
                        </Button>
                      ) : undefined
                    }
                  />
                ))}
              </SettlementMobileList>
            )}

            {results.alreadyCollected.length > 0 && (
              <div className="hidden sm:block rounded-md border border-amber-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="px-3 py-2 text-right font-medium">#</th>
                      <th className="px-3 py-2 text-right font-medium">كود الطلب</th>
                      <th className="px-3 py-2 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.alreadyCollected.map((item) => (
                      <tr key={item.row} className="border-t">
                        <td className="px-3 py-2 text-muted-foreground">{item.row + 1}</td>
                        <td className="px-3 py-2 font-mono">{item.orderCode}</td>
                        <td className="px-3 py-2">
                          {item.bypassable && !item.sameBatch && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setForcingTarget({ source: 'alreadyCollected', row: item.row })
                              }
                            >
                              نقل إلى هذا التحصيل
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {results.success.length > 0 && (
              <p className="text-sm text-green-700">تمت إضافة {results.success.length} صف بنجاح</p>
            )}
          </div>
        )}
      </div>

      <ForceSettlementDialog
        isOpen={forcingTarget !== null}
        onClose={() => setForcingTarget(null)}
        onConfirm={handleConfirmForceTarget}
        reason={failedItem?.reason ?? ''}
        hopPath={failedItem?.forcePath ?? null}
        moveFromBatchCode={alreadyCollectedItem?.batch?.code ?? null}
      />
    </BaseModal>
  );
}
