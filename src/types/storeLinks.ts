export const STORE_LINK_ERROR_CODE = {
  MOVE_CONFIRMATION_REQUIRED: 'STORE_LINK_MOVE_CONFIRMATION_REQUIRED',
  CHANGED_CONCURRENTLY: 'STORE_LINK_CHANGED_CONCURRENTLY',
} as const;

export const STORE_LINK_KIND = {
  VARIANT: 'VARIANT',
  PRODUCT: 'PRODUCT',
  PRODUCT_STOCK: 'PRODUCT_STOCK',
} as const;

export type StoreLinkKind = (typeof STORE_LINK_KIND)[keyof typeof STORE_LINK_KIND];

export interface StoreLinkMove {
  sourceIndex: number;
  linkKind: StoreLinkKind;
  externalVariantId: string;
  fromVariantId: number | null;
  fromVariantLabel: string | null;
  fromProductId: number;
  fromProductName: string;
  toVariantId: number | null;
  toProductId: number;
}

export interface StoreLinkMoveConfirmationBody {
  statusCode: number;
  code: typeof STORE_LINK_ERROR_CODE.MOVE_CONFIRMATION_REQUIRED;
  moves: StoreLinkMove[];
}

export interface StoreLinkChangedConcurrentlyBody {
  statusCode: number;
  code: typeof STORE_LINK_ERROR_CODE.CHANGED_CONCURRENTLY;
}

export const isStoreLinkMoveConfirmationBody = (
  value: unknown,
): value is StoreLinkMoveConfirmationBody =>
  typeof value === 'object' &&
  value !== null &&
  'code' in value &&
  value.code === STORE_LINK_ERROR_CODE.MOVE_CONFIRMATION_REQUIRED &&
  'moves' in value &&
  Array.isArray(value.moves) &&
  value.moves.length > 0;

export const isStoreLinkChangedConcurrentlyBody = (
  value: unknown,
): value is StoreLinkChangedConcurrentlyBody =>
  typeof value === 'object' &&
  value !== null &&
  'code' in value &&
  value.code === STORE_LINK_ERROR_CODE.CHANGED_CONCURRENTLY;
