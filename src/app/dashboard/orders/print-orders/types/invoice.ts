import { ShippingType } from '@/types/orders';

export type InvoiceLanguage = 'ar' | 'en';

export interface InvoiceStoreInfo {
  logo?: string;
  name: string;
  nameEn: string;
  phoneNumbers: string[];
  contactQRValue: string;
  defaultReturnShippingCost?: number;
  canOpenShipment?: boolean;
}

export interface InvoiceCustomer {
  name: string;
  governorate: string;
  city: string;
  phoneNumbers: string[];
  address: string;
}

export interface InvoiceProduct {
  name: string;
  quantity: number;
  attributes?: { id: number; name: string; value: string }[];
  customVariants?: { label: string; value: string }[];
  sku?: string | null;
}

export interface InvoiceShipping {
  allowOpenShipment: boolean;
  paymentMethod: string;
  paymentStatus: string;
  shipmentStatus: string;
}

export interface InvoiceSchedule {
  timeFrom?: string;
  timeTo?: string;
}

export interface InvoiceData {
  orderCode: string;
  shippingId?: string;
  customer: InvoiceCustomer;
  products: InvoiceProduct[];
  shipping: InvoiceShipping;
  schedule: InvoiceSchedule;
  totalPrice: number;
  nonReceiptPenalty?: number;
  packagingNotes?: string | null;
  shippingNotes?: string | null;
  shippingCompany?: string;
  merchantName?: string;
  merchantGovernorate?: string;
  merchantCity?: string;
  area?: string;
  shipmentContent?: string | null;
  canOpenShipment?: boolean;
  returnShippingCost?: number;
  createdAt?: string;
  shippingType?: ShippingType;
  isResend?: boolean;
}

export interface InvoiceLabels {
  recipientDetails: string;
  phoneNumber: string;
  number1: string;
  number2: string;
  address: string;
  packagingNotes: string;
  packagingWarning: string;
  shipmentContents: string;
  shippingNotes: string;
  shippingInfo: string;
  allowOpenShipment: string;
  paymentMethod: string;
  paymentStatus: string;
  shipmentStatus: string;
  customerSchedule: string;
  totalPrice: string;
  nonReceiptMessage: string;
  nonReceiptSuffix?: string;
  productCount: string;
  shippingBarcode: string;
  contactMessage: string;
  senderName: string;
  workNumbers: string;
  scanToContact: string;
  yes: string;
  no: string;
  paid: string;
  unpaid: string;
  cashOnDelivery: string;
  cod: string;
  delivery: string;
  codAmount: string;
  nonReceiptCost: string;
  merchant: string;
  deliverTo: string;
  area: string;
  landmark: string;
  openShipment: string;
  pieces: string;
  shipmentDescription: string;
  notes: string;
  trackingNumber: string;
  orderReference: string;
  returnAddress: string;
  created: string;
  exchange: string;
  return: string;
  partialReturn: string;
  resend: string;
}

export interface InvoiceProps {
  data: InvoiceData;
  storeInfo: InvoiceStoreInfo;
  language: InvoiceLanguage;
}
