import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import type {
  BatchShortageOrder,
  ShortageRenderLine,
} from '@/lib/api/stockShortage';

/**
 * NestJS class-validator failures return `message` as a string array
 * (e.g. ["delta must not be equal to 0"]), while thrown HttpExceptions
 * return a plain string. Normalize both into something toastable.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.length > 0 ? message.join('\n') : fallback;
  }

  return message || fallback;
}

export function getApiErrorStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
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

export function getBatchShortageMessage(err: unknown): string | null {
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

export function getOutOfStockBlock(
  err: unknown
): { message: string; lines: ShortageRenderLine[] } | null {
  const data = (
    err as {
      response?: {
        data?: {
          code?: string;
          message?: string;
          lines?: ShortageRenderLine[];
        };
      };
    }
  )?.response?.data;

  if (
    data?.code !== 'OUT_OF_STOCK_CONFIRMATION_BLOCKED' &&
    data?.code !== 'INSUFFICIENT_STOCK_FOR_VARIANT'
  )
    return null;

  const locale = readStoredLocale();

  if (data.code === 'INSUFFICIENT_STOCK_FOR_VARIANT') {
    return {
      message:
        data.message ?? translate(locale, 'stockShortage.insufficientFallback'),
      lines: data.lines ?? [],
    };
  }

  return {
    message: data.message ?? translate(locale, 'stockShortage.confirmBlocked'),
    lines: data.lines ?? [],
  };
}
