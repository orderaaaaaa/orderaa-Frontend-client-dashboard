import { ManualOrderPayload } from '@/types/manual-order';

export type ManualOrderForm = {
  platform: string;
  pageName: string;
  customerName: string;
  phoneNumber: string;
  governorate: string;
  area: string;
  address: string;
  notes: string;
};

export type ManualFormErrors = {
  platform?: string;
  pageName?: string;
  customerName?: string;
  phoneNumber?: string;
  governorate?: string;
  area?: string;
  address?: string;
  notes?: string;
  products?: string;
  shippingCost?: string;
  paymentMethod?: string;
};

type ShippingPayment = {
  shipping: boolean;
  shippingCost: string;
  includeShipping: boolean;
  paymentMethod: string;
  needsConfirmation: boolean;
};

export function validateManualOrder(
  form: ManualOrderForm,
  products: ManualOrderPayload['products'],
  shippingPayment?: ShippingPayment
): ManualFormErrors {
  const next: ManualFormErrors = {};
  if (!form.platform) next.platform = 'هذا الحقل مطلوب';
  if (!form.pageName) next.pageName = 'هذا الحقل مطلوب';
  if (!form.customerName) next.customerName = 'هذا الحقل مطلوب';
  if (!form.phoneNumber) next.phoneNumber = 'هذا الحقل مطلوب';
  if (!form.governorate) next.governorate = 'هذا الحقل مطلوب';
  if (!form.area) next.area = 'هذا الحقل مطلوب';
  if (!form.address) next.address = 'هذا الحقل مطلوب';
  if (!form.notes) next.notes = 'هذا الحقل مطلوب';
  if (!products || products.length === 0)
    next.products = 'يجب اختيار منتج واحد على الأقل';

  if (shippingPayment) {
    if (shippingPayment.shipping && !shippingPayment.shippingCost) {
      next.shippingCost = 'يرجى إدخال تكلفة الشحن';
    }

    if (
      shippingPayment.shipping &&
      shippingPayment.shippingCost &&
      isNaN(Number(shippingPayment.shippingCost))
    ) {
      next.shippingCost = 'يرجى إدخال رقم صحيح';
    }

    if (shippingPayment.includeShipping && !shippingPayment.paymentMethod) {
      next.paymentMethod = 'يرجى اختيار طريقة الدفع';
    }
  }

  return next;
}


