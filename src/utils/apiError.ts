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
  productName: string;
  variantLabel: string;
  required: number;
  available: number;
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

  const lines = data.lines ?? [];
  const detail = lines
    .map(
      (line) =>
        `${line.productName} (${line.variantLabel}) — المتاح ${line.available} والمطلوب ${line.required}`
    )
    .join('\n');

  return {
    message: detail
      ? `لا يمكن تأكيد الطلب — اختر منتجًا آخر:\n${detail}`
      : (data.message ?? 'لا يمكن تأكيد الطلب — اختر منتجًا آخر'),
    lines,
  };
}
