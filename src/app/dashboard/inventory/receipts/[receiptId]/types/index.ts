export interface AttributeOption {
  id: number;
  name: string;
}

export interface AttributeOptionGroup {
  id: number;
  name: string;
  options: AttributeOption[];
}

export interface SelectedVariant {
  attributeOptionIds: number[];
  attributeLabels: string[];
  quantity: number | '';
  variantId?: number;
  variantName?: string;
  color?: string;
  size?: string;
}

