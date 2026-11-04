import { useI18n } from '@/i18n/I18nProvider';

export function StockSubmitBlockedHint({ visible }: { visible: boolean }) {
  const { t } = useI18n();
  if (!visible) return null;
  return (
    <p role="alert" className="text-sm font-semibold text-destructive">
      {t('stockShortage.submitBlocked')}
    </p>
  );
}
