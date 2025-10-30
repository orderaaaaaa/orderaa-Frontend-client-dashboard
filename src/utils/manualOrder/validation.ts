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
};

export function validateManualOrder(
  form: ManualOrderForm,
  products: ManualOrderPayload['products']
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
  return next;
}


