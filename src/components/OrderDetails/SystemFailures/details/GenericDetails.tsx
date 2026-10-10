import type { FailureDetailsRecord } from '@/types/orderSystemFailures';
import { DetailField, DetailGrid, formatDetailValue } from './DetailFields';

export function GenericDetails({ details }: { details: FailureDetailsRecord }) {
  const entries = Object.entries(details);
  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">لا توجد تفاصيل إضافية</p>;
  }
  return (
    <DetailGrid>
      {entries.map(([key, value]) => (
        <DetailField key={key} label={key} ltr>
          {formatDetailValue(value)}
        </DetailField>
      ))}
    </DetailGrid>
  );
}
