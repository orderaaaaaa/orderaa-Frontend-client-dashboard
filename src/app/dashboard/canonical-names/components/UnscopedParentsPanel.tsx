'use client';

import { useState } from 'react';
import { LinkCombobox } from '@/components/entity-manager/LinkCombobox';
import type { ComboGroup, ComboOption, LinkTarget } from '@/components/entity-manager/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import PaginationFooter from '@/components/ui/pagination-footer';
import { VisualizedSpelling } from '@/components/entity-manager/VisualizedSpelling';
import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import { useCanonicalNamesQuery, useSourceGroupsQuery } from '@/services/canonicalNames';
import {
  CANONICAL_NAME_DOMAINS,
  type LinkItem,
  type UnscopedParent,
} from '@/types/canonicalNames';
import { locationSourceLabel } from '../utils/locationSourceLabel';

const GOVERNORATE_SCOPE_ID = 0;

interface UnscopedParentCitiesProps {
  scopeId: number;
  parentRowId: number;
}

function UnscopedParentCities({ scopeId, parentRowId }: UnscopedParentCitiesProps) {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const { data, isLoading, isError, refetch } = useSourceGroupsQuery(
    CANONICAL_NAME_DOMAINS.CITY,
    { scopeId, parentRowId, page, limit },
  );

  if (isLoading) return <PageLoading size="sm" />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-start gap-2 py-2">
        <p className="text-sm text-muted-foreground">{t('canonical.queue.error')}</p>
        <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  if (data.data.length === 0) {
    return <p className="py-2 text-sm text-muted-foreground">{t('canonical.queue.empty.none')}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul role="list" className="flex flex-col gap-1">
        {data.data.map((group) => (
          <li
            key={`${group.scopeId}:${group.normalizedText}`}
            className="flex flex-col gap-1 rounded-md border bg-card px-2 py-1 text-sm"
          >
            <span className="font-medium text-foreground">
              <VisualizedSpelling text={group.spellings[0]?.text ?? group.normalizedText} />
            </span>
            <div className="flex flex-wrap gap-2">
              {group.sourceRows.map((row) => (
                <span key={row.id} className="text-xs text-muted-foreground">
                  {locationSourceLabel(row.source)}: <VisualizedSpelling text={row.label} />
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <PaginationFooter
        currentPage={data.page}
        totalPages={Math.max(1, Math.ceil(data.total / data.limit))}
        totalItems={data.total}
        hasNextPage={data.page * data.limit < data.total}
        hasPreviousPage={data.page > 1}
        onPageChange={setPage}
        onPrevious={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        currentPageSize={limit}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
      />
    </div>
  );
}

export interface UnscopedParentsPanelProps {
  scopeId: number;
  parents: UnscopedParent[];
  canManage?: boolean;
  onLinkParent?: (item: LinkItem, parent: UnscopedParent) => void;
}

export default function UnscopedParentsPanel({
  scopeId,
  parents,
  canManage = false,
  onLinkParent,
}: UnscopedParentsPanelProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const governorates = useCanonicalNamesQuery(CANONICAL_NAME_DOMAINS.GOVERNORATE, {});

  const toggle = (parentRowId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(parentRowId)) next.delete(parentRowId);
      else next.add(parentRowId);
      return next;
    });
  };

  const comboGroups = (): ComboGroup[] => [
    {
      id: 'all',
      headingKey: 'canonical.combobox.groupAll',
      options: (governorates.data ?? []).map(
        (name): ComboOption => ({
          id: String(name.id),
          label: name.name,
          hint: t('canonical.name.aliasCount', {
            count: name.aliasCount,
            aliasNoun: pluralAr(t, 'alias', name.aliasCount),
          }),
          target: { kind: 'name', canonicalNameId: name.id },
        }),
      ),
      status: governorates.isError ? 'error' : governorates.data === undefined ? 'loading' : 'ready',
      onRetry: () => void governorates.refetch(),
    },
  ];

  const linkParent = (parent: UnscopedParent, target: LinkTarget) => {
    if (target.kind !== 'name' || !onLinkParent) return;
    onLinkParent(
      { scopeId: GOVERNORATE_SCOPE_ID, rowIds: [parent.parentRowId], canonicalNameId: target.canonicalNameId },
      parent,
    );
  };

  return (
    <section aria-labelledby="unscoped-parents-title" className="flex flex-col gap-2 rounded-md border border-dashed p-3">
      <h3 id="unscoped-parents-title" className="text-sm font-medium text-foreground">
        {t('canonical.queue.unscoped.title')}
      </h3>
      <p className="text-xs text-muted-foreground">{t('canonical.queue.unscoped.body')}</p>
      <ul role="list" className="flex flex-col gap-2">
        {parents.map((parent) => {
          const isOpen = expanded.has(parent.parentRowId);
          return (
            <li key={parent.parentRowId} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {locationSourceLabel(parent.parentSource)}
                  </span>
                  <VisualizedSpelling text={parent.parentLabel} />
                  <Badge variant="outline">
                    {parent.cityCount} {pluralAr(t, 'city', parent.cityCount)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-11"
                    aria-expanded={isOpen}
                    onClick={() => toggle(parent.parentRowId)}
                  >
                    {isOpen ? t('canonical.queue.unscoped.hideCities') : t('canonical.queue.unscoped.showCities')}
                  </Button>
                  {canManage && onLinkParent && (
                    <LinkCombobox
                      groups={comboGroups()}
                      onSelect={(target) => linkParent(parent, target)}
                      triggerLabel={t('canonical.queue.unscoped.linkParent')}
                      ariaLabel={`${t('canonical.queue.unscoped.linkParent')} ${parent.parentLabel}`}
                      placement="popover"
                    />
                  )}
                </div>
              </div>
              {isOpen && <UnscopedParentCities scopeId={scopeId} parentRowId={parent.parentRowId} />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
