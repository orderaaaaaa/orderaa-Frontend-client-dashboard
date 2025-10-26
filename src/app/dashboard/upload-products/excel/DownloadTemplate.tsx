import { Download } from 'lucide-react';

interface DownloadTemplateProps {
  onDownload: () => void;
}

const DownloadTemplate = ({ onDownload }: DownloadTemplateProps) => {
  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-2 p-8 shadow-sm">
        <div className="flex gap-4 items-start">
          {/* Icon Container */}
          <div className="flex-shrink-0 p-4 max-sm:p-2 bg-[#CCCCCC99] rounded-lg">
            <Download className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
          </div>

          {/* Content */}
          <div className="flex-col py-3">
            <h3 className="text-2xl text-gray-900 mb-6">تحميل نموذج إكسل</h3>

            <p className="text-gray-600 leading-relaxed max-sm:text-sm mb-6">
              قم بتنزيل نموذج Excel الخاص بنا لضمان تنسيق تاريخك بشكل صحيح.
              <br />
              يتضمن النموذج جميع الحقول المطلوبة ومثال.
            </p>

            <a
              download
              href="/ordera.png"
              onClick={onDownload}
              className="flex cursor-pointer max-sm:text-base hover:bg-gray-100 justify-center w-[234px] h-[46px] text-lg items-center gap-2 px-10 py-3 font-normal rounded-lg border-2 "
            >
              <Download className="w-5 h-5" />
              تحميل القالب
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadTemplate;
