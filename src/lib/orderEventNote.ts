import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';

function parseEventParams(note: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(note);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

const LINE_EDIT_SENT_BACK_EVENT = 'ORDER_SENT_BACK_FOR_LINE_EDIT';

const RETURN_REFUND_RECORDED_EVENT = 'RETURN_REFUND_RECORDED';

const LINE_EDIT_ACTION_LABEL_KEYS = {
  ADD: 'lineEdit.event.action.add',
  UPDATE: 'lineEdit.event.action.update',
  DELETE: 'lineEdit.event.action.delete',
} as const;

function isLineEditAction(
  value: string
): value is keyof typeof LINE_EDIT_ACTION_LABEL_KEYS {
  return Object.prototype.hasOwnProperty.call(LINE_EDIT_ACTION_LABEL_KEYS, value);
}

function lineEditSentBackNote(note: string | null | undefined): string | null {
  const params = note ? parseEventParams(note) : null;
  if (!params) return null;
  const locale = readStoredLocale();
  const parts: string[] = [];
  const action = params.lineAction;
  if (typeof action === 'string' && isLineEditAction(action)) {
    parts.push(translate(locale, LINE_EDIT_ACTION_LABEL_KEYS[action]));
  }
  const bypassed = params.bypassedVariantIds;
  if (Array.isArray(bypassed) && bypassed.length > 0) {
    parts.push(translate(locale, 'lineEdit.event.bypassed', { count: bypassed.length }));
  }
  return parts.length > 0 ? parts.join('، ') : null;
}

export function orderEventTitle(
  name: string,
  statusLabelOf: (statusKey: string) => string
): string {
  if (name === LINE_EDIT_SENT_BACK_EVENT) {
    return translate(readStoredLocale(), 'lineEdit.event.title');
  }
  if (name === RETURN_REFUND_RECORDED_EVENT) {
    return translate(readStoredLocale(), 'orderEvent.returnRefundRecorded');
  }
  return statusLabelOf(name);
}

export function renderOrderEventNote(
  name: string | null | undefined,
  note: string | null | undefined
): string | null {
  if (name === LINE_EDIT_SENT_BACK_EVENT) return lineEditSentBackNote(note);
  return note || null;
}
