import { useMerchantSettings } from '@/app/dashboard/store-settings/hooks/useStoreSettings';
import { InvoiceStoreInfo, InvoiceLanguage } from '../types/invoice';

export function useInvoiceSettings() {
  const { settings, isLoading, isError } = useMerchantSettings();

  const storeInfo: InvoiceStoreInfo = {
    logo: settings?.logo ?? undefined,
    name: 'Orderaa',
    nameEn: 'Orderaa',
    phoneNumbers: settings?.shippingPhoneNumber
      ? [settings.shippingPhoneNumber]
      : [],
    contactQRValue: settings?.url || 'https://orderaa.com',
    defaultReturnShippingCost: settings?.defaultReturnShippingCost,
    canOpenShipment: settings?.canOpenShipment,
  };

  const language: InvoiceLanguage =
    (settings?.language as InvoiceLanguage) || 'ar';

  return { storeInfo, language, isLoading, isError, settings };
}
