import { useStatusLabel } from '@/hooks/useStatusLabel';
import { integrationLabelOf } from '@/lib/shippingCompanies';
import type {
  CarrierReturnAtMerchantDetails,
  CarrierStatusCorrectedDetails,
  CarrierStatusIgnoredOutsideWindowDetails,
  CarrierStatusIgnoredPartialReturnDetails,
  CarrierStatusIgnoredStaleDetails,
  CarrierStatusNotAppliedDetails,
  CarrierStatusUnmappedDetails,
} from '@/types/orderSystemFailures';
import { DetailField, DetailGrid, EMPTY_VALUE } from './DetailFields';
import { FailureReasonDetails } from './FailureReasonDetails';

type CarrierDetailsValue =
  | CarrierStatusUnmappedDetails
  | CarrierStatusIgnoredPartialReturnDetails
  | CarrierStatusIgnoredStaleDetails
  | CarrierStatusIgnoredOutsideWindowDetails
  | CarrierStatusNotAppliedDetails
  | CarrierStatusCorrectedDetails
  | CarrierReturnAtMerchantDetails;

export function CarrierDetails({ details }: { details: CarrierDetailsValue }) {
  const { getStatusLabel } = useStatusLabel();

  return (
    <div className="flex flex-col gap-3">
      <DetailGrid>
        <DetailField label="شركة الشحن">
          {integrationLabelOf(details.carrier) ?? details.carrier}
        </DetailField>
        <DetailField label="الحالة كما أرسلتها شركة الشحن" ltr>
          {details.rawStatus}
        </DetailField>
        {'incomingStatus' in details && (
          <DetailField label="الحالة المقابلة في النظام">
            {getStatusLabel(details.incomingStatus)}
          </DetailField>
        )}
        {'currentStatus' in details && (
          <DetailField label="حالة الطلب وقتها">
            {details.currentStatus ? getStatusLabel(details.currentStatus) : EMPTY_VALUE}
          </DetailField>
        )}
        {'fromStatus' in details && (
          <DetailField label="الحالة قبل التصحيح">{getStatusLabel(details.fromStatus)}</DetailField>
        )}
        {'toStatus' in details && (
          <DetailField label="الحالة بعد التصحيح">{getStatusLabel(details.toStatus)}</DetailField>
        )}
      </DetailGrid>
      {'reason' in details && <FailureReasonDetails reason={details.reason} />}
    </div>
  );
}
