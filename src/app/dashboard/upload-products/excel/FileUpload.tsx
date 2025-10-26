import React, { useState, useRef } from 'react';
import { Download, FileText, CircleCheck, X } from 'lucide-react';

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (uploadedFile) {
      // Handle file upload logic here
      console.log('Uploading file:', uploadedFile.name);
    } else {
      // If no file selected, open file browser
      handleBrowseClick();
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    // Reset the file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-4 p-8 shadow-sm">
        <div className="flex gap-4 items-start">
          {/* Icon Container */}
          <div className="flex-shrink-0 max-sm:p-3 p-4 bg-[#CCCCCC99] rounded-lg">
            <Download className="w-5 h-5 rotate-180" />
          </div>

          {/* Content */}
          <div className="flex-col py-3 w-full">
            <h3 className="text-2xl font-normal text-gray-900 mb-6 text-right">
              قم بتحميل ملف الإكسل الخاص بك
            </h3>

            <p className="text-gray-600 font-normal leading-relaxed mb-6 text-right">
              اختر ملف Excel الذي يحتوي على بياناتك. تأكد من أنه يتبع تنسيق
              القالب.
            </p>

            {/* Drop Zone */}
            <div
              className={`max-w-[923px] border-2 mx-auto border-dashed rounded-2xl py-20 mb-6 transition-all cursor-pointer ${
                isDragging
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <FileText
                  className="w-14 h-14 text-gray-400"
                  strokeWidth={1.5}
                />
                {uploadedFile ? (
                  <div className="">
                    <h5 className="flex gap-2 items-center text-lg">
                      Start company template
                      <CircleCheck className="w-6 h-6 text-[#5D24E1]" />
                    </h5>
                    <p className="text-gray-600 text-base text-[16px] ml-4">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 text-base">
                    انقر لتحديد ملف إكسل
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

            <div className="flex gap-4 justify-center">
              <a
                onClick={handleUpload}
                className="flex cursor-pointer justify-center w-full max-w-md h-[46px] text-lg items-center gap-2 px-6 py-3 font-normal rounded-full bg-[#5D24E1] text-white transition-all"
              >
                <Download className="w-5 h-5 rotate-x-180" />
                تحميل الملف
              </a>
              {uploadedFile ? (
                <button
                  onClick={handleClearFile}
                  className="flex items-center font-bold text-[15px] cursor-pointer gap-4 border-2 px-5 text-[#5D24E199] border-[#5D24E199] rounded-full"
                >
                  {' '}
                  <X className="w-5 h-5 " />
                  إلغاء
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
