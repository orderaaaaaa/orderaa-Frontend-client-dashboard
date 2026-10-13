import { cn } from '@/lib/utils';
import {
  SETTLEMENT_TARGETS,
  SETTLEMENT_TARGET_NAMES,
  settlementTargetAcceptedNames,
} from '@/lib/excel/settlement-target-names';

interface SettlementSheetNamesNoteProps {
  className?: string;
}

export default function SettlementSheetNamesNote({ className }: SettlementSheetNamesNoteProps) {
  return (
    <div className={cn('space-y-2 text-sm', className)}>
      <p className="text-muted-foreground">اكتب الحالة في عمود targetStatus بأحد هذه الأسماء:</p>
      {SETTLEMENT_TARGETS.map((target) => (
        <div key={target} className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium">{SETTLEMENT_TARGET_NAMES[target].label}:</span>
          {settlementTargetAcceptedNames(target).map((name) => (
            <span
              key={name}
              dir="auto"
              className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs"
            >
              {name}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
