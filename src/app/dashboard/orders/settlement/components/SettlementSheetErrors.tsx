import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SettlementSheetError } from '@/lib/excel/parse-settlement-file';
import { settlementAcceptedNamesSentence } from '@/lib/excel/settlement-target-names';

interface SettlementSheetErrorsProps {
  errors: SettlementSheetError[];
  className?: string;
}

export default function SettlementSheetErrors({ errors, className }: SettlementSheetErrorsProps) {
  if (errors.length === 0) return null;

  return (
    <div className={cn('rounded-md border border-red-200 bg-red-50 p-3 text-sm space-y-2', className)}>
      <p className="font-semibold text-red-700 flex items-center gap-2">
        <XCircle className="w-4 h-4 shrink-0" />
        صفوف لن تُرفع ({errors.length})
      </p>
      <ul className="max-h-48 overflow-y-auto space-y-1 text-red-700">
        {errors.map((error) => (
          <li key={error.sheetRow}>
            الصف {error.sheetRow}: {error.message}
          </li>
        ))}
      </ul>
      <p className="text-red-700">الأسماء المقبولة — {settlementAcceptedNamesSentence()}</p>
    </div>
  );
}
