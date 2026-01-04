'use client';

import React, { useState } from 'react';
import DownloadTemplate from './DownloadTemplate';
import FileUpload from './FileUpload';
import StaticSection from './StaticSection';
import { CircleCheck } from 'lucide-react';

function Exel() {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <DownloadTemplate onDownload={handleDownload} />
        <FileUpload />
        <StaticSection />
      </div>
      {downloaded && (
        <div className="flex w-[304px] h-[41px] items-center gap-4 px-6 mr-6 mt-3 shadow-sm rounded-lg bg-white font-semibold text-lg">
          <CircleCheck className="w-6 h-6 text-primary" />
          تم تنزيل القالب بنجاح
        </div>
      )}
    </>
  );
}

export default Exel;
