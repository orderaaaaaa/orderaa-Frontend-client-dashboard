'use client';

import {
  LiaCheckSolid,
  LiaSpinnerSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';

interface WizardFooterProps {
  isStep1Valid: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function WizardFooter({
  isStep1Valid,
  isSubmitting,
  onSubmit,
}: WizardFooterProps) {
  return (
    <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 bg-white border rounded-lg border-gray-200 py-3 px-4 sm:px-6 flex items-center justify-center gap-2 mt-auto">
      <Button
        type="button"
        size="lg"
        onClick={onSubmit}
        disabled={!isStep1Valid || isSubmitting}
        className="min-w-[200px]"
      >
        {isSubmitting ? (
          <LiaSpinnerSolid className="w-4 h-4 animate-spin" />
        ) : (
          <LiaCheckSolid className="w-4 h-4" />
        )}
        {isSubmitting ? 'جاري الإرسال...' : 'تأكيد استلام المرتجعات'}
      </Button>
    </div>
  );
}
