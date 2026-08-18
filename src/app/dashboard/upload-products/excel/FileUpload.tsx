import React, { useState, useRef } from 'react';
import { Download, CircleCheck, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { processExcelFile } from '@/lib/excel/processor';
import { importBulkOrders, transformToApiFormat, getMerchantIdFromUser } from '@/lib/api/bulk-import';
import { useAuthStore } from '@/store/authStore';
import { Can } from '@/components/Can';
import { PERMISSION_CODES } from '@/lib/permissions';

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Validate file type
      if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.csv')
      ) {
        setUploadedFile(file);
      } else {
        setError('يرجى اختيار ملف Excel صحيح (.xlsx, .xls, .csv)');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setError(null);
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      handleBrowseClick();
      return;
    }

    if (!user) {
      setError('يجب تسجيل الدخول أولاً');
      return;
    }

    setIsProcessing(true);
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
          setError(`خطأ في البيانات: ${message}`);
        } else {
          setError(`خطأ من الخادم: ${message}`);
        }
      } else if (err.request) {
        setError('لا يمكن الاتصال بالخادم. تحقق من اتصالك بالإنترنت');
      } else {
        setError(err.message || 'حدث خطأ أثناء معالجة الملف');
      }

      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-2 p-8 shadow-sm">
        <div className="flex gap-4 items-start">
          {/* Icon Container */}
          <div className="flex-shrink-0 max-sm:p-2 p-4 bg-[#CCCCCC99] rounded-lg">
            <Download className="w-5 h-5 max-sm:w-4 max-sm:w-h rotate-180" />
          </div>

          {/* Content */}
          <div className="flex-col py-3 w-full">
            <h3 className="text-2xl font-normal max-sm:text-[19px] max-sm:font-semibold text-gray-900 max-sm:mb-3 mb-6 text-right">
              قم بتحميل ملف الإكسل الخاص بك
            </h3>

            <p className="text-gray-600 max-sm:text-sm font-normal leading-relaxed mb-6 text-right">
              اختر ملف Excel الذي يحتوي على بياناتك. تأكد من أنه يتبع تنسيق
              القالب.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-right">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Drop Zone */}
            <div
              className={`max-w-[923px] relative max-sm:left-5 border-2 mx-auto border-dashed rounded-2xl py-20 mb-6 transition-all cursor-pointer ${isDragging
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <img
                  src="/Icons/file.svg"
                  className="w-14 h-14 text-gray-400"
                // strokeWidth={1.5}
                />
                {uploadedFile ? (
                  <div className="">
                    <h5 className="flex gap-2 items-center text-lg max-sm:text-base">
                      {uploadedFile.name}
                      <CircleCheck className="w-6 h-6 text-primary" />
                    </h5>
                    <p className="text-gray-600 text-base text-[14px] ml-4">
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
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                className="hidden"
                accept=".xlsx,.xls,.csv"
              />
            </div>

            {/* Analysis posts to /orders/bulk-validate + /orders/bulk-import. */}
            <Can code={PERMISSION_CODES.ORDERS_IMPORT}>
            <div className="flex gap-4 max-sm:gap-1 justify-center relative max-sm:left-5">
              <button
                onClick={handleUpload}
                disabled={isProcessing}
                className="flex cursor-pointer justify-center max-sm:gap-1 max-sm:text-sm w-full max-w-md h-[46px] text-lg items-center gap-2 px-6 py-3 font-normal rounded-full bg-primary text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a1db5]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحليل...
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
                  onClick={handleClearFile}
                  className="flex items-center font-bold text-[15px] cursor-pointer gap-4 max-sm:gap-1 max-sm:text-sm border-2 px-5 text-[#5D24E199] border-[#5D24E199] rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all"
                >
                  {' '}
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
