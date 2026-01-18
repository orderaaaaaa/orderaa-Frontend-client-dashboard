import { useMerchantSettings } from '@/app/dashboard/store-settings/hooks/useStoreSettings';
import { InvoiceStoreInfo, InvoiceLanguage } from '../types/invoice';

function formatBase64Image(base64: string): string {
  if (!base64) return '';
  if (base64.startsWith('data:image')) return base64;
  if (base64.startsWith('http://') || base64.startsWith('https://')) return base64;
  return `data:image/png;base64,${base64}`;
}

export function useInvoiceSettings() {
  const { settings, isLoading, isError } = useMerchantSettings();

  const storeInfo: InvoiceStoreInfo = {
    logo: settings?.logo ? formatBase64Image(settings.logo) : undefined,
    name: 'Orderaa',
    nameEn: 'Orderaa',
    phoneNumbers: settings?.shippingPhoneNumber
      ? [settings.shippingPhoneNumber]
      : [],
    contactQRValue: settings?.url || 'https://orderaa.com',
    defaultReturnShippingCost: settings?.defaultReturnShippingCost,
  };

  const language: InvoiceLanguage =
    (settings?.language as InvoiceLanguage) || 'ar';

  return { storeInfo, language, isLoading, isError, settings };
}
