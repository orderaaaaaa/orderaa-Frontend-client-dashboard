'use client';

import { formatDate } from '@/utils/format';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/dashboard-layout';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { generateSettlementTemplate } from '@/lib/excel/template-generator';
import { parseSettlementFile, type SettlementSheetError } from '@/lib/excel/parse-settlement-file';
import CopyButton from '@/components/ui/copy-button';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  SettlementShippingColumnHeaders,
  SettlementShippingColumnCells,
} from '@/app/dashboard/orders/settlement/components/SettlementShippingColumns';
import BaseModal from '@/components/ui/base-modal';
import { useSettlementSync } from '@/app/dashboard/orders/settlement/hooks/useSettlementQueries';
import ForceSettlementDialog from '@/app/dashboard/orders/settlement/components/ForceSettlementDialog';
import SettlementAcceptedStatusesNote from '@/app/dashboard/orders/settlement/components/SettlementAcceptedStatusesNote';
import SettlementSheetNamesNote from '@/app/dashboard/orders/settlement/components/SettlementSheetNamesNote';
import SettlementSheetErrors from '@/app/dashboard/orders/settlement/components/SettlementSheetErrors';
import {
  SettlementMobileList,
  SettlementMobileRow,
} from '@/app/dashboard/orders/settlement/components/SettlementMobileList';
import {
  uploadSettlementRows,
  addSettlementBatchOrders,
  getCurrentSettlementBatch,
  confirmSettlementBatch,
  type SettlementBatch,
  type SettlementRow,
  type UploadSettlementResponse,
} from '@/lib/api/settlement';

