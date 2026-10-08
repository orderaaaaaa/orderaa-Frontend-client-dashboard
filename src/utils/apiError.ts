import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';

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
export interface OutOfStockBlockedLine {
  orderProductId: number;
  variantId: number;
  productName: string;
  variantLabel: string;
  required: number;
  available: number;
}

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

export function getOutOfStockBlock(
  err: unknown
): { message: string; lines: OutOfStockBlockedLine[] } | null {
  const data = (
    err as {
      response?: {
        data?: {
          code?: string;
          message?: string;
          lines?: OutOfStockBlockedLine[];
        };
      };
    }
  )?.response?.data;

  if (data?.code !== 'OUT_OF_STOCK_CONFIRMATION_BLOCKED') return null;

  return {
    message:
      data.message ??
      translate(readStoredLocale(), 'stockShortage.confirmBlocked'),
    lines: data.lines ?? [],
  };
}
