'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import Input from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyPanel, ErrorWithRetry } from '@/components/entity-manager/StateViews';
import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import { normalizeArabic } from '@/utils/arabicNormalize';
import { cn } from '@/lib/utils';
import { isLocationDomain, useCanonicalNamesQuery } from '@/services/canonicalNames';
import type { CanonicalName, CanonicalNameDomain } from '@/types/canonicalNames';
import { CANONICAL_DOMAIN_CONFIGS } from '@/app/dashboard/canonical-names/config/domainConfigs';

export interface NamesIndexProps {
  domain: CanonicalNameDomain;
  scopeId?: number | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
  initialSearch?: string;
  onSearchChange?: (value: string) => void;
  onDropGroup?: (nameId: number) => void;
}

export function NamesIndex(props: NamesIndexProps) {
  const gated = CANONICAL_DOMAIN_CONFIGS[props.domain].hasScope && (props.scopeId ?? null) === null;
  if (gated) {
    return <EmptyPanel variant="no-items" titleKey="canonical.queue.scope.gate" />;
  }
  return <NamesList {...props} />;
}

function NamesList({
  domain,
  scopeId,
  selectedId,
  onSelect,
  initialSearch,
  onSearchChange,
}: NamesIndexProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState(initialSearch ?? '');
  const namesQuery = useCanonicalNamesQuery(domain, { scopeId: scopeId ?? undefined });
  const names = namesQuery.data;

  const normalizedQuery = normalizeArabic(search);
  const visibleNames = useMemo(
    () =>
      (names ?? []).filter(
        (name) => normalizedQuery === '' || normalizeArabic(name.name).includes(normalizedQuery),
      ),
    [names, normalizedQuery],
  );

  const searchLabel = t('canonical.name.searchLabel');
  const changeSearch = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Input
        type="text"
        value={search}
        onChange={(event) => changeSearch(event.target.value)}
        onClear={() => changeSearch('')}
        clearable
        placeholder={searchLabel}
        aria-label={searchLabel}
        autoComplete="off"
      />

      {namesQuery.isPending && (
        <div className="flex flex-col gap-2" role="status" aria-live="polite">
          <span className="sr-only">{t('canonical.queue.loading')}</span>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full bg-muted" />
          ))}
        </div>
      )}

      {namesQuery.isError && (
        <ErrorWithRetry message={t('canonical.name.loadError')} onRetry={() => void namesQuery.refetch()} />
      )}

      {names !== undefined && !namesQuery.isError && names.length === 0 && (
        <EmptyPanel variant="no-items" titleKey="canonical.name.empty.none" />
      )}

      {names !== undefined &&
        !namesQuery.isError &&
        names.length > 0 &&
        visibleNames.length === 0 && (
          <EmptyPanel
            variant="no-results"
            query={search.trim()}
            onClear={() => changeSearch('')}
          />
        )}

      {names !== undefined && !namesQuery.isError && visibleNames.length > 0 && (
        <ul
          role="list"
          aria-label={t(CANONICAL_DOMAIN_CONFIGS[domain].labels.title)}
          aria-busy={namesQuery.isFetching}
          className={cn(
            'flex max-h-[70vh] flex-col gap-2 overflow-y-auto transition-opacity motion-reduce:transition-none',
            namesQuery.isFetching && 'opacity-60',
          )}
        >
          {visibleNames.map((name) => (
            <NameItem
              key={name.id}
              name={name}
              isLocation={isLocationDomain(domain)}
              selected={name.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface NameItemProps {
  name: CanonicalName;
  isLocation: boolean;
  selected: boolean;
  onSelect: (id: number) => void;
}

function NameItem({ name, isLocation, selected, onSelect }: NameItemProps) {
  const { t } = useI18n();
  const countText = isLocation
    ? t('canonical.name.orderCount', {
        count: name.orderCount,
        ordersNoun: pluralAr(t, 'order', name.orderCount),
      })
    : t('canonical.name.aliasCount', {
        count: name.aliasCount,
        aliasNoun: pluralAr(t, 'alias', name.aliasCount),
      });

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(name.id)}
        aria-current={selected ? 'true' : undefined}
        className={cn(
          'flex min-h-11 w-full flex-col items-start gap-1 rounded-md border px-3 py-2 text-start transition-colors hover:bg-accent',
          selected ? 'border-primary bg-primary/5' : 'border-border bg-card',
        )}
      >
        <span className="flex w-full min-w-0 flex-wrap items-center gap-2">
          <span className="min-w-0 break-words font-medium text-foreground">{name.name}</span>
          {name.isSystem && <Badge variant="secondary">{t('canonical.name.system')}</Badge>}
        </span>
        <span className="text-sm text-muted-foreground">{countText}</span>
      </button>
    </li>
  );
}
