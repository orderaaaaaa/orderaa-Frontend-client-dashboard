import { providers } from '@/app/dashboard/link-shipping-company/constants/providers';
import {
  NO_SHIPPING_COMPANY_FILTER,
  NO_SHIPPING_COMPANY_LABEL,
  type ShippingCompanyRef,
} from '@/types/shippingCompanies';

export const INTEGRATION_LABELS: Record<string, string> = {
  TURBO: 'تربو',
  BOSTA: 'بوسطة',
  HASHTAG: 'هاشتاج اكسبريس',
  QUICK_CONNECT: 'كويك كونكت',
  RED: 'ريد اكسبريس',
  RM_EXPRESS: 'RM اكسبريس',
  JT_EXPRESS: 'J&T اكسبريس',
  TOROD: 'تورد',
};

export const integrationLogoOf = (code: string | null | undefined) =>
  code ? providers.find((provider) => provider.id.toUpperCase() === code)?.logo : undefined;

export const integrationLabelOf = (code: string | null | undefined) =>
  code ? INTEGRATION_LABELS[code] : undefined;

export const shippingCompanyNameOf = (
  ref: Pick<ShippingCompanyRef, 'name'> | null | undefined
) => ref?.name ?? '';

export const shippingCompanySelectOptionsOf = (
  companies: Pick<ShippingCompanyRef, 'id' | 'name'>[]
) => companies.map((company) => ({ key: String(company.id), label: company.name }));

export const shippingCompanyFilterOptionsOf = (
  companies: Pick<ShippingCompanyRef, 'id' | 'name'>[]
) => [
  { key: NO_SHIPPING_COMPANY_FILTER, label: NO_SHIPPING_COMPANY_LABEL },
  ...shippingCompanySelectOptionsOf(companies),
];

export const shippingCompanyIdOf = (key: string | null | undefined) => {
  if (!key) return null;
  const id = Number(key);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const shippingIdCompanyNameOf = (
  entry: { shippingCompanyId?: number | null; shippingCompany?: string | null },
  orderCompany: ShippingCompanyRef | null | undefined,
  companies: Pick<ShippingCompanyRef, 'id' | 'name'>[]
) => {
  const id = entry.shippingCompanyId ?? null;
  if (id !== null && orderCompany?.id === id) return orderCompany.name;
  const listed = id !== null ? companies.find((company) => company.id === id) : undefined;
  return listed?.name ?? integrationLabelOf(entry.shippingCompany) ?? '';
};
