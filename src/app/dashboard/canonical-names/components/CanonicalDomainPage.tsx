'use client';

import { Suspense, useState } from 'react';
import { ConfirmImpactDialog } from '@/components/entity-manager/ConfirmImpactDialog';
import type { ReviewRowState } from '@/components/entity-manager/ReviewListCore';
import { PartialSuccessNotice, QueueSkeleton } from '@/components/entity-manager/StateViews';
import { useHasPermission } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import {
  isLocationDomain,
  useCanonicalNamesQuery,
  useCreateCanonicalName,
  useDeleteCanonicalName,
  useLocationSourcesStatus,
  useRefreshLocationSources,
  useRenameCanonicalName,
  useSourceGroupsQuery,
} from '@/services/canonicalNames';
import type {
  CanonicalNameDomain,
  LinkItem,
  NameImpactAlias,
  SourceGroup,
  SourceRow,
  UnscopedParent,
} from '@/types/canonicalNames';
import { getApiErrorMessage } from '@/utils/apiError';
import { CANONICAL_DOMAIN_CONFIGS } from '../config/domainConfigs';
import { canonicalNameErrorMessage } from '../utils/canonicalNameErrors';
import { locationPicksOf } from '../utils/locationPicks';
import { useApplyLinksInChunks } from '../utils/useApplyLinksInChunks';
import { useQueueUrlState } from '../utils/queueUrlState';
import { locationSourceLabel } from '../utils/locationSourceLabel';
import { EntityManagerShell } from './EntityManagerShell';
import { NamesIndex } from './NamesIndex';
import { NameDetailsSheet } from './NameDetailsSheet';
import NameFormDialog from './NameFormDialog';
import GroupMembersDrawer from './GroupMembersDrawer';
import UnscopedParentsPanel from './UnscopedParentsPanel';
import ScopeSelector from './ScopeSelector';
import LocationSourcesStatusStrip from './LocationSourcesStatusStrip';
import { SuggestionReview } from './SuggestionReview';
import {
  LinkContextWarning,
  describeLinkGroup,
  multiContextRows,
  type LinkContextRow,
  type LinkWarningState,
} from './LinkContextWarning';
import { QueueGroupRow, type GroupRowActions, type GroupRowNames } from './QueueGroupRow';
import { QueueBulkBar } from './QueueBulkBar';
import {
  ReviewQueue,
  type GroupQueueRow,
  type ReviewBulkContext,
  type ReviewScopeControl,
} from './ReviewQueue';

export interface CanonicalDomainPageProps {
  domain: CanonicalNameDomain;
  initialSearch?: string;
}

interface UnlinkTarget {
  group: SourceGroup;
  row: SourceRow;
}

interface ReviewState {
  open: boolean;
  only?: string[];
}

