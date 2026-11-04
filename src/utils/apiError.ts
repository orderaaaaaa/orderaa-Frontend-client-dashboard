import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import {
  OUTBOUND_INSUFFICIENT_STOCK_CODE,
  AVAILABLE_WAREHOUSE_NOT_SET_CODE,
  AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE,
  type AvailableStockRefusalLine,
  type BatchShortageOrder,
  type OutboundInsufficientStockBody,
  type OutboundShortageLineApi,
  type ShortageRenderLine,
} from '@/lib/api/stockShortage';
import {
  ORDER_LINE_EDIT_CONFLICT,
  type OrderLineEditConflictBody,
} from '@/types/orderLineEdits';

/**
 * NestJS class-validator failures return `message` as a string array
 * (e.g. ["delta must not be equal to 0"]), while thrown HttpExceptions
 * return a plain string. Normalize both into something toastable.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const data = (
    err as {
      response?: { data?: { code?: string; message?: string | string[] } };
    }
  )?.response?.data;

  if (data?.code === AVAILABLE_WAREHOUSE_NOT_SET_CODE) {
    return translate(readStoredLocale(), 'orderDetails.stock.availableWarehouseNotSet');
  }

  const message = data?.message;

  if (Array.isArray(message)) {
    return message.length > 0 ? message.join('\n') : fallback;
  }

  return message || fallback;
}

export function getApiErrorStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

function shortageLineLabel(
  line: Pick<OutboundShortageLineApi, 'productName' | 'variantId' | 'variantLabel'>
): string {
  return line.variantId !== null && line.variantLabel
    ? `${line.productName} - ${line.variantLabel}`
    : line.productName;
}

export function getOutboundShortageLines(err: unknown): string[] | null {
  const data = (
    err as { response?: { data?: Partial<OutboundInsufficientStockBody> } }
  )?.response?.data;

  if (data?.code !== OUTBOUND_INSUFFICIENT_STOCK_CODE) return null;

  const locale = readStoredLocale();
  const lines = data.lines ?? [];
  if (lines.length === 0) {
    return [data.message ?? translate(locale, 'stockShortage.insufficientFallback')];
  }
  return lines.map((line) =>
    translate(locale, 'stockShortage.returnLine', {
      label: shortageLineLabel(line),
      required: line.required,
      available: Math.max(0, line.available),
      warehouse: line.warehouseName,
    })
  );
}

export function getInboundRuleMissingMessage(err: unknown): string | null {
  const data = (err as { response?: { data?: { code?: string } } })?.response?.data;
  if (data?.code !== 'INBOUND_RULE_MISSING') return null;
  return translate(readStoredLocale(), 'returnStock.uncovered');
}

export function getReturnVariantNotStockedMessage(err: unknown): string | null {
  const data = (
    err as { response?: { data?: { code?: string; message?: unknown } } }
  )?.response?.data;
  if (data?.code !== 'RETURN_VARIANT_NOT_STOCKED') return null;
  if (typeof data.message === 'string' && data.message.length > 0) return data.message;
  return translate(readStoredLocale(), 'returnStock.variantNotStocked');
}

export function getReturnWarehouseLockedMessage(err: unknown): string | null {
  const data = (
    err as {
      response?: { data?: { code?: string; message?: unknown; warehouseName?: unknown } };
    }
  )?.response?.data;
  if (data?.code !== 'RETURN_WAREHOUSE_LOCKED') return null;
  if (typeof data.message === 'string' && data.message.length > 0) return data.message;
  const locale = readStoredLocale();
  if (typeof data.warehouseName === 'string' && data.warehouseName.length > 0) {
    return translate(locale, 'returnStock.warehouseLocked', { warehouse: data.warehouseName });
  }
  return translate(locale, 'returnStock.warehouseLockedFallback');
}

/**
 * T27 — the out-of-stock confirmation refusal.
 *
 * Branch on the stable `code`, never on the message: the message is translated
 * and will change, the code is the contract. The backend returns 409 with every
 * blocked line, so the agent is told which products to swap rather than
 * discovering them one confirmation attempt at a time.
 *
 * This is a RACE BACKSTOP, not the normal path — the confirm control is already
 * disabled from the availability response. It fires when stock moved between
 * the agent seeing the number and pressing confirm.
 */
export interface StockShortageLineInput {
  variantId: number;
  productName: string;
  variantLabel: string;
  required: number;
  available: number;
}

