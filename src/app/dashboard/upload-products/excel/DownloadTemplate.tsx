'use client';

import { Download } from 'lucide-react';
import { generateAppFormatTemplate, generateEasyOrderFormatTemplate } from '@/lib/excel/template-generator';

interface DownloadTemplateProps {
  onDownload: () => void;
}

const DownloadTemplate = ({ onDownload }: DownloadTemplateProps) => {
  const handleDownloadAppFormat = () => {
    const blob = generateAppFormatTemplate();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orderaa-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    onDownload();
  };

  const handleDownloadEasyOrderFormat = () => {
    const blob = generateEasyOrderFormatTemplate();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'easyorder-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    onDownload();
  };

  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-2 p-8 shadow-sm">
        <div className="flex gap-4 items-start">
          {/* Icon Container */}
          <div className="flex-shrink-0 p-4 max-sm:p-2 bg-[#CCCCCC99] rounded-lg">
            <Download className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
          </div>

          {/* Content */}
          <div className="flex-col py-3 w-full">
            <h3 className="text-2xl text-gray-900 mb-6">تحميل نموذج إكسل</h3>

            <p className="text-gray-600 leading-relaxed max-sm:text-sm mb-6">
              قم بتنزيل نموذج Excel الخاص بنا لضمان تنسيق بياناتك بشكل صحيح.
              <br />
              يتضمن النموذج جميع الحقول المطلوبة ومثال.
            </p>

            <div className="flex gap-4 max-sm:flex-col">
              <button
                onClick={handleDownloadAppFormat}
                className="flex cursor-pointer max-sm:text-sm hover:bg-gray-100 justify-center w-full max-w-[320px] h-[46px] text-lg items-center gap-2 px-6 py-3 font-normal rounded-lg border-2 border-gray-300 text-gray-700 transition-all whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                تحميل قالب Orderaa
              </button>

              <button
                onClick={handleDownloadEasyOrderFormat}
                className="flex cursor-pointer max-sm:text-sm hover:bg-gray-100 justify-center w-full max-w-[320px] h-[46px] text-lg items-center gap-2 px-6 py-3 font-normal rounded-lg border-2 border-gray-300 text-gray-700 transition-all whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                تحميل قالب EasyOrder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadTemplate;
