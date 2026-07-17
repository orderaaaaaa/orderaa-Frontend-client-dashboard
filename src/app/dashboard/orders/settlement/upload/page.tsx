'use client';

import { useCallback, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/dashboard-layout';
import { generateSettlementTemplate } from '@/lib/excel/template-generator';
import {
  uploadSettlementRows,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<SettlementRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadSettlementResponse | null>(null);

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
      const response = await uploadSettlementRows(parsedRows);
      setResults(response);

      if (response.failed.length === 0) {
        toast.success(`تم رفع ${response.success.length} صف بنجاح`);
      } else if (response.success.length > 0) {
        toast.success(`تم رفع ${response.success.length} صف بنجاح`);
        toast.error(`فشل ${response.failed.length} صف`);
      } else {
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

      {/* Upload Section */}
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
                      </tr>
                    </thead>
                    <tbody>
                      {results.success.map((code, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-2 font-mono">{code}</td>
                        </tr>
                      ))}
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
                        <th className="px-4 py-2 text-right font-medium">صف</th>
                        <th className="px-4 py-2 text-right font-medium">السبب</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.failed.map((item, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-2 text-muted-foreground">{item.row}</td>
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
