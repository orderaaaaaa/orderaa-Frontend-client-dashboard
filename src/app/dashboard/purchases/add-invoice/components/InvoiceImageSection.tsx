'use client';

import { memo, useState } from 'react';
import { LiaImageSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/ui/image-upload-field';

interface InvoiceImageSectionProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

const InvoiceImageSection = memo(
  ({ value, onChange, error }: InvoiceImageSectionProps) => {
    const [showUpload, setShowUpload] = useState(false);

    return (
      <div className="sm:px-8 flex flex-col gap-4">
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-fit flex items-center gap-2 rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            onClick={() => setShowUpload((prev) => !prev)}
          >
            <LiaImageSolid className="w-5 h-5" />
            <span>أضافة صورة الفاتورة</span>
          </Button>
        </div>
        {showUpload && (
          <ImageUploadField
            value={value}
            onChange={onChange}
            error={error}
            title="صورة الفاتورة"
            description="قم برفع صورة الفاتورة الخاصة بالمعاملة"
          />
        )}
      </div>
    );
  },
);

InvoiceImageSection.displayName = 'InvoiceImageSection';

export default InvoiceImageSection;
