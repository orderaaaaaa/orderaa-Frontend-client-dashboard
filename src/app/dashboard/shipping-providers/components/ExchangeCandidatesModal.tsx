'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  isLineComplete,
  lineKeyOf,
  linesFromPicker,
  mergeLines,
  orderVariants,
} from '@/components/orders/ChangeProductsModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import ProductSelectionModal, { type SelectableProduct } from '@/components/ui/product-selection-modal';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import type {
  FollowupChangeProductInput,
  FollowupExchangeBody,
  FollowupExchangeCandidateItem,
  FollowupExchangeReason,
  FollowupExchangeResponse,
  FollowupExchangeShippingPayer,
} from '@/lib/api/followup';
import { PERMISSIONS } from '@/lib/permissions';
import { useCreateExchangeMutation, useExchangeCandidatesQuery } from '@/services/followup';
import { getApiErrorMessage } from '@/utils/apiError';
import { carrierSendNeedsAttention, carrierSendNotSentWarningAfter } from '@/utils/manualOrder/carrierSend';
import { ExchangeCandidateStep } from './ExchangeCandidateStep';
import { ExchangeProductsStep, itemKeyOf, type ExchangeLine } from './ExchangeProductsStep';
import { ExchangeStepIndicator } from './ExchangeStepIndicator';
import { ExchangeSummaryStep } from './ExchangeSummaryStep';

const MAX_TOTAL_COST = 9_999_999;
const MAX_TEXT_LENGTH = 1000;

interface ExchangeCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  onDone?: (response: FollowupExchangeResponse) => void;
}

const cents = (value: number): number => Math.round(value * 100) / 100;

const defaultPayerOf = (reason: FollowupExchangeReason): FollowupExchangeShippingPayer =>
  reason === 'DEFECT_OR_WRONG_ITEM' ? 'MERCHANT' : 'CUSTOMER';

const exchangeLinesFromPicker = (products: SelectableProduct[]): ExchangeLine[] =>
  products.map((product) => ({ ...linesFromPicker([product])[0], price: product.price }));

