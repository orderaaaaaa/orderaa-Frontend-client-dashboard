'use client';

import React from 'react';
import { toast } from 'react-toastify';
import DownloadTemplate from './DownloadTemplate';
import FileUpload from './FileUpload';
import StaticSection from './StaticSection';

function Exel() {
  const handleDownload = () => {
    toast.success('تم تنزيل القالب بنجاح');
  };

  return (
    <div className="flex flex-col gap-8">
      <DownloadTemplate onDownload={handleDownload} />
      <FileUpload />
      <StaticSection />
    </div>
  );
}

export default Exel;
