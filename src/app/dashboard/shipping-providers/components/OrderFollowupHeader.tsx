'use client';

import { Truck } from 'lucide-react';
import CopyableCode from '@/components/ui/copyable-code';
import { useI18n } from '@/i18n/I18nProvider';
import { FOLLOWUP_DIALOG_TITLE } from './followupNotesConstants';
import { LatenessChip, latenessChipOf } from './LatenessChip';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';
import type { FollowupTarget } from './followupPanels';

interface OrderFollowupHeaderProps {
  orderCode: string;
  shippingCode: string | null;
  customerName: string | null;
  carrierName: string;
  governorate: string | null;
  status: FollowupTarget['status'];
  lateness: FollowupTarget['lateness'];
}

export function OrderFollowupHeader({
  orderCode,
  shippingCode,
  customerName,
  carrierName,
  governorate,
  status,
  lateness,
}: OrderFollowupHeaderProps) {
  const { t } = useI18n();
  const meta = [customerName ?? '—', carrierName, governorate].filter(Boolean).join(' · ');

  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text">
        <Truck className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">{FOLLOWUP_DIALOG_TITLE}</span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <CopyableCode value={orderCode} label={t('inProcess.sheet.copyCode')}>
            <span dir="ltr" className="font-mono text-base font-semibold text-foreground">
              {orderCode}
            </span>
          </CopyableCode>
          {shippingCode && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{t('inProcess.sheet.shippingCode')}</span>
              <CopyableCode value={shippingCode} label={t('inProcess.table.copyShippingCode')}>
                <span dir="ltr" className="font-mono text-sm text-muted-foreground">
                  {shippingCode}
                </span>
              </CopyableCode>
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShipmentStatusBadge status={status} />
          {lateness && <LatenessChip model={latenessChipOf(lateness, t)} />}
        </div>
        <p className="truncate text-sm text-muted-foreground">{meta}</p>
      </div>
    </div>
  );
}