export function ExchangeCandidatesModal({ isOpen, onClose, orderId, onDone }: ExchangeCandidatesModalProps) {
  const { t } = useI18n();
  const { hasPermission } = usePermissionCheck();
  const canManage = hasPermission(PERMISSIONS.FOLLOWUP_MANAGE);
  const candidatesQuery = useExchangeCandidatesQuery(orderId, isOpen);
  const createMutation = useCreateExchangeMutation();
  const candidates = candidatesQuery.data?.data ?? [];
  const isPending = createMutation.isPending;

  const [step, setStep] = useState(0);
  const [sourceId, setSourceId] = useState<number | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [lines, setLines] = useState<ExchangeLine[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [reason, setReason] = useState<FollowupExchangeReason>('SIZE_OR_COLOR');
  const [payer, setPayer] = useState<FollowupExchangeShippingPayer>('CUSTOMER');
  const [codTouched, setCodTouched] = useState(false);
  const [codInput, setCodInput] = useState('');
  const [contentTouched, setContentTouched] = useState(false);
  const [contentInput, setContentInput] = useState('');
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const source = candidates.find((candidate) => candidate.id === sourceId) ?? null;
  const returnedUnits = (source?.items ?? []).flatMap((item) => {
    const stored = returnQuantities[itemKeyOf(item)];
    return stored === undefined ? [] : [{ item, quantity: Math.min(stored, item.quantity) }];
  });
  const returnedValue = cents(returnedUnits.reduce((sum, { item, quantity }) => sum + item.unitPrice * quantity, 0));
  const newValue = cents(lines.reduce((sum, line) => sum + line.price * line.quantity, 0));
  const difference = cents(newValue - returnedValue);

  const shippingDue = payer === 'CUSTOMER' ? (source?.shippingCost ?? 0) : 0;
  const suggestedCod = String(cents(Math.max(difference, 0) + shippingDue));
  const codValue = codTouched ? codInput : suggestedCod;
  const codNumber = codValue.trim() === '' ? undefined : Number(codValue);
  const isCodValid =
    codNumber === undefined || (Number.isFinite(codNumber) && codNumber >= 0 && codNumber <= MAX_TOTAL_COST);

  const returnedDefaultContent = returnedUnits
    .map(({ item, quantity }) => `${quantity} x ${item.productName} (${item.variantLabel})`)
    .join('\n');
  const contentValue = contentTouched ? contentInput : returnedDefaultContent;
  const trimmedContent = contentValue.trim();

  const isSourceValid = source !== null && source.openExchangeCode === null;
  const isProductsValid = returnedUnits.length > 0 && lines.length > 0 && lines.every(isLineComplete);
  const isSummaryValid =
    isCodValid &&
    trimmedContent.length > 0 &&
    contentValue.length <= MAX_TEXT_LENGTH &&
    notes.length <= MAX_TEXT_LENGTH;
  const stepValid = [isSourceValid, isProductsValid, isSummaryValid];
  const canGoNext = canManage && stepValid[step] && !isPending;
  const productsHint =
    returnedUnits.length === 0
      ? t('exchange.create.step2.needReturned')
      : lines.length === 0
        ? t('exchange.create.step2.needNew')
        : lines.some((line) => !isLineComplete(line))
          ? t('exchange.create.step2.incompleteVariants')
          : null;
  const navHint = step === 1 && !isProductsValid ? productsHint : null;
  const canConfirm = canManage && stepValid.every(Boolean) && !isPending;

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const goToStep = (next: number) => {
    setSubmitError(null);
    setStep(next);
  };

  const handleSelectSource = (id: number) => {
    setSourceId(id);
    setReturnQuantities({});
    setCodTouched(false);
    setCodInput('');
    setContentTouched(false);
    setContentInput('');
  };

  const handleToggleItem = (item: FollowupExchangeCandidateItem) => {
    const key = itemKeyOf(item);
    setReturnQuantities((current) => {
      const next = { ...current };
      if (next[key] === undefined) {
        next[key] = 1;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const handleChangeItemQuantity = (item: FollowupExchangeCandidateItem, quantity: number) => {
    if (!Number.isInteger(quantity)) return;
    const clamped = Math.min(Math.max(quantity, 1), item.quantity);
    setReturnQuantities((current) => ({ ...current, [itemKeyOf(item)]: clamped }));
  };

  const handleProductsPicked = (products: SelectableProduct[]) => {
    setIsPickerOpen(false);
    if (products.length === 0) return;
    setLines(mergeLines(lines, exchangeLinesFromPicker(products)));
  };

  const handleRemoveLine = (key: string) => {
    setLines(lines.filter((line) => line.key !== key));
  };

  const updateLine = (key: string, patch: Partial<Pick<ExchangeLine, 'variants' | 'quantity'>>) => {
    const target = lines.find((line) => line.key === key);
    if (!target) return;
    const updated = { ...target, ...patch };
    const nextKey = lineKeyOf(updated.productId, updated.variants, updated.customVariants);
    const others = lines.filter((line) => line.key !== key);
    const next = { ...updated, key: nextKey };
    setLines(
      others.some((line) => line.key === nextKey)
        ? mergeLines(others, [next])
        : lines.map((line) => (line.key === key ? next : line)),
    );
  };

  const handleChangeLineQuantity = (key: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    updateLine(key, { quantity });
  };

  const handleChangeLineVariant = (key: string, attribute: string, optionName: string) => {
    const target = lines.find((line) => line.key === key);
    if (!target) return;
    const variants = orderVariants(target.variantOptions, [
      ...target.variants.filter((v) => v.name !== attribute),
      { name: attribute, optionName },
    ]);
    updateLine(key, { variants });
  };

  const handleChangeReason = (next: FollowupExchangeReason) => {
    setReason(next);
    setPayer(defaultPayerOf(next));
  };

  const handleConfirm = async () => {
    if (!canConfirm || source === null) return;
    setSubmitError(null);
    const products: FollowupChangeProductInput[] = lines.map(
      ({ productId, quantity, variants, customVariants }) => ({
        productId,
        quantity,
        variants,
        customVariants,
      }),
    );
    const body: FollowupExchangeBody = {
      sourceOrderId: source.id,
      reason,
      returnItems: returnedUnits.map(({ item, quantity }) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity,
      })),
      products,
      shippingPaidBy: payer,
      totalCost: codTouched ? codNumber : undefined,
      returnShipmentContent: trimmedContent,
      notes: notes.trim() === '' ? undefined : notes.trim(),
    };
    try {
      const response = await createMutation.mutateAsync({ orderId, ...body });
      const createdText = t('exchange.create.success', { code: response.newOrderCode });
      if (carrierSendNeedsAttention(response.carrierSend)) {
        toast.warning(carrierSendNotSentWarningAfter(createdText));
      } else {
        toast.success(createdText);
      }
      onDone?.(response);
      onClose();
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, t('exchange.create.submitError'));
      setSubmitError(message);
      toast.error(message);
    }
  };

  const footer = (
    <>
      {submitError !== null && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      {!canManage && <p className="text-sm text-muted-foreground">{t('exchange.create.noPermission')}</p>}
      {navHint !== null && <p className="text-end text-xs text-muted-foreground">{navHint}</p>}
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" onClick={() => goToStep(step - 1)} disabled={step === 0 || isPending}>
          {t('exchange.create.nav.back')}
        </Button>
        {step < 2 ? (
          <Button type="button" onClick={() => goToStep(step + 1)} disabled={!canGoNext}>
            {t('exchange.create.nav.next')}
          </Button>
        ) : (
          <Button type="button" onClick={handleConfirm} disabled={!canConfirm} loading={isPending}>
            {t('exchange.create.nav.confirm')}
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title={t('exchange.create.title')}
        showFooter={false}
        footer={footer}
        maxWidth="md:max-w-2xl"
      >
        <div className="flex flex-col gap-6" dir="rtl">
          <div className="sticky top-0 z-10 -mx-5 -mt-5 border-b border-border bg-card px-5 pt-5 pb-3 sm:-mx-6 sm:px-6">
            <ExchangeStepIndicator
              labels={[
                t('exchange.create.steps.order'),
                t('exchange.create.steps.products'),
                t('exchange.create.steps.summary'),
              ]}
              currentStep={step}
            />
          </div>
          {step === 0 && (
            <ExchangeCandidateStep
              candidates={candidates}
              isLoading={candidatesQuery.isLoading}
              isError={candidatesQuery.isError}
              selectedId={sourceId}
              disabled={isPending || !canManage}
              onSelect={handleSelectSource}
              onRetry={() => void candidatesQuery.refetch()}
            />
          )}
          {step === 1 && (
            <ExchangeProductsStep
              returnItems={source?.items ?? []}
              returnQuantities={returnQuantities}
              lines={lines}
              reason={reason}
              disabled={isPending || !canManage}
              onToggleItem={handleToggleItem}
              onChangeItemQuantity={handleChangeItemQuantity}
              onAddProducts={() => setIsPickerOpen(true)}
              onRemoveLine={handleRemoveLine}
              onChangeLineQuantity={handleChangeLineQuantity}
              onChangeLineVariant={handleChangeLineVariant}
              onChangeReason={handleChangeReason}
            />
          )}
          {step === 2 && (
            <ExchangeSummaryStep
              returnedValue={returnedValue}
              newValue={newValue}
              difference={difference}
              payer={payer}
              codInput={codValue}
              codInvalid={!isCodValid}
              content={contentValue}
              notes={notes}
              disabled={isPending || !canManage}
              onChangePayer={setPayer}
              onChangeCod={(value) => {
                setCodTouched(true);
                setCodInput(value);
              }}
              onChangeContent={(value) => {
                setContentTouched(true);
                setContentInput(value);
              }}
              onChangeNotes={setNotes}
            />
          )}
        </div>
      </BaseModal>

      <ProductSelectionModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={handleProductsPicked}
      />
    </>
  );
}