function handleDownloadTemplate() {
  const blob = generateSettlementTemplate();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'settlement-template.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SettlementUploadPage() {
  // Uploading a collection sheet hits POST /orders/settlement/upload.
  const canManageSettlement = useHasPermission(PERMISSION_CODES.ORDERS_SETTLEMENT_MANAGE);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<SettlementRow[]>([]);
  const [sheetErrors, setSheetErrors] = useState<SettlementSheetError[]>([]);
  const [uploadedRows, setUploadedRows] = useState<SettlementRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadSettlementResponse | null>(null);
  const [batch, setBatch] = useState<SettlementBatch | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isBatchLoading, setIsBatchLoading] = useState(true);
  const [batchLoadFailed, setBatchLoadFailed] = useState(false);
  const [closeBatchOpen, setCloseBatchOpen] = useState(false);
  const [forceSelectedOpen, setForceSelectedOpen] = useState(false);
  const [selectedForceRows, setSelectedForceRows] = useState<Set<number>>(new Set());
  const [isForcingSelected, setIsForcingSelected] = useState(false);
  const [forcingTarget, setForcingTarget] = useState<
    | { source: 'failed'; row: number }
    | { source: 'alreadyCollected'; row: number }
    | null
  >(null);
  const { getStatusLabel } = useStatusLabel();
  const syncSettlement = useSettlementSync();

  // The collection lives on the server, so a closed browser does not lose it —
  // reopening the page picks the session back up.
  const loadBatch = useCallback(() => {
    setIsBatchLoading(true);
    setBatchLoadFailed(false);
    getCurrentSettlementBatch()
      .then(setBatch)
      .catch(() => setBatchLoadFailed(true))
      .finally(() => setIsBatchLoading(false));
  }, []);

  useEffect(() => {
    loadBatch();
  }, [loadBatch]);

  const handleConfirm = useCallback(async () => {
    if (!batch) return;
    setIsConfirming(true);
    try {
      const confirmed = await confirmSettlementBatch(batch.id);
      await syncSettlement();
      setBatch(confirmed);
      setCloseBatchOpen(false);
      toast.success(
        `تم إغلاق التحصيل ${confirmed.code} — الإجمالي ${confirmed.totalAmount} جنيه عن ${confirmed.ordersCount} طلب`,
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر إغلاق التحصيل'));
    } finally {
      setIsConfirming(false);
    }
  }, [batch, syncSettlement]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setResults(null);
    setUploadedRows([]);
    setSelectedForceRows(new Set());
    setIsParsing(true);

    try {
      const { rows, errors } = await parseSettlementFile(file);
      setParsedRows(rows);
      setSheetErrors(errors);
      if (rows.length > 0) {
        toast.success(`تم تحليل ${rows.length} صف بنجاح`);
      }
      if (errors.length > 0) {
        toast.error(`${errors.length} صف بحالة غير معروفة لن يُرفع`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطأ في تحليل الملف');
      setParsedRows([]);
      setSheetErrors([]);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (parsedRows.length === 0) return;

    setIsUploading(true);
    try {
      // Continue the collection already on screen, so a second sheet joins the
      // same running total instead of starting a fresh one.
      const response = await uploadSettlementRows(parsedRows, batch?.id);
      await syncSettlement();
      setResults(response);
      setBatch(response.batch);
      setUploadedRows(parsedRows);
      setParsedRows([]);
      setSelectedFile(null);
      setSelectedForceRows(new Set());
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (response.success.length > 0) {
        toast.success(`تم رفع ${response.success.length} صف بنجاح`);
      }
      // Already-collected rows get their own warning: lumping them into
      // toast.error was what made a duplicate read as a failure.
      if (response.alreadyCollected.length > 0) {
        toast.warning(
          `${response.alreadyCollected.length} صف تم تحصيله مسبقاً`,
        );
      }
      if (response.failed.length > 0) {
        toast.error(`فشل ${response.failed.length} صف`);
      }
      if (
        response.success.length === 0 &&
        response.alreadyCollected.length === 0 &&
        response.failed.length > 0
      ) {
        toast.error('فشل رفع جميع الصفوف');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'خطأ في رفع البيانات'));
    } finally {
      setIsUploading(false);
    }
  }, [parsedRows, batch, syncSettlement]);

  const forceRows = useCallback(
    async (rowIndices: number[]) => {
      if (!batch || rowIndices.length === 0) return;

      const sentRowIndices: number[] = [];
      const rows: SettlementRow[] = [];
      for (const idx of rowIndices) {
        const row = uploadedRows[idx];
        if (!row) continue;
        sentRowIndices.push(idx);
        rows.push({ ...row, force: true });
      }

      if (rows.length === 0) return;

      const response = await addSettlementBatchOrders(batch.id, rows);
      await syncSettlement();
      const forcedSet = new Set(sentRowIndices);
      const renumber = <T extends { row: number }>(items: T[]): T[] =>
        items.map((item) => ({ ...item, row: sentRowIndices[item.row] ?? item.row }));

      setResults((prev) =>
        prev
          ? {
              success: [...prev.success, ...renumber(response.success)],
              failed: [
                ...prev.failed.filter((item) => !forcedSet.has(item.row)),
                ...renumber(response.failed),
              ],
              alreadyCollected: [
                ...prev.alreadyCollected.filter((item) => !forcedSet.has(item.row)),
                ...renumber(response.alreadyCollected),
              ],
              batch: response.batch,
            }
          : prev,
      );
      setBatch(response.batch);
    },
    [batch, uploadedRows, syncSettlement],
  );

  const handleForceSelected = useCallback(async () => {
    if (selectedForceRows.size === 0) return;
    setIsForcingSelected(true);
    try {
      await forceRows(Array.from(selectedForceRows));
      setSelectedForceRows(new Set());
      setForceSelectedOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر إضافة الصفوف المحددة رغم الأخطاء'));
    } finally {
      setIsForcingSelected(false);
    }
  }, [forceRows, selectedForceRows]);

  const handleConfirmForceTarget = useCallback(async () => {
    if (!forcingTarget) return;
    await forceRows([forcingTarget.row]);
    setSelectedForceRows((prev) => {
      const next = new Set(prev);
      next.delete(forcingTarget.row);
      return next;
    });
    setForcingTarget(null);
  }, [forceRows, forcingTarget]);

  const toggleForceRowSelection = useCallback((row: number) => {
    setSelectedForceRows((prev) => {
      const next = new Set(prev);
      if (next.has(row)) {
        next.delete(row);
      } else {
        next.add(row);
      }
      return next;
    });
  }, []);

  const bypassableFailedRows = (results?.failed ?? [])
    .filter((item) => item.bypassable)
    .map((item) => item.row);
  const allBypassableSelected =
    bypassableFailedRows.length > 0 &&
    bypassableFailedRows.every((row) => selectedForceRows.has(row));
  const toggleAllBypassable = (checked: boolean) => {
    setSelectedForceRows(checked ? new Set(bypassableFailedRows) : new Set());
  };

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setParsedRows([]);
    setSheetErrors([]);
    setUploadedRows([]);
    setResults(null);
    setSelectedForceRows(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full min-h-full">
      <Breadcrumb
        items={[{ title: 'التحصيلات' }, { title: 'رفع شيت التحصيل' }]}
      />

      <h1 className="text-2xl font-bold mb-6">رفع شيت التحصيل</h1>

      {/* Download Template */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            تحميل القالب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            قم بتنزيل قالب Excel لضمان تنسيق البيانات بشكل صحيح.
          </p>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4 me-2" />
            تحميل القالب
          </Button>
          <SettlementSheetNamesNote className="mt-4" />
          <SettlementAcceptedStatusesNote className="mt-4" />
        </CardContent>
      </Card>

      {/* Upload Section — POST /orders/settlement/upload */}
      {canManageSettlement && (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5" />
            رفع الملف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="settlement-file-input"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsing || isUploading}
              >
                <FileSpreadsheet className="w-4 h-4 me-2 shrink-0" />
                <span className="truncate max-w-[60vw] sm:max-w-xs">
                  {selectedFile ? selectedFile.name : 'اختر ملف Excel'}
                </span>
              </Button>

              {parsedRows.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {parsedRows.length} صف جاهز للرفع
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={parsedRows.length === 0 || isParsing || isUploading || batchLoadFailed || isBatchLoading}
              >
                {isUploading ? 'جاري الرفع...' : 'رفع'}
              </Button>

              {selectedFile && (
                <Button variant="ghost" onClick={handleReset} disabled={isUploading}>
                  إعادة تعيين
                </Button>
              )}
            </div>
          </div>

          {isParsing && (
            <p className="text-sm text-muted-foreground mt-3">
              جاري تحليل الملف...
            </p>
          )}

          <SettlementSheetErrors errors={sheetErrors} className="mt-3" />
        </CardContent>
      </Card>
      )}

      {/* T3 — the running collection. Shown whether or not a sheet has just been
          uploaded, so a resumed session is obvious on arrival. */}
      {batchLoadFailed && (
        <Card className="mb-6">
          <CardContent className="py-6 flex flex-col items-center gap-3 text-center">
            <p className="font-semibold text-red-700">تعذّر تحميل التحصيل المفتوح</p>
            <p className="text-sm text-muted-foreground">
              لا نعرف إن كان هناك تحصيل مفتوح. أعد المحاولة قبل رفع أي شيت.
            </p>
            <Button variant="outline" onClick={loadBatch} disabled={isBatchLoading}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      )}

      {batch && (
        <Card>
          <CardContent className="py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  {batch.status === 'OPEN' ? 'تحصيل مفتوح' : 'تحصيل مغلق'}
                </span>
                <span className="font-bold flex items-center gap-1.5">
                  {batch.code}
                  <CopyButton value={batch.code} label="نسخ كود التحصيل" />
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">الإجمالي</span>
                {/* A decimal string, rendered as-is. */}
                <span className="text-lg font-bold text-primary">
                  {batch.totalAmount} جنيه
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">عدد الطلبات</span>
                <span className="text-lg font-bold">{batch.ordersCount}</span>
              </div>
            </div>

            {batch.status === 'OPEN' ? (
              <div className="flex flex-col items-stretch sm:items-end gap-1 w-full sm:w-auto">
                <Button onClick={() => setCloseBatchOpen(true)} disabled={isConfirming}>
                  {isConfirming ? 'جاري الإغلاق...' : 'تأكيد وإغلاق التحصيل'}
                </Button>
                {/* Rows settle on upload, not on confirmation. Saying so stops
                    anyone believing this button is what commits the money. */}
                <span className="text-[11px] text-muted-foreground sm:max-w-xs text-start sm:text-end">
                  تم تسوية الصفوف بالفعل عند رفعها؛ التأكيد يغلق التحصيل ويثبّت إجماليه فقط
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-green-700">
                تم التأكيد — لا يمكن إضافة صفوف أخرى
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">نتائج الرفع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Successful rows */}
            {results.success.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-green-700 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                  نجح ({results.success.length})
                </h3>
                <SettlementMobileList>
                  {results.success.map((item) => (
                    <SettlementMobileRow
                      key={item.row}
                      fields={[
                        { label: '#', value: item.row + 1 },
                        { label: 'المبلغ', value: item.amount },
                        { label: 'كود الطلب', value: <span className="font-mono">{item.orderCode}</span> },
                        { label: 'كود الشحن', value: <span className="font-mono">{item.shippingCode ?? '—'}</span> },
                        { label: 'الحالة الحالية', value: getStatusLabel(item.currentStatus) },
                        { label: 'الحالة الجديدة', value: getStatusLabel(item.newStatus) },
                      ]}
                      shipping={item.shipping}
                    />
                  ))}
                </SettlementMobileList>
                <div className="hidden sm:block rounded-md border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-right font-medium">#</th>
                        <th className="px-4 py-2 text-right font-medium">كود الطلب</th>
                        <th className="px-4 py-2 text-right font-medium">كود الشحن</th>
                        <th className="px-4 py-2 text-right font-medium">المبلغ</th>
                        <th className="px-4 py-2 text-right font-medium">الحالة الحالية</th>
                        <th className="px-4 py-2 text-right font-medium">الحالة الجديدة</th>
                        <SettlementShippingColumnHeaders />
                      </tr>
                    </thead>
                    <tbody>
                      {results.success.map((item) => (
                        <tr key={item.row} className="border-t">
                          <td className="px-4 py-2 text-muted-foreground">{item.row + 1}</td>
                          <td className="px-4 py-2 font-mono">{item.orderCode}</td>
                          <td className="px-4 py-2 font-mono">{item.shippingCode ?? "—"}</td>
                          <td className="px-4 py-2">{item.amount}</td>
                          <td className="px-4 py-2">{getStatusLabel(item.currentStatus)}</td>
                          <td className="px-4 py-2">{getStatusLabel(item.newStatus)}</td>
                          <SettlementShippingColumnCells shipping={item.shipping} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* T5 — already collected: information, not an error. Amber, so it
                reads as neither نجح nor فشل. */}
            {results.alreadyCollected.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  تم تحصيلها مسبقاً ({results.alreadyCollected.length})
                </h3>
                <SettlementMobileList className="border-amber-200">
                  {results.alreadyCollected.map((item, i) => {
                    const differs =
                      Number(item.sheetAmount) !== Number(item.collectedAmount);
                    const amountClass = differs ? 'font-bold text-amber-800' : undefined;
                    return (
                      <SettlementMobileRow
                        key={i}
                        className={differs ? 'bg-amber-100/70' : undefined}
                        fields={[
                          { label: '#', value: item.row + 1 },
                          { label: 'كود الطلب', value: <span className="font-mono">{item.orderCode}</span> },
                          { label: 'المبلغ في الشيت', value: <span className={amountClass}>{item.sheetAmount}</span> },
                          { label: 'المبلغ المحصل مسبقاً', value: <span className={amountClass}>{item.collectedAmount}</span> },
                          { label: 'كود الشحن', value: <span className="font-mono">{item.shippingCode ?? '—'}</span> },
                          {
                            label: 'تاريخ التحصيل',
                            value: item.collectedAt
                              ? formatDate(item.collectedAt)
                              : '—',
                          },
                          {
                            label: 'التحصيل السابق',
                            className: 'col-span-2',
                            value: item.batch
                              ? `${item.batch.code}${item.batch.actorName ? ` — ${item.batch.actorName}` : ''}`
                              : (item.source ?? '—'),
                          },
                        ]}
                        shipping={item.shipping}
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
                    );
                  })}
                </SettlementMobileList>
                <div className="hidden sm:block rounded-md border border-amber-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-amber-50">
                      <tr>
                        <th className="px-4 py-2 text-right font-medium">#</th>
                        <th className="px-4 py-2 text-right font-medium">كود الطلب</th>
                        <th className="px-4 py-2 text-right font-medium">كود الشحن</th>
                        <th className="px-4 py-2 text-right font-medium">المبلغ في الشيت</th>
                        <th className="px-4 py-2 text-right font-medium">المبلغ المحصل مسبقاً</th>
                        <th className="px-4 py-2 text-right font-medium">تاريخ التحصيل</th>
                        <th className="px-4 py-2 text-right font-medium">التحصيل السابق</th>
                        <SettlementShippingColumnHeaders />
                        <th className="px-4 py-2 text-right font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.alreadyCollected.map((item, i) => {
                        // Compared by VALUE, not string equality: "300" and
                        // "300.00" are the same amount. A repeat with a
                        // matching figure is a harmless duplicate; a differing
                        // one means someone has the wrong number.
                        const differs =
                          Number(item.sheetAmount) !== Number(item.collectedAmount);
                        return (
                          <tr
                            key={i}
                            className={`border-t ${differs ? 'bg-amber-100/70' : ''}`}
                          >
                            <td className="px-4 py-2 text-muted-foreground">{item.row + 1}</td>
                            <td className="px-4 py-2 font-mono">{item.orderCode}</td>
                            <td className="px-4 py-2 font-mono">{item.shippingCode ?? '—'}</td>
                            <td className={`px-4 py-2 ${differs ? 'font-bold text-amber-800' : ''}`}>
                              {item.sheetAmount}
                            </td>
                            <td className={`px-4 py-2 ${differs ? 'font-bold text-amber-800' : ''}`}>
                              {item.collectedAmount}
                            </td>
                            <td className="px-4 py-2">
                              {item.collectedAt
                                ? formatDate(item.collectedAt)
                                : '—'}
                            </td>
                            <td className="px-4 py-2">
                              {/* Null batch is expected for adjust-only and
                                  pre-collection rows — show the source so the
                                  cell does not look broken. */}
                              {item.batch
                                ? `${item.batch.code}${item.batch.actorName ? ` — ${item.batch.actorName}` : ''}`
                                : (item.source ?? '—')}
                            </td>
                            <SettlementShippingColumnCells shipping={item.shipping} />
                            <td className="px-4 py-2">
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Failed rows */}
            {results.failed.length > 0 && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    فشل ({results.failed.length})
                  </h3>
                  {results.failed.some((item) => item.bypassable) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="max-sm:h-10"
                      disabled={selectedForceRows.size === 0 || isForcingSelected}
                      onClick={() => setForceSelectedOpen(true)}
                    >
                      {isForcingSelected ? 'جاري الإضافة...' : 'إضافة المحدد رغم الأخطاء'}
                    </Button>
                  )}
                </div>
                {results.failed.some((item) => item.bypassable) && (
                  <label className="sm:hidden flex min-h-10 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={allBypassableSelected}
                      onChange={(e) => toggleAllBypassable(e.target.checked)}
                    />
                    تحديد كل ما يمكن إضافته رغم الخطأ
                  </label>
                )}
                <SettlementMobileList>
                  {results.failed.map((item, i) => (
                    <SettlementMobileRow
                      key={i}
                      alert={
                        <p className="whitespace-pre-line text-sm font-medium text-red-600">
                          {item.reason}
                        </p>
                      }
                      leading={
                        item.bypassable ? (
                          <label className="-m-2 flex size-10 shrink-0 items-center justify-center">
                            <input
                              type="checkbox"
                              aria-label={`تحديد الصف ${item.row + 1}`}
                              checked={selectedForceRows.has(item.row)}
                              onChange={() => toggleForceRowSelection(item.row)}
                            />
                          </label>
                        ) : undefined
                      }
                      fields={[
                        { label: '#', value: item.row + 1 },
                        { label: 'المبلغ', value: item.amount ?? '—' },
                        { label: 'كود الطلب', value: <span className="font-mono">{item.orderCode ?? '—'}</span> },
                        { label: 'كود الشحن', value: <span className="font-mono">{item.shippingCode ?? '—'}</span> },
                        {
                          label: 'الحالة الحالية',
                          value: item.currentStatus ? getStatusLabel(item.currentStatus) : '—',
                        },
                        {
                          label: 'الحالة المطلوبة',
                          value: item.targetStatus ? getStatusLabel(item.targetStatus) : '—',
                        },
                      ]}
                      shipping={item.shipping}
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
                <div className="hidden sm:block rounded-md border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-right font-medium">
                          <input
                            type="checkbox"
                            aria-label="تحديد الكل"
                            checked={allBypassableSelected}
                            onChange={(e) => toggleAllBypassable(e.target.checked)}
                          />
                        </th>
                        <th className="px-4 py-2 text-right font-medium">#</th>
                        <th className="px-4 py-2 text-right font-medium">كود الطلب</th>
                        <th className="px-4 py-2 text-right font-medium">كود الشحن</th>
                        <th className="px-4 py-2 text-right font-medium">المبلغ</th>
                        <th className="px-4 py-2 text-right font-medium">الحالة الحالية</th>
                        <th className="px-4 py-2 text-right font-medium">الحالة المطلوبة</th>
                        <SettlementShippingColumnHeaders />
                        <th className="px-4 py-2 text-right font-medium">رسالة الخطأ</th>
                        <th className="px-4 py-2 text-right font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.failed.map((item, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-2">
                            {item.bypassable && (
                              <input
                                type="checkbox"
                                aria-label={`تحديد الصف ${item.row + 1}`}
                                checked={selectedForceRows.has(item.row)}
                                onChange={() => toggleForceRowSelection(item.row)}
                              />
                            )}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">{item.row + 1}</td>
                          <td className="px-4 py-2 font-mono">{item.orderCode ?? "—"}</td>
                          <td className="px-4 py-2 font-mono">{item.shippingCode ?? "—"}</td>
                          <td className="px-4 py-2">{item.amount ?? "—"}</td>
                          <td className="px-4 py-2">
                            {item.currentStatus ? getStatusLabel(item.currentStatus) : '—'}
                          </td>
                          <td className="px-4 py-2">
                            {item.targetStatus ? getStatusLabel(item.targetStatus) : '—'}
                          </td>
                          <SettlementShippingColumnCells shipping={item.shipping} />
                          <td className="whitespace-pre-line px-4 py-2 text-red-600">{item.reason}</td>
                          <td className="px-4 py-2">
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
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <BaseModal
        isOpen={closeBatchOpen}
        onClose={() => setCloseBatchOpen(false)}
        onConfirm={handleConfirm}
        title="إغلاق التحصيل"
        confirmText="تأكيد وإغلاق"
        isLoading={isConfirming}
        maxWidth="md:max-w-lg"
      >
        {batch && (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <span>الكود: <b>{batch.code}</b></span>
              <span>عدد الطلبات: <b>{batch.ordersCount}</b></span>
              <span>الإجمالي: <b>{batch.totalAmount} جنيه</b></span>
            </div>
            <p className="text-amber-700 font-medium">لا يمكن إضافة صفوف بعد الإغلاق</p>
          </div>
        )}
      </BaseModal>

      <BaseModal
        isOpen={forceSelectedOpen}
        onClose={() => setForceSelectedOpen(false)}
        onConfirm={handleForceSelected}
        title="إضافة الصفوف رغم الأخطاء"
        confirmText="تأكيد"
        isLoading={isForcingSelected}
        maxWidth="md:max-w-lg"
      >
        <div className="space-y-3 text-sm">
          <p className="font-medium">عدد الصفوف المحددة: {selectedForceRows.size}</p>
          <p className="text-amber-700">
            سيتم تغيير حالة هذه الطلبات مباشرة دون إرسال لشركة الشحن ودون تحديث التغليف
          </p>
        </div>
      </BaseModal>

      <ForceSettlementDialog
        isOpen={forcingTarget !== null}
        onClose={() => setForcingTarget(null)}
        onConfirm={handleConfirmForceTarget}
        reason={
          (forcingTarget?.source === 'failed'
            ? results?.failed.find((item) => item.row === forcingTarget.row)?.reason
            : undefined) ?? ''
        }
        hopPath={
          forcingTarget?.source === 'failed'
            ? (results?.failed.find((item) => item.row === forcingTarget.row)?.forcePath ?? null)
            : null
        }
        moveFromBatchCode={
          forcingTarget?.source === 'alreadyCollected'
            ? (results?.alreadyCollected.find((item) => item.row === forcingTarget.row)?.batch
                ?.code ?? null)
            : null
        }
      />
    </div>
  );
}
