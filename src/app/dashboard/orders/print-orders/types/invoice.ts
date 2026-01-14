export type InvoiceLanguage = 'ar' | 'en';

export interface InvoiceStoreInfo {
  logo?: string;
  name: string;
  nameEn: string;
  phoneNumbers: string[];
  contactQRValue: string;
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
  variant?: string;
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
  packagingNotes?: string;
  shippingNotes?: string;
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
}
