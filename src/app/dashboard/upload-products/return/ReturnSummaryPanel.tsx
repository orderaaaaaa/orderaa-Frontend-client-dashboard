'use client';

import React, { type ReactNode } from 'react';
import { Package } from 'lucide-react';
import Input from '@/components/ui/Input';
import { SummaryStatCard } from '@/components/ui/summary-stat-card';
import { useI18n } from '@/i18n/I18nProvider';
import { formatCount, formatMoney } from '@/utils/formatMoney';
import { carrierUnsupportedReasonOf } from '@/utils/customerReturn/carrier';
import type { CarrierSupportState } from '@/app/dashboard/upload-products/manual/types';

type ReturnSummaryPanelProps = {
  unitsCount: number;
  returnPrice: string;
  onReturnPriceChange: (value: string) => void;
  returnPriceError?: string;
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
  returnPrice,
  onReturnPriceChange,
  returnPriceError,
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
      <div className="grid grid-cols-2 gap-3">
        <SummaryStatCard
          icon={<Package className="size-5" aria-hidden="true" />}
          iconBgClassName="bg-primary/10 text-primary-text"
          label={t('customerReturn.summary.units')}
          value={formatCount(unitsCount)}
        />
        <div
          data-field-error="return-price"
          className="min-w-0 rounded-xl border border-border bg-card px-4 py-4 text-card-foreground shadow-soft sm:py-5"
        >
          <Input
            id="return-price-input"
            name="returnPrice"
            label={t('customerReturn.summary.returnPrice')}
            value={returnPrice}
            onChange={(e) => onReturnPriceChange(e.target.value)}
            inputMode="decimal"
            dir="ltr"
            error={returnPriceError}
            className="w-full"
          />
        </div>
      </div>
      <dl className="rounded-xl border border-border bg-muted/40 px-4">
        <SummaryRow
          label={t('customerReturn.summary.cod')}
          value={formatMoney('0')}
        />
        <SummaryRow
          label={t('customerReturn.summary.shippingCompany')}
          value={
            shippingCompanyName ? (
              <span className="flex flex-col items-end gap-1">
                <span>{shippingCompanyName}</span>
                {carrier && (
                  <span
                    className={
                      carrier.supported
                        ? 'text-sm text-muted-foreground'
                        : 'text-sm text-destructive'
                    }
                  >
                    {carrierState}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {t('customerReturn.summary.noCompany')}
              </span>
            )
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
