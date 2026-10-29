export const STORE_LINK_ERROR_CODE = {
  MOVE_CONFIRMATION_REQUIRED: 'STORE_LINK_MOVE_CONFIRMATION_REQUIRED',
} as const;

export interface StoreLinkMove {
  sourceIndex: number;
  externalVariantId: string;
  fromVariantId: number;
  fromVariantLabel: string;
  fromProductId: number;
  fromProductName: string;
  toVariantId: number;
}

export interface StoreLinkMoveConfirmationBody {
  statusCode: number;
  code: typeof STORE_LINK_ERROR_CODE.MOVE_CONFIRMATION_REQUIRED;
  moves: StoreLinkMove[];
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
