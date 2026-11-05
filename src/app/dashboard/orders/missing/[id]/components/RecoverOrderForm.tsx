'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import Order from '@/app/dashboard/upload-products/manual/Order';
import ClientInformation from '@/app/dashboard/upload-products/manual/ClientInformation';
import OrderDetails from '@/app/dashboard/upload-products/manual/OrderDetails';
import ShippingSection from '@/app/dashboard/upload-products/manual/ShippingSection';
import ConfirmationSection from '@/app/dashboard/upload-products/manual/ConfirmationSection';
import { useProductDropdownStore } from '@/store/productDropdownStore';
import { useIncompleteVariantLines } from '@/hooks/useIncompleteVariantLines';
import { incompleteLinesMessage } from '@/utils/variantSelection';
import {
  buildManualOrderPayload,
  orderlessAvailabilityTargetOf,
} from '@/utils/manualOrder/payload';
import { CARRIER_SEND_NOT_SENT_WARNING, carrierSendNeedsAttention } from '@/utils/manualOrder/carrierSend';
import { locationSaveErrorTextOf } from '@/types/locationOptions';
import { getAvailabilityRefusalMessage, isAvailabilityRefusal } from '@/utils/apiError';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useRecoverMissingOrder } from '@/services/missingOrders';
import { StoreLinkMoveConfirmModal } from '@/components/storeLinks/StoreLinkMoveConfirmModal';
import {
  isStoreLinkChangedConcurrentlyBody,
  isStoreLinkMoveConfirmationBody,
  type StoreLinkMove,
} from '@/types/storeLinks';
import { useI18n } from '@/i18n/I18nProvider';
import { useAnyBlockedLine } from '@/components/stock/blockedLinesStore';
import { StockSubmitBlockedHint } from '@/components/stock/StockSubmitBlockedHint';
import { blockedStoreLinesOf, capturedStoreLineIndexes } from '@/utils/manualOrder/storeLineLinks';
import type {
  MissingOrderDetail,
  MissingOrderErrorBody,
  OrderPaymentStatus,
  RecoverMissingOrderPayload,
} from '@/types/missing-orders';
import { recoverOrderSchema } from '../schema';
import type { RecoverOrderFormData } from '../schema';
import { buildMissingOrderPrefill } from '../utils/prefill';
import RecoverPaymentSection from './RecoverPaymentSection';
import { DismissDialog } from './DismissDialog';

interface RecoverOrderFormProps {
  id: number;
  row: MissingOrderDetail;
}

function isMissingOrderErrorBody(value: unknown): value is MissingOrderErrorBody {
  return typeof value === 'object' && value !== null;
}

interface PendingStoreLinkMoves {
  payload: RecoverMissingOrderPayload;
  moves: StoreLinkMove[];
}

