import type { StockWorkflowApiItem } from '@/lib/api/warehouses';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { useStockWorkflowsQuery } from '@/services/warehouses';
import type { StockMovementBypassedDetails } from '@/types/orderSystemFailures';
import { DetailField, DetailGrid, EMPTY_VALUE } from './DetailFields';

const PREDECESSOR_RULE_REF_PREFIX = 'rule:';

export function BypassedVariantsDetails({
  details,
}: {
  details: StockMovementBypassedDetails;
}) {
  const { getStatusLabel } = useStatusLabel();
  const { data: rules } = useStockWorkflowsQuery();

  const findPredecessorRule = (key: string): StockWorkflowApiItem | undefined => {
    if (key.startsWith(PREDECESSOR_RULE_REF_PREFIX)) {
      return rules?.find(
        (rule) => `${PREDECESSOR_RULE_REF_PREFIX}${rule.id}` === key
      );
    }
    return rules?.find((rule) => rule.presetKey === key);
  };

  const predecessorTargetLabel = (rule: StockWorkflowApiItem) => {
    if (rule.toSelection === 'ANY') return 'أي حالة';
    if (rule.toSelection === 'RANGE') {
      return rule.toRangeStart && rule.toRangeEnd
        ? `${getStatusLabel(rule.toRangeStart)} إلى ${getStatusLabel(rule.toRangeEnd)}`
        : EMPTY_VALUE;
    }
    return rule.toStatuses.map((status) => getStatusLabel(status)).join('، ') || EMPTY_VALUE;
  };

  const predecessorLabel = (key: string) => {
    const rule = findPredecessorRule(key);
    return rule ? predecessorTargetLabel(rule) : key;
  };

  const sentences = Array.from(
    new Set(
      details.lines.map((line) => {
        const warehouse = line.fromWarehouseName ?? 'المخزون';
        const predecessors = line.predecessorKeys.map(predecessorLabel).join('، ');
        return `لم يُنقل مخزون ${warehouse} في «${getStatusLabel(details.toStatus)}» لأن «${predecessors}» لم يحركه`;
      })
    )
  );

  return (
    <div className="flex flex-col gap-3">
      <DetailGrid>
        <DetailField label="من حالة">
          {details.fromStatus ? getStatusLabel(details.fromStatus) : EMPTY_VALUE}
        </DetailField>
        <DetailField label="إلى حالة">{getStatusLabel(details.toStatus)}</DetailField>
      </DetailGrid>
      <ul className="list-disc ps-5 text-sm">
        {sentences.map((sentence) => (
          <li key={sentence}>{sentence}</li>
        ))}
      </ul>
    </div>
  );
}
