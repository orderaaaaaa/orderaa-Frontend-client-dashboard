import { toast } from 'react-toastify';
import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import {
  getInboundRuleMissingMessage,
  getOutboundShortageLines,
  getReturnVariantNotStockedMessage,
  getReturnWarehouseLockedMessage,
} from '@/utils/apiError';

function ShortageToastBody({ lines }: { lines: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, index) => (
        <span key={index} className="block">
          {line}
        </span>
      ))}
    </div>
  );
}

export function reportReturnSubmitError(err: unknown): boolean {
  const shortageLines = getOutboundShortageLines(err);
  if (shortageLines !== null) {
    toast.error(<ShortageToastBody lines={shortageLines} />);
    return true;
  }

  const uncovered = getInboundRuleMissingMessage(err);
  if (uncovered !== null) {
    toast.error(uncovered);
    return true;
  }

  const locked = getReturnWarehouseLockedMessage(err);
  if (locked !== null) {
    toast.error(locked);
    return true;
  }

  const notStocked = getReturnVariantNotStockedMessage(err);
  if (notStocked !== null) {
    toast.error(notStocked);
    return true;
  }

  return false;
}

export function warnReturnBlocked(): void {
  toast.warning(translate(readStoredLocale(), 'returnStock.blocked'));
}
