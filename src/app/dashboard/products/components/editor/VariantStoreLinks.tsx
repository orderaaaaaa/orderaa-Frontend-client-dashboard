'use client';

import { Badge } from '@/components/ui/badge';
import { platforms } from '@/app/dashboard/integrations/constants/platforms';
import { useI18n } from '@/i18n/I18nProvider';
import type { ProductDetailVariantStoreLink } from '../../types/products';

interface VariantStoreLinksProps {
  links: ProductDetailVariantStoreLink[];
}

export function VariantStoreLinks({ links }: VariantStoreLinksProps) {
  const { t } = useI18n();

  if (links.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-600">{t('storeLinks.variant.heading')}</p>
      <ul className="space-y-1">
        {links.map((link) => (
          <li
            key={`${link.provider}-${link.storeId ?? 'none'}-${link.externalId}`}
            className="flex flex-wrap items-center gap-2 text-xs text-gray-600"
          >
            <Badge variant="outline">
              {platforms.find((platform) => platform.providerKey === link.provider)?.name ?? link.provider}
            </Badge>
            <span>
              {link.storeName ??
                (link.storeId === null
                  ? t('storeLinks.variant.storeUnknown')
                  : t('storeLinks.variant.store', { storeId: link.storeId }))}
            </span>
            {link.externalSku !== null && (
              <span>{t('storeLinks.variant.externalSku', { sku: link.externalSku })}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
