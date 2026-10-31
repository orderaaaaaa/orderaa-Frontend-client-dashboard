'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import Input from '@/components/ui/Input';
import ToggleGroup from '@/components/ui/toggle-group';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/I18nProvider';
import type { FollowupExchangeShippingPayer } from '@/lib/api/followup';
import { formatNumber } from './formatNumber';

const MAX_TEXT_LENGTH = 1000;

interface ExchangeSummaryStepProps {
  returnedValue: number;
  newValue: number;
  difference: number;
  payer: FollowupExchangeShippingPayer;
  codInput: string;
  codInvalid: boolean;
  content: string;
  notes: string;
  disabled: boolean;
  onChangePayer: (payer: FollowupExchangeShippingPayer) => void;
  onChangeCod: (value: string) => void;
  onChangeContent: (value: string) => void;
  onChangeNotes: (value: string) => void;
}

export function ExchangeSummaryStep({
  returnedValue,
  newValue,
  difference,
  payer,
  codInput,
  codInvalid,
  content,
  notes,
  disabled,
  onChangePayer,
  onChangeCod,
  onChangeContent,
  onChangeNotes,
}: ExchangeSummaryStepProps) {
  const { t } = useI18n();
  const contentTrimmed = content.trim();
  const contentError =
    contentTrimmed === ''
      ? t('exchange.create.step3.contentRequired')
      : content.length > MAX_TEXT_LENGTH
        ? t('exchange.create.step3.contentTooLong')
        : undefined;
  const notesError = notes.length > MAX_TEXT_LENGTH ? t('exchange.create.step3.notesTooLong') : undefined;
  const refundDue = difference < 0 ? -difference : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-2 rounded-lg bg-muted p-3 text-sm sm:grid-cols-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t('exchange.create.step3.returnedValue')}</span>
          <span className="font-medium tabular-nums">{`${formatNumber(returnedValue, 2)} ج.م`}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t('exchange.create.step3.newValue')}</span>
          <span className="font-medium tabular-nums">{`${formatNumber(newValue, 2)} ج.م`}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t('exchange.create.step3.difference')}</span>
          <span className="font-medium tabular-nums">{`${formatNumber(difference, 2)} ج.م`}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t('exchange.create.step3.newValueHint')}</p>

      {refundDue > 0 && (
        <Alert>
          <AlertDescription>
            {t('exchange.create.step3.refundDue', { amount: formatNumber(refundDue, 2) })}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <span className="font-bold text-foreground">{t('exchange.create.step3.payer')}</span>
        <ToggleGroup
          options={[
            { value: 'CUSTOMER', label: t('exchange.create.payer.CUSTOMER') },
            { value: 'MERCHANT', label: t('exchange.create.payer.MERCHANT') },
          ]}
          value={payer}
          onChange={onChangePayer}
          disabled={disabled}
        />
        {payer === 'CUSTOMER' && (
          <p className="text-xs text-muted-foreground">{t('exchange.create.step3.shippingNote')}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Input
          type="number"
          label={t('exchange.create.step3.cod')}
          value={codInput}
          onChange={(e) => onChangeCod(e.target.value)}
          min={0}
          max={9999999}
          step="0.01"
          inputMode="decimal"
          error={codInvalid ? t('exchange.create.step3.codInvalid') : undefined}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">{t('exchange.create.step3.codHint')}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="exchangeReturnContent" className="font-bold text-foreground">
          {t('exchange.create.step3.content')} <span className="text-destructive">*</span>
        </label>
        <Textarea
          name="exchangeReturnContent"
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
          disabled={disabled}
          aria-invalid={contentError !== undefined}
        />
        {contentError !== undefined && <p className="text-sm text-destructive">{contentError}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="exchangeNotes" className="font-bold text-foreground">
          {t('exchange.create.step3.notes')}
        </label>
        <Textarea
          name="exchangeNotes"
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          disabled={disabled}
          aria-invalid={notesError !== undefined}
        />
        {notesError !== undefined && <p className="text-sm text-destructive">{notesError}</p>}
      </div>
    </div>
  );
}
