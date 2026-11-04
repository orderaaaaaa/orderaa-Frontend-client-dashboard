export interface ClosedPayload {
  auto: boolean;
}

export interface ReversedPayload {
  reversalInvoiceId: number | null;
  reversesInvoiceId: number | null;
}

function numberField(changes: unknown, key: string): number | null {
  if (typeof changes !== 'object' || changes === null) return null;
  const value: unknown = Reflect.get(changes, key);
  return typeof value === 'number' ? value : null;
}

export function closedPayloadOf(changes: unknown): ClosedPayload {
  if (typeof changes !== 'object' || changes === null) return { auto: false };
  const closed: unknown = Reflect.get(changes, 'closed');
  if (typeof closed !== 'object' || closed === null) return { auto: false };
  return { auto: Reflect.get(closed, 'auto') === true };
}

export function reversedPayloadOf(changes: unknown): ReversedPayload {
  return {
    reversalInvoiceId: numberField(changes, 'reversalInvoiceId'),
    reversesInvoiceId: numberField(changes, 'reversesInvoiceId'),
  };
}
