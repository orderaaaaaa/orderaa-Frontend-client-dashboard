export interface IStoreTableHeader {
  id: number;
  key: string;
  label: string;
}

export interface IStoreTableRow {
  id: number;
  storeName: string;
  requestsCount: number;
  department: string;
  sales: string;
  revenue: string;
  deliveryRate: string;
  dateAdded: string;
  profitDate: string;
  actions: string;
  status?: 'active' | 'inactive';
  [key: string]: any;
}
