'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/state-panels';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import { PERMISSION_CODES } from '@/lib/permissions';
import { DuplicateProductsTab } from './components/DuplicateProductsTab';
import { LinkConflictsTab } from './components/LinkConflictsTab';
import { LookAlikeVariantsTab } from './components/LookAlikeVariantsTab';
import { RetiredLinksTab } from './components/RetiredLinksTab';
import { UnlinkedStoreItemsTab } from './components/UnlinkedStoreItemsTab';
import { useLinkIssueCounts } from './hooks/useLinkIssues';

const TAB = {
  DUPLICATES: 'duplicates',
  LOOK_ALIKE: 'look-alike',
  CONFLICTS: 'conflicts',
  RETIRED: 'retired',
  UNLINKED: 'unlinked',
} as const;

export default function ProductLinkIssuesPage() {
  const { t } = useI18n();
  const canResolve = useHasPermissionStrict(PERMISSION_CODES.PRODUCTS_LINKS_RESOLVE);
  const canReadIntegrations = useHasPermissionStrict(PERMISSION_CODES.INTEGRATION_CONFIG_READ);
  const canManageIntegrations = useHasPermissionStrict(PERMISSION_CODES.INTEGRATION_CONFIG_MANAGE);
  const countsQuery = useLinkIssueCounts(canResolve);
  const canReadProducts = useHasPermissionStrict(PERMISSION_CODES.PRODUCTS_READ);
  const [activeTab, setActiveTab] = useState<string>(TAB.DUPLICATES);
  const [unlinkedTotal, setUnlinkedTotal] = useState<number | undefined>(undefined);

  if (!canResolve) {
    return <EmptyState title={t('linkIssues.page.noAccess')} />;
  }

  const counts = countsQuery.data;
  const tabs = [
    { value: TAB.DUPLICATES, label: t('linkIssues.tabs.duplicates'), count: counts?.duplicateProducts },
    { value: TAB.LOOK_ALIKE, label: t('linkIssues.tabs.lookAlike'), count: counts?.lookAlikeVariants },
    { value: TAB.CONFLICTS, label: t('linkIssues.tabs.conflicts'), count: counts?.linkConflicts },
    { value: TAB.RETIRED, label: t('linkIssues.tabs.retired'), count: counts?.retiredWithLinks },
    { value: TAB.UNLINKED, label: t('linkIssues.tabs.unlinked'), count: unlinkedTotal },
  ];

  return (
    <div className="space-y-6 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('linkIssues.page.title')}</h1>
          </div>
          <p className="text-sm text-gray-600">{t('linkIssues.page.subtitle')}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/products">{t('linkIssues.page.backToProducts')}</Link>
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <span>{tab.label}</span>
              {tab.count !== undefined && <Badge variant="secondary">{tab.count}</Badge>}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={TAB.DUPLICATES}>
          <DuplicateProductsTab />
        </TabsContent>
        <TabsContent value={TAB.LOOK_ALIKE}>
          <LookAlikeVariantsTab />
        </TabsContent>
        <TabsContent value={TAB.CONFLICTS}>
          <LinkConflictsTab />
        </TabsContent>
        <TabsContent value={TAB.RETIRED}>
          <RetiredLinksTab />
        </TabsContent>
        <TabsContent value={TAB.UNLINKED}>
          <UnlinkedStoreItemsTab
            canRead={canReadIntegrations}
            canReadProducts={canReadProducts}
            canManage={canManageIntegrations}
            onTotalChange={setUnlinkedTotal}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
