'use client';

import { Suspense, useState, type ReactNode } from 'react';
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
} from '@/services/canonicalNames';
import type {
  CanonicalNameDomain,
  LinkItem,
  SourceGroup,
  SourceRow,
  UnscopedParent,
} from '@/types/canonicalNames';
import { CANONICAL_DOMAIN_CONFIGS } from '../config/domainConfigs';
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
  renderSuggestionReview?: (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialScopeId?: number;
  }) => ReactNode;
}

interface UnlinkTarget {
  group: SourceGroup;
  row: SourceRow;
}

function CanonicalDomainContent({ domain, initialSearch, renderSuggestionReview }: CanonicalDomainPageProps) {
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
  const [reviewOpen, setReviewOpen] = useState(false);
  const [warning, setWarning] = useState<LinkWarningState | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<UnlinkTarget | null>(null);
  const [membersOf, setMembersOf] = useState<SourceGroup | null>(null);

  const selectedName = names.data?.find((name) => name.id === selectedNameId) ?? null;

  const createName = useCreateCanonicalName(domain);
  const renameName = useRenameCanonicalName(domain);
  const deleteName = useDeleteCanonicalName(domain);
  const { applyLinks, partial, retryPartial } = useApplyLinksInChunks(domain);
  const statusQuery = useLocationSourcesStatus(isLocation && canRead);
  const refreshSources = useRefreshLocationSources();

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
    onClick: () => setCreateOpen(true),
    disabled: gated,
    disabledReason: gated ? t('canonical.queue.scope.gate') : undefined,
  };

  const review = renderSuggestionReview ? { onClick: () => setReviewOpen(true) } : undefined;

  return (
    <EntityManagerShell
      config={config}
      accessDenied={!canRead}
      statusStrip={statusStrip}
      primaryAction={createAction}
      refresh={refreshAction}
      review={review}
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
              onClose={() => setCreateOpen(false)}
              onSubmit={(name) => {
                createName.mutate(
                  { name, parentId: config.hasScope && scopeId !== null ? scopeId : undefined },
                  { onSuccess: () => setCreateOpen(false) },
                );
              }}
            />
          )}

          <NameDetailsSheet
            domain={domain}
            name={selectedName}
            open={detailsOpen && selectedName !== null}
            onOpenChange={setDetailsOpen}
            canManage={canManage}
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
          />

          {renderSuggestionReview?.({
            open: reviewOpen,
            onOpenChange: setReviewOpen,
            initialScopeId: scopeId ?? undefined,
          })}
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