export function formatStockShortageLines(
  lines: StockShortageLineInput[]
): string {
  const locale = readStoredLocale();
  const seen = new Set<number>();
  const rendered: string[] = [];
  for (const line of lines) {
    if (seen.has(line.variantId)) continue;
    seen.add(line.variantId);
    rendered.push(
      translate(
        locale,
        line.variantLabel ? 'stockShortage.line' : 'stockShortage.lineNoVariant',
        {
          product: line.productName,
          variant: line.variantLabel,
          required: line.required,
          available: Math.max(0, line.available),
        }
      )
    );
  }
  return rendered.join('\n');
}

function formatBatchShortageRow(order: BatchShortageOrder): string {
  const locale = readStoredLocale();
  if (order.reason === AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE) {
    return [
      order.orderCode,
      availableStockRefusalText(order.warehouseName, order.lines),
    ].join(' - ');
  }
  if (order.reason === AVAILABLE_WAREHOUSE_NOT_SET_CODE) {
    return [
      order.orderCode,
      translate(locale, 'orderDetails.stock.availableWarehouseNotSet'),
    ].join(' - ');
  }
  const reason = translate(
    locale,
    order.reason === 'CONFIRMATION_BLOCKED'
      ? 'stockShortage.reasonBlocked'
      : 'stockShortage.reasonShortage'
  );
  const head = [order.orderCode, reason, order.warehouseName]
    .filter(Boolean)
    .join(' - ');
  const lines = formatStockShortageLines(order.lines);
  return lines ? `${head}\n${lines}` : head;
}

function getBatchShortageMessage(err: unknown): string | null {
  const data = (
    err as {
      response?: {
        data?: {
          code?: string;
          message?: string;
          orders?: BatchShortageOrder[];
        };
      };
    }
  )?.response?.data;

  if (data?.code !== 'BATCH_INSUFFICIENT_STOCK') return null;

  const locale = readStoredLocale();
  const rows = (data.orders ?? []).map(formatBatchShortageRow);
  return [
    data.message ?? translate(locale, 'stockShortage.batchFallback'),
    ...rows,
  ].join('\n');
}

export function getBatchErrorMessage(err: unknown, fallback: string): string {
  return getBatchShortageMessage(err) ?? getApiErrorMessage(err, fallback);
}

interface SettleFinalAmountErrorBody {
  code?: string;
  params?: { currentAmount?: string; status?: string };
  message?: string | string[];
}

export function getSettleFinalAmountMessage(err: unknown, fallback: string): string {
  const data = (
    err as { response?: { data?: SettleFinalAmountErrorBody } }
  )?.response?.data;
  const locale = readStoredLocale();

  if (data?.code === 'SETTLEMENT_AMOUNT_STALE') {
    return translate(locale, 'settlementFinal.stale', {
      currentAmount: data.params?.currentAmount ?? '',
    });
  }

  if (data?.code === 'SETTLEMENT_AMOUNT_STATUS_NOT_ALLOWED') {
    const status = data.params?.status ?? '';
    return translate(locale, 'settlementFinal.statusNotAllowed', {
      status: ORDER_STATUS_ARABIC_LABELS[status] ?? status,
    });
  }

  if (data?.code === 'SETTLEMENT_AMOUNT_CHANGE_TOO_LARGE') {
    return translate(locale, 'settlementFinal.changeTooLarge');
  }

  const message = data?.message;
  if (Array.isArray(message) && message.includes('SETTLEMENT_AMOUNT_FORMAT_INVALID')) {
    return translate(locale, 'settlementFinal.formatInvalid');
  }

  return getApiErrorMessage(err, fallback);
}

export type OutOfStockBlock =
  | {
      code: 'OUT_OF_STOCK_CONFIRMATION_BLOCKED' | 'INSUFFICIENT_STOCK_FOR_VARIANT';
      message: string;
      lines: ShortageRenderLine[];
    }
  | {
      code: typeof AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE;
      message: string;
      lines: AvailableStockRefusalLine[];
    };

const signedChange = (change: number): string => (change > 0 ? `+${change}` : String(change));

export function availableStockLineText(line: AvailableStockRefusalLine): string {
  const locale = readStoredLocale();
  return translate(
    locale,
    line.variantLabel ? 'stockShortage.availableLine' : 'stockShortage.availableLineNoVariant',
    {
      product: line.productName,
      variant: line.variantLabel,
      available: line.available,
      change: signedChange(line.change),
      after: line.after,
    }
  );
}

export function formatAvailableStockLines(lines: AvailableStockRefusalLine[]): string {
  return lines.map(availableStockLineText).join('\n');
}

