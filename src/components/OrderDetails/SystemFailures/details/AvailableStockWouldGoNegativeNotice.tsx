import { useI18n } from '@/i18n/I18nProvider';

export function AvailableStockWouldGoNegativeNotice({ warehouseName }: { warehouseName: string }) {
  const { t } = useI18n();
  return (
    <p className="text-sm text-red-700 font-medium">
      {t('stockShortage.availableWouldGoNegative', { warehouse: warehouseName })}
    </p>
  );
}
