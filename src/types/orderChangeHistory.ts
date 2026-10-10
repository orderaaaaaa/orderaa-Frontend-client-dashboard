export type OrderChangeKind = 'FIELD' | 'LINE_ADDED' | 'LINE_REMOVED' | 'LINE_CHANGED';

export type OrderChangeValueType =
  | 'STRING'
  | 'NUMBER'
  | 'DECIMAL'
  | 'BOOLEAN'
  | 'DATETIME'
  | 'DATE'
  | 'JSON'
  | 'REF'
  | 'STRING_LIST'
  | 'LINE'
  | 'ENUM_ORDER_STATUS'
  | 'ENUM_PAYMENT_METHOD'
  | 'ENUM_PAYMENT_STATUS'
  | 'ENUM_SHIPPING_TYPE'
  | 'ENUM_SETTLEMENT_RECORD_TYPE';

export type OrderChangeOrigin =
  | 'ORDER_EDIT'
  | 'LINE_EDIT'
  | 'BULK_UPDATE'
  | 'CANCEL'
  | 'PRINT'
  | 'PREPARE'
  | 'CALL_AGAIN'
  | 'WAITING_FOR_PACKAGING'
  | 'SUBMIT_FOR_APPROVAL'
  | 'RETURN_RECEIPT'
  | 'SETTLEMENT_UPLOAD'
  | 'SETTLEMENT_REMOVE'
  | 'SETTLEMENT_AMOUNT_EDIT'
  | 'SETTLEMENT_ADJUST'
  | 'PARTIAL_DELIVERY'
  | 'FOLLOWUP_CHANGE_PRODUCTS'
  | 'FOLLOWUP_CANCEL'
  | 'PARKED_RELEASE'
  | 'BILLING_ACTIVATION'
  | 'CUSTOMER_EDIT'
  | 'CUSTOMER_MERGE'
  | 'CARRIER_WEBHOOK'
  | 'AUTOMATION_CALLBACK'
  | 'SCHEDULED_POSTPONED_DUE'
  | 'SCHEDULED_RESET_ATTEMPTED'
  | 'STORE_UPDATE'
  | 'UNSPECIFIED';

export type OrderChangeJsonValue =
  | string
  | number
  | boolean
  | null
  | OrderChangeJsonValue[]
  | { [key: string]: OrderChangeJsonValue };

export interface OrderChangeRefValue {
  id: number;
  label: string | null;
}

export interface OrderChangeLineValue {
  productId: number;
  productName: string | null;
  variant: OrderChangeRefValue;
  price: number;
  sku: string | null;
  customVariants: OrderChangeJsonValue;
  quantity: number;
  lineIds: number[];
}

export interface OrderChangeEntry {
  id: number;
  kind: OrderChangeKind;
  field: string;
  valueType: OrderChangeValueType;
  lineId: number | null;
  oldValue: OrderChangeJsonValue;
  newValue: OrderChangeJsonValue;
}

export interface OrderChangeBatch {
  id: number;
  createdAt: string;
  origin: string;
  actorType: string;
  actorEmployeeId: number | null;
  actorPlatformAdminId: number | null;
  actorName: string | null;
  operationId: string;
  entries: OrderChangeEntry[];
}

export interface OrderChangeHistoryPage {
  data: OrderChangeBatch[];
  page: number;
  limit: number;
  total: number;
}
