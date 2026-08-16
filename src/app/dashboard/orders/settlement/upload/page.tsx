'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/dashboard-layout';
import { useHasPermission } from '@/hooks/usePermissions';
import { generateSettlementTemplate } from '@/lib/excel/template-generator';
import {
  uploadSettlementRows,
  getCurrentSettlementBatch,
  confirmSettlementBatch,
  type SettlementBatch,
  type SettlementRow,
  type UploadSettlementResponse,
} from '@/lib/api/settlement';

function parseSettlementFile(file: File): Promise<SettlementRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('فشل في قراءة الملف'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error('الملف لا يحتوي على أي صفحات عمل'));
          return;
        }

        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(
          workbook.Sheets[sheetName],
          { defval: '' },
        );

        if (rows.length === 0) {
          reject(new Error('الملف فارغ أو لا يحتوي على بيانات'));
          return;
        }

        const validStatuses = ['COLLECTED', 'RETURNED_SETTLED'] as const;
        const result: SettlementRow[] = [];

        for (const row of rows) {
          const orderCode = String(row.orderCode ?? '').trim();
          const shippingCompanyCode = String(row.shippingCompanyCode ?? '').trim();

          if (!orderCode && !shippingCompanyCode) continue;

          const rawAmount = row.settlementAmount;
          const settlementAmount =
            typeof rawAmount === 'number' ? rawAmount : Number(rawAmount);
          if (Number.isNaN(settlementAmount)) continue;

          const targetStatus = String(row.targetStatus ?? '').trim() as
            | (typeof validStatuses)[number]
            | '';
          if (!validStatuses.includes(targetStatus as (typeof validStatuses)[number])) continue;

          result.push({
            orderCode: orderCode || undefined,
            shippingCompanyCode: shippingCompanyCode || undefined,
            settlementAmount,
            targetStatus: targetStatus as (typeof validStatuses)[number],
          });
        }

        if (result.length === 0) {
          reject(new Error('لا توجد صفوف صالحة في الملف'));
          return;
        }

        resolve(result);
      } catch (err) {
        reject(
          new Error(
            `فشل في قراءة الملف: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`,
          ),
        );
      }
    };
    reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
    reader.readAsBinaryString(file);
  });
}

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
  const canManageSettlement = useHasPermission('orders:settlement:manage');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<SettlementRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadSettlementResponse | null>(null);
  const [batch, setBatch] = useState<SettlementBatch | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // The collection lives on the server, so a closed browser does not lose it —
  // reopening the page picks the session back up.
  useEffect(() => {
    getCurrentSettlementBatch()
      .then(setBatch)
      .catch(() => setBatch(null));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!batch) return;
    setIsConfirming(true);
    try {
      const confirmed = await confirmSettlementBatch(batch.id);
      setBatch(confirmed);
      toast.success(
        `تم إغلاق التحصيل ${confirmed.code} — الإجمالي ${confirmed.totalAmount} جنيه عن ${confirmed.ordersCount} طلب`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر إغلاق التحصيل');
    } finally {
      setIsConfirming(false);
    }
  }, [batch]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setResults(null);
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
      // Continue the collection already on screen, so a second sheet joins the
      // same running total instead of starting a fresh one.
      const response = await uploadSettlementRows(parsedRows, batch?.id);
      setResults(response);
      setBatch(response.batch);

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
      toast.error(err instanceof Error ? err.message : 'خطأ في رفع البيانات');
    } finally {
      setIsUploading(false);
    }
  }, [parsedRows]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setParsedRows([]);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full min-h-full">
      <Breadcrumb
        items={[{ title: 'الطلبات' }, { title: 'رفع شيت التحصيل' }]}
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
            <Download className="w-4 h-4 ml-2" />
            تحميل القالب
          </Button>
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
            <div className="flex items-center gap-3">
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
                <FileSpreadsheet className="w-4 h-4 ml-2" />
                {selectedFile ? selectedFile.name : 'اختر ملف Excel'}
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
                disabled={parsedRows.length === 0 || isParsing || isUploading}
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
        </CardContent>
      </Card>
      )}

      {/* T3 — the running collection. Shown whether or not a sheet has just been
          uploaded, so a resumed session is obvious on arrival. */}
      {batch && (
        <Card>
          <CardContent className="py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  {batch.status === 'OPEN' ? 'تحصيل مفتوح' : 'تحصيل مغلق'}
                </span>
                <span className="font-bold">{batch.code}</span>
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
              <div className="flex flex-col items-end gap-1">
                <Button onClick={handleConfirm} disabled={isConfirming}>
                  {isConfirming ? 'جاري الإغلاق...' : 'تأكيد وإغلاق التحصيل'}
                </Button>
                {/* Rows settle on upload, not on confirmation. Saying so stops
                    anyone believing this button is what commits the money. */}
                <span className="text-[11px] text-muted-foreground max-w-xs text-left">
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
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-right font-medium">#</th>
                        <th className="px-4 py-2 text-right font-medium">كود الطلب</th>
                        <th className="px-4 py-2 text-right font-medium">كود الشحن</th>
                        <th className="px-4 py-2 text-right font-medium">المبلغ</th>
                        <th className="px-4 py-2 text-right font-medium">الحالة الحالية</th>
                        <th className="px-4 py-2 text-right font-medium">الحالة الجديدة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.success.map((item, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-2 font-mono">{item.orderCode}</td>
                          <td className="px-4 py-2 font-mono">{item.shippingCode ?? "—"}</td>
                          <td className="px-4 py-2">{item.amount}</td>
                          <td className="px-4 py-2">{item.currentStatus}</td>
                          <td className="px-4 py-2">{item.newStatus}</td>
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
                <div className="rounded-md border border-amber-200 overflow-x-auto">
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
                                ? new Date(item.collectedAt).toLocaleDateString('ar-EG')
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
                <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4" />
                  فشل ({results.failed.length})
                </h3>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-right font-medium">#</th>
                        <th className="px-4 py-2 text-right font-medium">كود الطلب</th>
                        <th className="px-4 py-2 text-right font-medium">كود الشحن</th>
                        <th className="px-4 py-2 text-right font-medium">المبلغ</th>
                        <th className="px-4 py-2 text-right font-medium">الحالة الحالية</th>
                        <th className="px-4 py-2 text-right font-medium">الحالة المطلوبة</th>
                        <th className="px-4 py-2 text-right font-medium">رسالة الخطأ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.failed.map((item, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-2 text-muted-foreground">{item.row}</td>
                          <td className="px-4 py-2 font-mono">{item.orderCode ?? "—"}</td>
                          <td className="px-4 py-2 font-mono">{item.shippingCode ?? "—"}</td>
                          <td className="px-4 py-2">{item.amount ?? "—"}</td>
                          <td className="px-4 py-2">{item.currentStatus ?? "—"}</td>
                          <td className="px-4 py-2">{item.targetStatus ?? "—"}</td>
                          <td className="px-4 py-2 text-red-600">{item.reason}</td>
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
    </div>
  );
}
