export interface OrderFilters {
  productName: string;
  sizeColor: string;
  governorate: string;
  area: string;
  shipmentCode: string;
  customerName: string;
  phone: string;
  address: string;
  executionDate?: string;
}

export interface FilterOptions {
  productOptions: string[];
  sizeColorOptions: string[];
  governorateOptions: string[];
  areaOptions: string[];
}
export interface OrderCardProps {
  id: number;
  name: string;
  phone: string;
  government: string;
  items: string[];
  price: number;
  trys: number;
  status: string;
  city: string;
  alert: number;
  select: boolean;
}