export function formatBulkStockWarnings(
  warnings: { id: number; warehouseName: string; lines: AvailableStockRefusalLine[] }[]
): string {
  if (warnings.length === 0) return '';
  const locale = readStoredLocale();
  const title = translate(locale, 'stockShortage.bulkWarningTitle', {
    warehouse: warnings[0].warehouseName,
  });
  const rows = warnings.flatMap((warning) =>
    warning.lines.map((line) =>
      translate(
        locale,
        line.variantLabel ? 'stockShortage.bulkWarningLine' : 'stockShortage.bulkWarningLineNoVariant',
        {
          order: warning.id,
          product: line.productName,
          variant: line.variantLabel,
          available: line.available,
          change: signedChange(line.change),
          after: line.after,
        }
      )
    )
  );
  return [title, ...rows].join('\n');
}

export function availableStockRefusalText(
  warehouseName: string | null | undefined,
  lines: AvailableStockRefusalLine[]
): string {
  const locale = readStoredLocale();
  const heading = warehouseName
    ? translate(locale, 'stockShortage.availableWouldGoNegative', {
        warehouse: warehouseName,
      })
    : translate(locale, 'stockShortage.availableWouldGoNegativeNoWarehouse');
  const rows = formatAvailableStockLines(lines);
  return rows ? `${heading}\n${rows}` : heading;
}

export function getOutOfStockBlock(err: unknown): OutOfStockBlock | null {
  const data = (
    err as {
      response?: {
        data?: {
          code?: string;
          message?: string;
          warehouseName?: string;
          lines?: ShortageRenderLine[] | AvailableStockRefusalLine[];
        };
      };
    }
  )?.response?.data;

  if (data?.code === AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE) {
    const lines = (data.lines ?? []) as AvailableStockRefusalLine[];
    return {
      code: AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE,
      message: availableStockRefusalText(data.warehouseName, lines),
      lines,
    };
  }

  if (
    data?.code !== 'OUT_OF_STOCK_CONFIRMATION_BLOCKED' &&
    data?.code !== 'INSUFFICIENT_STOCK_FOR_VARIANT'
  )
    return null;

  const locale = readStoredLocale();
  const lines = (data.lines ?? []) as ShortageRenderLine[];

  if (data.code === 'INSUFFICIENT_STOCK_FOR_VARIANT') {
    return {
      code: data.code,
      message: data.message ?? translate(locale, 'stockShortage.insufficientFallback'),
      lines,
    };
  }

  return {
    code: data.code,
    message: data.message ?? translate(locale, 'stockShortage.confirmBlocked'),
    lines,
  };
}

export function outOfStockBlockText(block: OutOfStockBlock): string {
  if (block.code === AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE) return block.message;
  const rows = formatStockShortageLines(block.lines);
  return rows ? `${block.message}\n${rows}` : block.message;
}

const AVAILABILITY_REFUSAL_CODES = [
  AVAILABLE_WAREHOUSE_NOT_SET_CODE,
  AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE,
  'OUT_OF_STOCK_CONFIRMATION_BLOCKED',
  'INSUFFICIENT_STOCK_FOR_VARIANT',
];

export function isAvailabilityRefusal(err: unknown): boolean {
  const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
  return code !== undefined && AVAILABILITY_REFUSAL_CODES.includes(code);
}

export function getAvailabilityRefusalMessage(err: unknown, fallback: string): string {
  const data = (
    err as {
      response?: {
        data?: {
          code?: string;
          message?: string;
          lines?: StockShortageLineInput[];
        };
      };
    }
  )?.response?.data;
  const locale = readStoredLocale();

  if (data?.code === AVAILABLE_WAREHOUSE_NOT_SET_CODE) {
    return translate(locale, 'orderDetails.stock.availableWarehouseNotSet');
  }

  if (data?.code === AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE) {
    return getOutOfStockBlock(err)?.message ?? getApiErrorMessage(err, fallback);
  }

  if (data?.code === 'OUT_OF_STOCK_CONFIRMATION_BLOCKED') {
    const heading = translate(locale, 'stockShortage.confirmBlocked');
    const lines = data.lines ?? [];
    return lines.length > 0
      ? `${heading}\n${formatStockShortageLines(lines)}`
      : heading;
  }

  if (data?.code === 'INSUFFICIENT_STOCK_FOR_VARIANT') {
    return getOutOfStockBlock(err)?.message ?? getApiErrorMessage(err, fallback);
  }

  return getApiErrorMessage(err, fallback);
}

function isOrderLineEditConflictBody(
  data: unknown
): data is OrderLineEditConflictBody {
  if (typeof data !== 'object' || data === null) return false;
  const body = data as { statusCode?: unknown; code?: unknown; message?: unknown };
  return (
    body.statusCode === 409 &&
    typeof body.message === 'string' &&
    Object.values(ORDER_LINE_EDIT_CONFLICT).some((code) => code === body.code)
  );
}

export function getOrderLineEditConflict(
  err: unknown
): OrderLineEditConflictBody | null {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  return isOrderLineEditConflictBody(data) ? data : null;
}
