'use client';

import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { platforms } from '@/app/dashboard/integrations/constants/platforms';
import { useI18n } from '@/i18n/I18nProvider';
import type {
  LinkIssueCountsSummary,
  LinkIssueVariantRef,
  StoreLinkSummary,
} from '../types/linkIssues';

export const providerLabel = (provider: string): string =>
  platforms.find((platform) => platform.providerKey === provider)?.name ?? provider;

interface StoreLinkBadgesProps {
  links: StoreLinkSummary[];
}

export function StoreLinkBadges({ links }: StoreLinkBadgesProps) {
  const { t } = useI18n();

  if (links.length === 0) {
    return <p className="text-xs text-gray-500">{t('linkIssues.common.noStoreLinks')}</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((link) => {
        const storeName = link.storeName;
        return (
          <li
            key={`${link.provider}-${link.storeId ?? 'none'}-${link.externalId}`}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700"
          >
            <Badge variant="outline">{providerLabel(link.provider)}</Badge>
            <span>
              {storeName ??
                (link.storeId === null
                  ? t('linkIssues.common.storeUnknown')
                  : t('linkIssues.common.storeId', { storeId: link.storeId }))}
            </span>
            <span dir="ltr" className="font-mono">
              {link.externalId}
            </span>
            <span>
              {t('linkIssues.common.storeSku')}:{' '}
              <span dir="ltr" className="font-mono">
                {link.externalSku ?? t('linkIssues.common.noSku')}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

interface VariantRefCardProps {
  heading: string;
  variant: LinkIssueVariantRef;
}

export function VariantRefCard({ heading, variant }: VariantRefCardProps) {
  const { t } = useI18n();
  return (
    <div className="flex-1 min-w-0 space-y-2 rounded-xl border border-gray-200 bg-white p-3">
      <p className="text-xs font-medium text-gray-500">{heading}</p>
      <p className="font-semibold text-gray-900 truncate">{variant.productName}</p>
      <p className="text-sm text-gray-700">{variant.label}</p>
      <p className="text-xs text-gray-500" dir="ltr">
        SKU: {variant.sku ?? t('linkIssues.common.noSku')}
      </p>
      <CountsInline
        counts={{
          stockUnits: variant.stock,
          orderLines: variant.orderLineCount,
          storeLinks: variant.storeLinks.length,
        }}
      />
      <StoreLinkBadges links={variant.storeLinks} />
    </div>
  );
}

export function CountsInline({ counts }: { counts: LinkIssueCountsSummary }) {
  const { t } = useI18n();
  return (
    <p className="text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
      <span>{t('linkIssues.common.stock', { count: counts.stockUnits })}</span>
      <span>{t('linkIssues.common.orderLines', { count: counts.orderLines })}</span>
      <span>{t('linkIssues.common.storeLinks', { count: counts.storeLinks })}</span>
    </p>
  );
}

export function IssueRowShell({ children, actions }: { children: ReactNode; actions: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1 space-y-3">{children}</div>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}
