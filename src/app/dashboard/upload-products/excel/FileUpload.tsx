import React, { useState, useRef, useId } from 'react';
import { Download, CircleCheck, X, Loader2, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { processExcelFile } from '@/lib/excel/processor';
import { importBulkOrders, transformToApiFormat, getMerchantIdFromUser } from '@/lib/api/bulk-import';
import { useAuthStore } from '@/store/authStore';
import { Can } from '@/components/Can';
import { PERMISSION_CODES } from '@/lib/permissions';

type UploadStage = 'reading' | 'importing';

const ARABIC_PATTERN = /[؀-ۿ]/;

const isExcelFile = (file: File) =>
  file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
  file.type === 'application/vnd.ms-excel' ||
  file.name.endsWith('.xlsx') ||
  file.name.endsWith('.xls') ||
  file.name.endsWith('.csv');

const arabicOr = (message: unknown, fallback: string) =>
  typeof message === 'string' && ARABIC_PATTERN.test(message) ? message : fallback;

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage | null>(null);
  const [importCount, setImportCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const isProcessing = stage !== null;
  const router = useRouter();
  const { user } = useAuthStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    if (isProcessing) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      acceptFile(files[0]);
    }
  };

  const acceptFile = (file: File) => {
    // Validate file type
    if (isExcelFile(file)) {
      setUploadedFile(file);
    } else {
      setError('يرجى اختيار ملف Excel صحيح (.xlsx, .xls, .csv)');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setError(null);
    if (files && files.length > 0) {
      acceptFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    if (!user) {
      setError('يجب تسجيل الدخول أولاً');
      return;
    }

    setStage('reading');
    setError(null);

    try {
      const results = await processExcelFile(uploadedFile);

      if (results.errorCount > 0) {
        sessionStorage.setItem('excelValidationResults', JSON.stringify(results));
        sessionStorage.setItem('excelValidationOnly', 'true');
        router.push(`/dashboard/upload-products/excel/results`);
        return;
      }

      const apiOrders = transformToApiFormat(
        results.validOrders.map(order => ({
          rowIndex: order.rowIndex,
          data: order.data,
        })),
        results.detectedFormat
      );

      const merchantId = user.merchantId ?? user.id;

      setImportCount(apiOrders.length);
      setStage('importing');

      const backendResponse = await importBulkOrders({
        format: results.detectedFormat,
        merchantId,
        orders: apiOrders,
      });

      const combinedResults = {
        ...results,
        backendResponse,
        imported: true,
      };

      sessionStorage.setItem('excelValidationResults', JSON.stringify(combinedResults));
      sessionStorage.removeItem('excelValidationOnly');

      router.push(`/dashboard/upload-products/excel/results`);
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || err.message;

        if (status === 401) {
          setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
        } else if (status === 404) {
          setError('لم يتم العثور على المتجر. يرجى التواصل مع الدعم');
        } else if (status === 400) {
          setError(`خطأ في البيانات: ${arabicOr(message, 'راجع بيانات الملف وحاول مرة أخرى')}`);
        } else {
          setError(arabicOr(message, 'تعذر رفع الطلبات، حاول مرة أخرى'));
        }
      } else if (err.request) {
        setError('لا يمكن الاتصال بالخادم. تحقق من اتصالك بالإنترنت');
      } else {
        setError(arabicOr(err.message, 'حدث خطأ أثناء معالجة الملف'));
      }

      setStage(null);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const stageText =
    stage === 'reading'
      ? 'جاري قراءة الملف والتحقق من الصفوف...'
      : stage === 'importing'
        ? `جاري إنشاء ${importCount} طلب في النظام...`
        : null;

  return (
    <div className="bg-gray-50 px-4 sm:px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full min-w-0 bg-white border border-gray-200 rounded-xl p-4 sm:p-8 shadow-sm">
        <div className="flex gap-3 sm:gap-4 items-start">
          {/* Icon Container */}
          <div className="flex-shrink-0 max-sm:p-2 p-4 bg-[#CCCCCC99] rounded-lg">
            <Download className="w-5 h-5 max-sm:w-4 max-sm:h-4 rotate-180" />
          </div>

          {/* Content */}
          <div className="flex-col py-3 w-full min-w-0">
            <h3 className="text-2xl font-normal max-sm:text-[19px] max-sm:font-semibold text-gray-900 max-sm:mb-3 mb-6 text-right">
              قم بتحميل ملف الإكسل الخاص بك
            </h3>

            <p className="text-gray-600 max-sm:text-sm font-normal leading-relaxed mb-6 text-right">
              اختر ملف Excel الذي يحتوي على بياناتك. تأكد من أنه يتبع تنسيق
              القالب.
            </p>

            {/* Error Message */}
            {error && (
              <div role="alert" className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-right">
                <p className="text-red-600 text-sm break-words">{error}</p>
              </div>
            )}

            {/* Drop Zone */}
            <label
              htmlFor={inputId}
              className={`block max-w-[923px] border-2 mx-auto border-dashed rounded-2xl py-12 sm:py-20 px-4 mb-6 transition-all cursor-pointer focus-within:ring-2 focus-within:ring-primary/40 ${isDragging
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
                } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <img
                  src="/Icons/file.svg"
                  alt=""
                  className="w-14 h-14 text-gray-400"
                // strokeWidth={1.5}
                />
                {uploadedFile ? (
                  <div className="min-w-0 max-w-full">
                    <h5 className="flex gap-2 items-center justify-center text-lg max-sm:text-base break-all">
                      {uploadedFile.name}
                      <CircleCheck className="w-6 h-6 shrink-0 text-primary" />
                    </h5>
                    <p className="text-gray-600 text-[14px]">
                      اضغط لتغيير الملف
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 text-[16px]">
                    انقر لتحديد ملف إكسل أو اسحبه هنا
                  </p>
                )}
              </div>

              <input
                id={inputId}
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                className="sr-only"
                accept=".xlsx,.xls,.csv"
                disabled={isProcessing}
              />
            </label>

            {stageText && (
              <p role="status" className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                {stageText}
              </p>
            )}

            {/* Analysis posts to /orders/bulk-validate + /orders/bulk-import. */}
            <Can code={PERMISSION_CODES.ORDERS_IMPORT}>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={handleBrowseClick}
                disabled={isProcessing}
                className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-primary px-5 text-base text-primary transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FolderOpen className="w-5 h-5" />
                اختر ملف
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isProcessing || !uploadedFile}
                className="flex cursor-pointer justify-center max-sm:text-base w-full sm:w-auto sm:min-w-[240px] max-w-md min-h-10 sm:h-[46px] text-lg items-center gap-2 px-6 font-normal rounded-full bg-primary text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a1db5]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {stage === 'importing' ? 'جاري الرفع...' : 'جاري التحليل...'}
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 rotate-180" />
                    تحليل الملف
                  </>
                )}
              </button>
              {uploadedFile && !isProcessing ? (
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="flex min-h-10 items-center font-bold text-[15px] cursor-pointer gap-2 border-2 px-5 text-[#5D24E199] border-[#5D24E199] rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all"
                >
                  <X className="w-5 h-5 " />
                  إلغاء
                </button>
              ) : null}
            </div>
            </Can>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
