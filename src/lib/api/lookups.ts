import http from './http';

export async function getCategories() {
  const { data } = await http.get('/lookups/categories');

  return data;
}

export async function getGovernorates() {
  const { data } = await http.get('/lookups/governorates');
  return data;
}

export async function getCities(governorateId: string) {
  const { data } = await http.get(
    `/lookups/governorates/${governorateId}/cities`
  );
  return data;
}

export async function getPaymentStatuses() {
  const { data } = await http.get('/lookups/payment-statuses');
  return data;
}

export async function getPaymentMethods() {
  const { data } = await http.get('/lookups/payment-methods');
  return data;
}

export async function getShippingCompanies() {
  const { data } = await http.get('/lookups/shipping-companies');
  return data;
}

export async function getShippingGovernorates(shippingCompanyKey: string) {
  const { data } = await http.get(
    `/shipping-locations/${shippingCompanyKey}/governorates`
  );
  return data;
}

export async function getShippingCities(
  shippingCompanyKey: string,
  governorateKey: string
) {
  const { data } = await http.get(
    `/shipping-locations/${shippingCompanyKey}/governorates/${governorateKey}/cities`
  );
  return data;
}

export async function getShippingTypes(): Promise<{ key: string; label: string }[]> {
  const { data } = await http.get<{ key: string; label: string }[]>('/lookups/shipping-types');
  return data;
}

export async function getUtmSources(): Promise<string[]> {
  const { data } = await http.get<string[]>('/lookups/utm-sources');
  return data;
}

export async function getShippingEvents(): Promise<string[]> {
  const { data } = await http.get<string[]>('/lookups/shipping-events');
  return Array.isArray(data) ? data : [];
}

export async function getDepartments(): Promise<{ value: string; label: string }[]> {
  const { data } = await http.get<{ value: string; label: string }[]>('/lookups/departments');
  return Array.isArray(data) ? data : [];
}

export async function getPageNames(): Promise<string[]> {
  const { data } = await http.get<string[] | { pageNames?: string[] }>(
    '/lookups/page-names'
  );
  if (Array.isArray(data)) return data;
  return data?.pageNames ?? [];
}
