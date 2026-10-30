'use client';

import { useState } from 'react';
import { BulkActionBar } from '@/components/entity-manager/BulkActionBar';
import { ConfirmImpactDialog } from '@/components/entity-manager/ConfirmImpactDialog';
import { LinkCombobox } from '@/components/entity-manager/LinkCombobox';
import type { LinkTarget } from '@/components/entity-manager/types';
import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import type { CanonicalNameDomain, LinkItem, SourceGroup } from '@/types/canonicalNames';
import { CANONICAL_DOMAIN_CONFIGS } from '../config/domainConfigs';
import { linkFieldsOf, namesGroup } from '../utils/linkOptions';
import type { ReviewBulkContext } from './ReviewQueue';
import type { GroupRowNames } from './QueueGroupRow';
import { describeLinkGroup, type LinkContextRow } from './LinkContextWarning';

export interface QueueBulkBarProps {
  domain: CanonicalNameDomain;
  canManage: boolean;
  names: GroupRowNames;
  context: ReviewBulkContext;
  onLink: (items: LinkItem[], rows: LinkContextRow[], onLinked: () => void) => void;
  onAcceptSelected?: (groups: SourceGroup[]) => void;
}

export function QueueBulkBar({
  domain,
  canManage,
  names,
  context,
  onLink,
  onAcceptSelected,
}: QueueBulkBarProps) {
  const { t } = useI18n();
  const config = CANONICAL_DOMAIN_CONFIGS[domain];
  const [pending, setPending] = useState<LinkTarget | null>(null);
  const selected = context.pageRows.filter((row) => context.selectedIds.has(row.id));
  const count = selected.length;

  const targetLabel = (target: LinkTarget): string => {
    if (target.kind === 'new') return target.newName;
    if (target.kind === 'catalog') return target.catalogKey;
    return names.data?.find((name) => name.id === target.canonicalNameId)?.name ?? '';
  };

  const confirmBulkLink = async () => {
    if (pending === null) return;
    const items = selected.map(({ group }) => ({
      scopeId: group.scopeId,
      normalizedText: group.normalizedText,
      ...linkFieldsOf(pending),
    }));
    const rows = selected.map(({ group }) => describeLinkGroup(group));
    setPending(null);
    onLink(items, rows, context.onClearSelection);
  };

  const bulkCombobox =
    config.actions.bulkLink && canManage ? (
      <LinkCombobox
        groups={[namesGroup(t, false, names.data, names)]}
        onSelect={(target) => setPending(target)}
        triggerLabel={t('canonical.action.bulkLink')}
        ariaLabel={t('canonical.action.bulkLink')}
        placement="popover"
      />
    ) : undefined;

  return (
    <>
      <BulkActionBar
        count={count}
        pageCount={context.pageRows.length}
        onSelectPage={context.onSelectPage}
        onClear={context.onClearSelection}
        bulkLink={bulkCombobox ? { combobox: bulkCombobox } : undefined}
        acceptSuggestions={
          onAcceptSelected && count > 0
            ? {
                count,
                onClick: () => onAcceptSelected(selected.map((row) => row.group)),
              }
            : undefined
        }
      />
      {pending !== null && (
        <ConfirmImpactDialog
          title={t('canonical.bulk.confirmLink', {
            count,
            spellingNoun: pluralAr(t, config.labels.spellingNoun, count),
            name: targetLabel(pending),
          })}
          description={t('canonical.link.noUndo')}
          impact={{ state: 'ready', onRetry: () => undefined }}
          body={
            <p className="text-sm text-muted-foreground">{t('canonical.bulk.selected', { count })}</p>
          }
          tone="default"
          confirmLabel={t('canonical.action.confirm')}
          pendingLabel={t('canonical.action.confirm')}
          onConfirm={confirmBulkLink}
          onClose={() => setPending(null)}
        />
      )}
    </>
  );
}
