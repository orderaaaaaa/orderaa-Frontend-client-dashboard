'use client';

import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import { CANONICAL_DOMAIN_CONFIGS } from '@/app/dashboard/canonical-names/config/domainConfigs';
import { CANONICAL_NAME_DOMAINS, type CanonicalNameDomain, type SourceGroup } from '@/types/canonicalNames';

export interface AttributeRowContentProps {
  domain: CanonicalNameDomain;
  group: SourceGroup;
}

export function AttributeRowContent({ domain, group }: AttributeRowContentProps) {
  const { t } = useI18n();
  const nouns = CANONICAL_DOMAIN_CONFIGS[domain].labels.countNouns;
  const showContexts = domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION && group.attributeContexts.length > 0;
  const contextCount = group.attributeContexts.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {t('canonical.queue.row.attrCounts', {
          rows: group.rowCount,
          rowsNoun: pluralAr(t, nouns.rows, group.rowCount),
          products: group.productCount,
          productsNoun: pluralAr(t, nouns.products, group.productCount),
        })}
      </span>
      {showContexts && (
        <Badge variant={contextCount > 1 ? 'destructive' : 'outline'}>
          {t('canonical.queue.row.contexts', {
            names: group.attributeContexts.map((context) => context.name).join('، '),
          })}
        </Badge>
      )}
    </div>
  );
}
