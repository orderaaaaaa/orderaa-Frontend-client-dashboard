import api from './index';

export interface AttributeOption {
  id: number;
  name: string;
}

export interface AttributeOptionGroup {
  id: number;
  name: string;
  options: AttributeOption[];
}

export interface GetProductAttributeOptionsResponse {
  attributeOptions: AttributeOptionGroup[];
}

export async function getProductAttributeOptions(
  productId: number,
): Promise<GetProductAttributeOptionsResponse> {
  const response = await api.get(`/products/${productId}/attribute-options`);
  return response.data as GetProductAttributeOptionsResponse;
}
