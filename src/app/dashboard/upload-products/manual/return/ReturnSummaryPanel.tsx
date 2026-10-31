'use client';

import React, { type ReactNode } from 'react';
import { Package, Wallet } from 'lucide-react';
import { SummaryStatCard } from '@/components/ui/summary-stat-card';
import { useI18n } from '@/i18n/I18nProvider';
import { formatCount, formatMoney } from '@/utils/formatMoney';
import { carrierUnsupportedReasonOf } from '@/utils/customerReturn/carrier';
import type { CarrierSupportState } from '@/app/dashboard/upload-products/manual/types';

type ReturnSummaryPanelProps = {
  unitsCount: number;
  refundValue: number;
  shippingCompanyName: string | null;
  carrier: CarrierSupportState | null;
  pickupAddress: string;
};

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-end font-medium text-foreground break-words">
        {value}
      </dd>
    </div>
  );
}

function ReturnSummaryPanel({
  unitsCount,
  refundValue,
  shippingCompanyName,
  carrier,
  pickupAddress,
}: ReturnSummaryPanelProps) {
  const { t } = useI18n();

  const carrierState = !carrier
    ? t('customerReturn.summary.noCompany')
    : carrier.supported
      ? t('customerReturn.summary.carrierSupported')
      : carrierUnsupportedReasonOf(carrier.reason, t);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryStatCard
          icon={<Package className="size-5" aria-hidden="true" />}
          iconBgClassName="bg-primary/10 text-primary"
          label={t('customerReturn.summary.units')}
          value={formatCount(unitsCount)}
        />
        <SummaryStatCard
          icon={<Wallet className="size-5" aria-hidden="true" />}
          iconBgClassName="bg-primary/10 text-primary"
          label={t('customerReturn.summary.refundValue')}
          value={formatMoney(String(refundValue))}
        />
      </div>
      <dl className="rounded-xl border border-border bg-muted/40 px-4">
        <SummaryRow
          label={t('customerReturn.summary.cod')}
          value={formatMoney('0')}
        />
        <SummaryRow
          label={t('customerReturn.summary.shippingCompany')}
          value={
            <span className="flex flex-col items-end gap-1">
              <span>
                {shippingCompanyName ?? t('customerReturn.summary.noCompany')}
              </span>
              <span
                className={
                  carrier && !carrier.supported
                    ? 'text-sm text-destructive'
                    : 'text-sm text-muted-foreground'
                }
              >
                {carrierState}
              </span>
            </span>
          }
        />
        <SummaryRow
          label={t('customerReturn.summary.pickupAddress')}
          value={pickupAddress || '—'}
        />
      </dl>
    </div>
  );
}

export default ReturnSummaryPanel;
