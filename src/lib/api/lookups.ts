import http from './http';

export async function getCategories() {
  const { data } = await http.get('/categories?lang=ar');

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
