import api from '.';

export async function getCategories() {
  const { data } = await api.get('/categories?lang=ar');

  return data;
}

export async function getGovernorates() {
  const { data } = await api.get('/lookups/governorates');
  return data;
}

export async function getCities(governorateId: string) {
  const { data } = await api.get(
    `/lookups/governorates/${governorateId}/cities`
  );
  return data;
}
