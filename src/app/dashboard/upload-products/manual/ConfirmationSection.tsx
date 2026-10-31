'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import ToggleField from './components/ToggleField';
import { ConfirmationSectionProps } from './types';

function ConfirmationSection({
  description,
  needsConfirmation,
  onNeedsConfirmationChange,
  className,
  switchClassName,
}: ConfirmationSectionProps) {
  return (
    <div
      className={cn(
        'bg-card max-sm:px-0 px-6 flex items-center justify-center',
        className,
      )}
    >
      <div className="w-full bg-card border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <ToggleField
          label="يحتاج إلى تأكيد"
          description={description ?? "إذا كان مفعلاً سيتم إنشاء الطلب بحالة 'طلب جديد'، وإلا سيكون 'مؤكد'"}
          checked={needsConfirmation}
          onCheckedChange={onNeedsConfirmationChange}
          switchClassName={switchClassName}
        />
      </div>
    </div>
  );
}

export default ConfirmationSection;
