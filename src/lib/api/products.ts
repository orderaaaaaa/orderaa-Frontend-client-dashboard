import api from './index';

export interface AttributeOption {
  id: number;
  name: string;
  displayName: string;
}

export interface AttributeOptionGroup {
  id: number;
  name: string;
  displayName: string;
  options: AttributeOption[];
}

export interface VariantCardOption {
  attributeId: number;
  optionId: number;
  name: string;
  displayName: string;
}

export interface VariantCard {
  id: number;
  label: string;
  options: VariantCardOption[];
}

export interface GetProductAttributeOptionsResponse {
  options: AttributeOptionGroup[];
  variants: VariantCard[];
}

export async function getProductAttributeOptions(
  productId: number,
): Promise<GetProductAttributeOptionsResponse> {
  const response = await api.get(`/products/${productId}/attribute-options`);
  return response.data as GetProductAttributeOptionsResponse;
}
