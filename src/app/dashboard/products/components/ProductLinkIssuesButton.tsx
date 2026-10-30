'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useLinkIssueCounts } from '../link-issues/hooks/useLinkIssues';

export function ProductLinkIssuesButton() {
  const { t } = useI18n();
  const canResolve = useHasPermissionStrict(PERMISSION_CODES.PRODUCTS_LINKS_RESOLVE);
  const countsQuery = useLinkIssueCounts(canResolve);

  if (!canResolve) return null;

  const total = countsQuery.data?.total ?? 0;

  return (
    <Button variant="outline" className="min-h-10" asChild>
      <Link href="/dashboard/products/link-issues">
        {t('linkIssues.entryButton')}
        {total > 0 && <Badge variant="destructive">{total}</Badge>}
      </Link>
    </Button>
  );
}
