'use client';

import React from 'react';
import ToggleField from './components/ToggleField';
import { ConfirmationSectionProps } from './types';

function ConfirmationSection({
  needsConfirmation,
  onNeedsConfirmationChange,
}: ConfirmationSectionProps) {
  return (
    <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <ToggleField
          label="يحتاج إلى تأكيد"
          description="إذا كان مفعلاً سيتم إنشاء الطلب بحالة 'طلب جديد'، وإلا سيكون 'مؤكد'"
          checked={needsConfirmation}
          onCheckedChange={onNeedsConfirmationChange}
        />
      </div>
    </div>
  );
}

export default ConfirmationSection;