export function RecoverOrderForm({ id, row }: RecoverOrderFormProps) {
  const router = useRouter();
  const [isDismissOpen, setIsDismissOpen] = useState(false);
  const [pendingStoreLinkMoves, setPendingStoreLinkMoves] = useState<PendingStoreLinkMoves | null>(null);
  const { defaultValues, initialProducts, highlightFields } = useMemo(
    () => buildMissingOrderPrefill(row),
    [row],
  );

  const {
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<RecoverOrderFormData>({
    resolver: zodResolver(recoverOrderSchema),
    defaultValues,
  });

  const selectedProducts = useProductDropdownStore((state) => state.selectedProducts);
  const { t } = useI18n();
  const storeLineIndexes = useMemo(() => capturedStoreLineIndexes(row.products), [row]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const { mutateAsync: recover, isPending: isRecovering } = useRecoverMissingOrder(id);
  const variantCheck = useIncompleteVariantLines(selectedProducts);
  const stockBlocked = useAnyBlockedLine('dropdown:');
  const variantsBlocked =
    variantCheck.isChecking || variantCheck.lines.length > 0;
  const incompleteLines = useMemo(
    () => new Map(variantCheck.lines.map((line) => [line.index, line.missing])),
    [variantCheck.lines]
  );

  useEffect(() => {
    useProductDropdownStore.getState().setSelectedProducts(initialProducts);
    return () => {
      useProductDropdownStore.getState().setSelectedProducts([]);
    };
  }, [initialProducts]);

  useEffect(() => {
    if (highlightFields.length > 0) {
      trigger(highlightFields as (keyof RecoverOrderFormData)[]);
    }
  }, [highlightFields, trigger]);

  const formValues = watch();

  const handlePaymentStatusChange = (status: OrderPaymentStatus) => {
    setValue('payment.paymentStatus', status);
    clearErrors('payment.paymentStatus');
    if (status === 'CASH_ON_DELIVERY') {
      setValue('payment.prepaidAmount', '');
      clearErrors('payment.prepaidAmount');
    }
  };

  const submitRecovery = async (payload: RecoverMissingOrderPayload) => {
    try {
      const recovered = await recover(payload);
      setPendingStoreLinkMoves(null);
      toast.success('تم إنشاء الطلب بنجاح!');
      if (carrierSendNeedsAttention(recovered.carrierSend)) {
        toast.warning(CARRIER_SEND_NOT_SENT_WARNING);
      }
      router.back();
    } catch (err: any) {
      setPendingStoreLinkMoves(null);
      const status = err?.response?.status;
      const body: unknown = err?.response?.data;
      const fallback = 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.';

      if (status === 409 && isStoreLinkMoveConfirmationBody(body)) {
        setPendingStoreLinkMoves({ payload, moves: body.moves });
        return;
      }

      if (status === 409 && isStoreLinkChangedConcurrentlyBody(body)) {
        toast.error(t('storeLinks.recover.changedConcurrently'));
        return;
      }

      if (
        status === 409 &&
        isMissingOrderErrorBody(body) &&
        body.code === 'ORDER_ALREADY_EXISTS'
      ) {
        toast.success(`تم إنشاء هذا الطلب بالفعل — ${body.orderCode ?? ''}`);
        router.back();
        return;
      }

      if (isAvailabilityRefusal(err)) {
        toast.error(getAvailabilityRefusalMessage(err, fallback));
        return;
      }

      if (
        status === 409 &&
        isMissingOrderErrorBody(body) &&
        typeof body.message === 'string'
      ) {
        toast.error(body.message);
        return;
      }

      toast.error(locationSaveErrorTextOf(err, fallback));

      if (status === 500) {
        toast.error('تواصل مع الدعم');
      }
    }
  };

  const onSubmit = async (data: RecoverOrderFormData) => {
    setProductsError(null);

    if (!selectedProducts || selectedProducts.length === 0) {
      setProductsError('يجب اختيار منتج واحد على الأقل');
      return;
    }

    if (blockedStoreLinesOf(selectedProducts, storeLineIndexes).length > 0) {
      setProductsError(t('storeLinks.recover.unlinkedBlocked'));
      return;
    }

    if (variantsBlocked) return;

    const basePayload = buildManualOrderPayload({
      utmSource: data.orderSource.utmSource,
      pageName: data.orderSource.pageName,
      customer: {
        name: data.customer.name,
        phoneNumbers: data.customer.phoneNumbers,
        address: data.customer.address,
        notes: data.customer.notes,
      },
      shipping: {
        shippingCompanyId: data.shipping.shippingCompanyId,
        governorateOption: data.shipping.governorateOption,
        cityOption: data.shipping.cityOption,
        shippingCost: data.shipping.shippingCost || '',
        returnShippingCost: data.shipping.returnShippingCost || '',
        shippingType: data.shipping.shippingType,
        returnShipmentContent: data.shipping.returnShipmentContent,
      },
      paymentMethod: data.payment.paymentMethod,
      needsConfirmation: data.needsConfirmation,
      total: data.total,
      packagingNotes: data.packagingNotes,
      selectedProducts: selectedProducts.map((p) => ({
        id: p.id,
        quantity: p.quantity || 1,
        attributeOptionIds: p.attributeOptionIds || [],
        sourceIndex: p.sourceIndex,
      })),
    });

    const payload: RecoverMissingOrderPayload = {
      ...basePayload,
      paymentStatus: data.payment.paymentStatus,
      prepaidAmount: data.payment.prepaidAmount ? Number(data.payment.prepaidAmount) : null,
    };

    await submitRecovery(payload);
  };

  const confirmStoreLinkMoves = async () => {
    if (!pendingStoreLinkMoves) return;
    await submitRecovery({
      ...pendingStoreLinkMoves.payload,
      confirmStoreLinkMoves: Array.from(
        new Set(pendingStoreLinkMoves.moves.map((move) => move.sourceIndex)),
      ),
    });
  };

  const failingProductIndex = row.failureProductIndex;

  return (
    <form onSubmit={handleFormSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-[26px]">
        <Order
          utmSource={formValues.orderSource.utmSource}
          pageName={formValues.orderSource.pageName}
          onUtmSourceChange={(v) => {
            setValue('orderSource.utmSource', v);
            clearErrors('orderSource.utmSource');
          }}
          onPageNameChange={(v) => {
            setValue('orderSource.pageName', v);
            clearErrors('orderSource.pageName');
          }}
          errors={{
            utmSource: errors.orderSource?.utmSource?.message,
            pageName: errors.orderSource?.pageName?.message,
          }}
        />

        <ClientInformation
          name={formValues.customer.name}
          phoneNumbers={formValues.customer.phoneNumbers}
          address={formValues.customer.address}
          notes={formValues.customer.notes || ''}
          onNameChange={(v) => {
            setValue('customer.name', v);
            clearErrors('customer.name');
          }}
          onPhoneNumbersChange={(v) => {
            setValue('customer.phoneNumbers', v);
            clearErrors('customer.phoneNumbers');
          }}
          onAddressChange={(v) => {
            setValue('customer.address', v);
            clearErrors('customer.address');
          }}
          onNotesChange={(v) => {
            setValue('customer.notes', v);
          }}
          errors={{
            name: errors.customer?.name?.message,
            phoneNumbers: errors.customer?.phoneNumbers?.message,
            address: errors.customer?.address?.message,
          }}
        />

        <OrderDetails
          availabilityTarget={orderlessAvailabilityTargetOf(formValues.needsConfirmation)}
          total={formValues.total || ''}
          packagingNotes={formValues.packagingNotes || ''}
          onTotalChange={(v) => {
            setValue('total', v);
            clearErrors('total');
          }}
          onPackagingNotesChange={(v) => {
            setValue('packagingNotes', v);
          }}
          errors={{ products: productsError || undefined, total: errors.total?.message }}
          failingProductIndex={failingProductIndex}
          incompleteLines={incompleteLines}
        />

        <ShippingSection
          shippingCompanyId={formValues.shipping.shippingCompanyId}
          governorateOption={formValues.shipping.governorateOption}
          cityOption={formValues.shipping.cityOption}
          shippingCost={formValues.shipping.shippingCost || ''}
          returnShippingCost={formValues.shipping.returnShippingCost || ''}
          shippingType={formValues.shipping.shippingType}
          returnShipmentContent={formValues.shipping.returnShipmentContent || ''}
          onShippingCompanyChange={(v) => {
            setValue('shipping.shippingCompanyId', v);
            clearErrors('shipping.shippingCompanyId');
          }}
          onGovernorateOptionChange={(v) => {
            setValue('shipping.governorateOption', v);
            clearErrors('shipping.governorateOption');
          }}
          onCityOptionChange={(v) => {
            setValue('shipping.cityOption', v);
            clearErrors('shipping.cityOption');
          }}
          onShippingCostChange={(v) => {
            setValue('shipping.shippingCost', v);
            clearErrors('shipping.shippingCost');
          }}
          onReturnShippingCostChange={(v) => {
            setValue('shipping.returnShippingCost', v);
            clearErrors('shipping.returnShippingCost');
          }}
          onShippingTypeChange={(v) => {
            setValue('shipping.shippingType', v);
            clearErrors('shipping.shippingType');
          }}
          onReturnShipmentContentChange={(v) => {
            setValue('shipping.returnShipmentContent', v);
            clearErrors('shipping.returnShipmentContent');
          }}
          errors={{
            shippingCompanyId: errors.shipping?.shippingCompanyId?.message,
            governorateOption: errors.shipping?.governorateOption?.message,
            cityOption: errors.shipping?.cityOption?.message,
            shippingCost: errors.shipping?.shippingCost?.message,
            returnShippingCost: errors.shipping?.returnShippingCost?.message,
            shippingType: errors.shipping?.shippingType?.message,
            returnShipmentContent: errors.shipping?.returnShipmentContent?.message,
          }}
        />

        <RecoverPaymentSection
          paymentMethod={formValues.payment.paymentMethod}
          onPaymentMethodChange={(v) => {
            setValue('payment.paymentMethod', v);
            clearErrors('payment.paymentMethod');
          }}
          paymentStatus={formValues.payment.paymentStatus}
          onPaymentStatusChange={handlePaymentStatusChange}
          prepaidAmount={formValues.payment.prepaidAmount}
          onPrepaidAmountChange={(v) => {
            setValue('payment.prepaidAmount', v);
            clearErrors('payment.prepaidAmount');
          }}
          errors={{
            paymentMethod: errors.payment?.paymentMethod?.message,
            paymentStatus: errors.payment?.paymentStatus?.message,
            prepaidAmount: errors.payment?.prepaidAmount?.message,
          }}
        />

        <ConfirmationSection
          needsConfirmation={formValues.needsConfirmation}
          onNeedsConfirmationChange={(v) => {
            setValue('needsConfirmation', v);
          }}
        />

        {variantCheck.lines.length > 0 && (
          <p
            role="alert"
            data-testid="incomplete-variants-message"
            className="text-red-600 text-sm font-semibold"
          >
            {incompleteLinesMessage(variantCheck.lines)}
          </p>
        )}

        <StockSubmitBlockedHint visible={stockBlocked} />

        <div className="flex justify-end gap-3 ml-6">
          <Can code={PERMISSION_CODES.ORDERS_MISSING_MANAGE}>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-full font-bold"
              onClick={() => setIsDismissOpen(true)}
            >
              استبعاد
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || variantsBlocked || stockBlocked}
              title={stockBlocked ? t('stockShortage.submitBlocked') : undefined}
              size="lg"
              className="w-40 rounded-full font-bold"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⟳</span>
                  جاري الإرسال...
                </>
              ) : (
                'قبول'
              )}
            </Button>
          </Can>
        </div>
      </div>

      <StoreLinkMoveConfirmModal
        moves={pendingStoreLinkMoves?.moves ?? []}
        onConfirm={confirmStoreLinkMoves}
        onClose={() => setPendingStoreLinkMoves(null)}
        isLoading={isRecovering}
      />

      <DismissDialog
        id={id}
        isOpen={isDismissOpen}
        onOpenChange={setIsDismissOpen}
        onDismissed={() => router.back()}
      />
    </form>
  );
}
