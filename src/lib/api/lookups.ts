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