function CanonicalDomainContent({ domain, initialSearch }: CanonicalDomainPageProps) {
  const { t } = useI18n();
  const config = CANONICAL_DOMAIN_CONFIGS[domain];
  const canRead = useHasPermission(config.permissions.read);
  const canManage = useHasPermission(config.permissions.manage);
  const isLocation = isLocationDomain(domain);
  const url = useQueueUrlState();
  const scopeId = config.hasScope ? url.scope : null;
  const gated = config.hasScope && scopeId === null;

  const namesQuery = useCanonicalNamesQuery(
    domain,
    scopeId === null ? {} : { scopeId },
    canRead && !gated,
  );
  const names: GroupRowNames = {
    data: namesQuery.data,
    isError: namesQuery.isError,
    refetch: namesQuery.refetch,
  };

  const [selectedNameId, setSelectedNameId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [review, setReview] = useState<ReviewState>({ open: false });
  const [warning, setWarning] = useState<LinkWarningState | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<UnlinkTarget | null>(null);
  const [aliasTarget, setAliasTarget] = useState<NameImpactAlias | null>(null);
  const [membersOf, setMembersOf] = useState<SourceGroup | null>(null);

  const selectedName = names.data?.find((name) => name.id === selectedNameId) ?? null;
  const detailsVisible = detailsOpen && selectedName !== null;

  const createName = useCreateCanonicalName(domain);
  const renameName = useRenameCanonicalName(domain);
  const deleteName = useDeleteCanonicalName(domain);
  const { applyLinks, partial, retryPartial } = useApplyLinksInChunks(domain);
  const statusQuery = useLocationSourcesStatus(isLocation && canRead);
  const refreshSources = useRefreshLocationSources();

  const unlinkedQuery = useSourceGroupsQuery(
    domain,
    { scopeId: scopeId ?? undefined, state: 'unlinked', page: 1, limit: 500 },
    detailsVisible && canManage && !gated,
  );
  const unlinkedGroups = (unlinkedQuery.data?.data ?? []).filter(
    (group) => !isLocation || locationPicksOf(group).length > 0,
  );

  const requestLink = (items: LinkItem[], rows: LinkContextRow[], onLinked?: () => void) => {
    if (config.warnMultiContext && multiContextRows(rows).length > 0) {
      setWarning({ items, rows, onLinked });
      return;
    }
    void applyLinks({ items }, onLinked);
  };

  const confirmWarning = (pending: LinkWarningState) => {
    setWarning(null);
    void applyLinks({ items: pending.items }, pending.onLinked);
  };

  const confirmUnlink = async () => {
    if (unlinkTarget === null) return;
    const { group, row } = unlinkTarget;
    setUnlinkTarget(null);
    await applyLinks({ items: [{ scopeId: group.scopeId, rowIds: [row.id], unlink: true }] });
  };

  const confirmAliasUnlink = async () => {
    if (aliasTarget === null) return;
    const alias = aliasTarget;
    setAliasTarget(null);
    await applyLinks({
      items: [{ scopeId: scopeId ?? 0, normalizedText: alias.normalizedText, unlink: true }],
    });
  };

  const addSynonym = async (group: SourceGroup) => {
    if (selectedName === null) return;
    const item: LinkItem = isLocation
      ? { scopeId: group.scopeId, rowIds: locationPicksOf(group), canonicalNameId: selectedName.id }
      : { scopeId: group.scopeId, normalizedText: group.normalizedText, canonicalNameId: selectedName.id };
    requestLink([item], [describeLinkGroup(group)]);
  };

  const acceptSelected = (groups: SourceGroup[]) =>
    setReview({ open: true, only: [...new Set(groups.map((group) => group.normalizedText))] });

  const rowActions: GroupRowActions = {
    link: requestLink,
    unlinkRow: (group, row) => setUnlinkTarget({ group, row }),
    viewProducts: (group) => setMembersOf(group),
  };

  const renderRow = (row: GroupQueueRow, state: ReviewRowState) => (
    <QueueGroupRow
      key={row.id}
      domain={domain}
      row={row}
      state={state}
      canManage={canManage}
      names={names}
      actions={rowActions}
    />
  );

  const renderBulkBar = (context: ReviewBulkContext) => (
    <QueueBulkBar
      domain={domain}
      canManage={canManage}
      names={names}
      context={context}
      onLink={requestLink}
      onAcceptSelected={isLocation ? acceptSelected : undefined}
    />
  );

  const renderUnscopedParents = (parents: UnscopedParent[]) =>
    scopeId === null ? null : (
      <UnscopedParentsPanel
        scopeId={scopeId}
        parents={parents}
        canManage={canManage}
        onLinkParent={(item) => requestLink([item], [])}
      />
    );

  const scopeSlot = (control: ReviewScopeControl) => (
    <ScopeSelector value={control.value ?? undefined} onChange={control.onChange} urlSync />
  );

  const statusStrip = isLocation ? (
    <LocationSourcesStatusStrip
      status={statusQuery.data}
      isLoading={statusQuery.isLoading}
      isError={statusQuery.isError}
      onRetry={() => void statusQuery.refetch()}
    />
  ) : undefined;

  const refreshAction = isLocation
    ? {
        onClick: () => refreshSources.mutate(),
        disabled: refreshSources.isPending || statusQuery.data?.running === true,
      }
    : undefined;

  const createAction = {
    onClick: () => {
      setCreateError(null);
      setCreateOpen(true);
    },
    disabled: gated,
    disabledReason: gated ? t('canonical.queue.scope.gate') : undefined,
  };

  const reviewAction = config.actions.suggest
    ? { onClick: () => setReview({ open: true }) }
    : undefined;

  const submitCreate = (name: string) => {
    setCreateError(null);
    createName.mutate(
      { name, parentId: config.hasScope && scopeId !== null ? scopeId : undefined },
      {
        onSuccess: () => setCreateOpen(false),
        onError: (err) =>
          setCreateError(
            canonicalNameErrorMessage(err, { name }) ??
              getApiErrorMessage(err, t('canonical.errors.generic')),
          ),
      },
    );
  };

  return (
    <EntityManagerShell
      config={config}
      accessDenied={!canRead}
      statusStrip={statusStrip}
      primaryAction={createAction}
      refresh={refreshAction}
      review={reviewAction}
      onOpenShortcuts={() => undefined}
    >
      {canRead && (
        <div className="flex flex-col gap-4">
          {partial && (
            <PartialSuccessNotice
              saved={partial.saved}
              total={partial.total}
              failed={partial.failed}
              reason={partial.reason}
              onRetry={retryPartial}
            />
          )}
          <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
            <NamesIndex
              key={initialSearch ?? ''}
              domain={domain}
              scopeId={scopeId}
              selectedId={selectedNameId}
              onSelect={(id) => {
                setSelectedNameId(id);
                setDetailsOpen(true);
              }}
              initialSearch={initialSearch}
            />
            <div className="min-w-0">
              <ReviewQueue
                domain={domain}
                canManage={canManage}
                renderRow={renderRow}
                renderBulkBar={renderBulkBar}
                renderUnscopedParents={renderUnscopedParents}
                scopeSlot={scopeSlot}
              />
            </div>
          </div>

          <LinkContextWarning
            warning={warning}
            onCancel={() => setWarning(null)}
            onConfirm={confirmWarning}
          />

          {unlinkTarget && (
            <ConfirmImpactDialog
              title={t('canonical.action.unlink')}
              description={`${locationSourceLabel(unlinkTarget.row.source)} · ${unlinkTarget.row.label}`}
              impact={{ state: 'ready', onRetry: () => undefined }}
              body={
                <p className="text-sm text-muted-foreground">
                  {unlinkTarget.group.spellings[0]?.text ?? unlinkTarget.group.normalizedText}
                </p>
              }
              tone="default"
              confirmLabel={t('canonical.action.unlink')}
              pendingLabel={t('canonical.action.unlink')}
              onConfirm={confirmUnlink}
              onClose={() => setUnlinkTarget(null)}
            />
          )}

          {aliasTarget && (
            <ConfirmImpactDialog
              title={t('canonical.action.unlink')}
              description={aliasTarget.sourceText}
              impact={{ state: 'ready', onRetry: () => undefined }}
              body={<p className="text-sm text-muted-foreground">{t('canonical.link.noUndo')}</p>}
              tone="default"
              confirmLabel={t('canonical.action.unlink')}
              pendingLabel={t('canonical.action.unlink')}
              onConfirm={confirmAliasUnlink}
              onClose={() => setAliasTarget(null)}
            />
          )}

          {membersOf && (
            <GroupMembersDrawer
              domain={domain}
              scopeId={membersOf.scopeId}
              normalizedText={membersOf.normalizedText}
              onClose={() => setMembersOf(null)}
            />
          )}

          {createOpen && (
            <NameFormDialog
              mode="create"
              existingNames={(names.data ?? []).map((name) => name.name)}
              submitting={createName.isPending}
              submitError={createError}
              onClose={() => {
                setCreateError(null);
                setCreateOpen(false);
              }}
              onSubmit={submitCreate}
            />
          )}

          <NameDetailsSheet
            domain={domain}
            name={selectedName}
            open={detailsVisible}
            onOpenChange={setDetailsOpen}
            canManage={canManage}
            unlinkedGroups={unlinkedGroups}
            onRename={async (newName) => {
              if (selectedName === null) return;
              await renameName.mutateAsync({ id: selectedName.id, name: newName });
            }}
            onDelete={async () => {
              if (selectedName === null) return;
              await deleteName.mutateAsync(selectedName.id);
              setDetailsOpen(false);
              setSelectedNameId(null);
            }}
            onUnlinkAlias={async (alias) => {
              setAliasTarget(alias);
            }}
            onAddSynonym={addSynonym}
          />

          {canManage && config.actions.suggest && (
            <SuggestionReview
              open={review.open}
              onOpenChange={(open) => setReview((prev) => ({ ...prev, open }))}
              domain={domain}
              initialScopeId={scopeId ?? undefined}
              onlyNormalizedTexts={review.only}
            />
          )}
        </div>
      )}
    </EntityManagerShell>
  );
}

export default function CanonicalDomainPage(props: CanonicalDomainPageProps) {
  return (
    <Suspense fallback={<QueueSkeleton />}>
      <CanonicalDomainContent {...props} />
    </Suspense>
  );
}
