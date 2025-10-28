export type ExcelFormat = 'app' | 'easyorder';

export interface AppFormatRow {
  FullName: string;
  Phone: string;
  'Phone 2'?: string;
  City: string;
  Address: string;
  'Shipping Cost': string | number;
  Note?: string;
  'Utm Source'?: string;
  'Utm Campaign'?: string;
  'Payment Status'?: string;
  'Product Name 1': string;
  'Variant 1'?: string;
  'Product Name 2'?: string;
  'Variant 2'?: string;
  [key: string]: any;
}

export interface EasyOrderFormatRow {
  ID?: string;
  Status?: string;
  FullName: string;
  Phone: string;
  City?: string;
  Address: string;
  'Total Cost'?: string | number;
  'Product Cost'?: string | number;
  'Shipping Cost': string | number;
  Coupon?: string;
  'Coupon Discount'?: string | number;
  'Product Name': string;
  Variant?: string;
  Quantity?: string | number;
  SKU?: string;
  'Item Price'?: string | number;
  CreatedAt?: string;
  'Extra Data'?: string;
  'Extra Data2'?: string;
  'Alt Phone'?: string;
  Note?: string;
  Ref?: string;
  'Utm Source'?: string;
  'Utm Campaign'?: string;
  'Payment Method'?: string;
  'Payment Status'?: string;
  'Funnel ID'?: string;
  'Order ID'?: string;
  'Referral Code'?: string;
  'External Order ID'?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface OrderValidationResult {
  rowIndex: number;
  isValid: boolean;
  errors: ValidationError[];
  data?: AppFormatRow | EasyOrderFormatRow;
}

export interface UploadResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  validOrders: OrderValidationResult[];
  invalidOrders: OrderValidationResult[];
  detectedFormat: ExcelFormat;
}

export interface ParsedExcelData {
  format: ExcelFormat;
  data: (AppFormatRow | EasyOrderFormatRow)[];
}
