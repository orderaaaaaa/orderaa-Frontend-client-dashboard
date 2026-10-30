'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { ConfirmImpactDialog } from '@/components/entity-manager/ConfirmImpactDialog';
import { useOverflowFade } from '@/components/entity-manager/useOverflowFade';
import { usePhone } from '@/components/entity-manager/useMediaQuery';
import { ShortcutSheet } from '@/components/entity-manager/ShortcutSheet';
import { buildDragAccessibility } from '@/components/entity-manager/dragAccessibility';
import { useFinePointer } from '@/components/entity-manager/useFinePointer';
import { useReturnFocus } from '@/components/entity-manager/useReturnFocus';
import type { ReviewRowState } from '@/components/entity-manager/ReviewListCore';
import { PartialSuccessNotice, QueueSkeleton } from '@/components/entity-manager/StateViews';
import { ScrollEndFade } from '@/components/ui/scroll-end-fade';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHasPermission } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import { cn } from '@/lib/utils';
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

interface DragPayload {
  label: string;
  group?: SourceGroup;
  rowIds?: number[];
  nameId?: number;
}

const TEXT_ENTRY_SELECTOR =
  'input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="combobox"], [role="dialog"], [role="alertdialog"]';
const OPEN_LAYER_SELECTOR =
  '[role="dialog"][data-state="open"], [role="alertdialog"], [role="combobox"][aria-expanded="true"]';

function isShortcutBlocked(target: EventTarget | null): boolean {
  if (target instanceof HTMLElement && (target.isContentEditable || target.closest(TEXT_ENTRY_SELECTOR) !== null)) {
    return true;
  }
  return document.querySelector(OPEN_LAYER_SELECTOR) !== null;
}

interface UnlinkTarget {
  group: SourceGroup;
  row: SourceRow;
}

interface ReviewState {
  open: boolean;
  only?: string[];
}

type PhonePane = 'queue' | 'names';

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
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [dragLabel, setDragLabel] = useState<string | null>(null);
  const [phonePane, setPhonePane] = useState<PhonePane>('queue');
  const phone = usePhone();
  const phoneTabsRef = useRef<HTMLDivElement>(null);
  const phoneTabsOverflow = useOverflowFade(phoneTabsRef);
  const shortcutsFocus = useReturnFocus();
  const finePointer = useFinePointer();
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 6 } });
  const sensors = useSensors(...(finePointer ? [pointerSensor] : []));
  const dragEnabled = finePointer && canManage && !phone;
  const { remember } = shortcutsFocus;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isShortcutBlocked(event.target)) return;
      if (event.code === 'Slash') {
        event.preventDefault();
        if (event.shiftKey) {
          remember();
          setShortcutsOpen(true);
        } else {
          document.querySelector<HTMLInputElement>('[data-queue-search]')?.focus();
        }
        return;
      }
      if (event.code === 'KeyN' && canManage && !gated) {
        event.preventDefault();
        setCreateError(null);
        setCreateOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canManage, gated, remember]);

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

  const nameOf = (item: LinkItem): string | null =>
    item.canonicalNameId !== undefined
      ? (names.data?.find((name) => name.id === item.canonicalNameId)?.name ?? null)
      : (item.newName ?? null);

  const runLink = (items: LinkItem[], rows: LinkContextRow[], onLinked?: () => void) => {
    void applyLinks({ items }, onLinked).then((result) => {
      const name = items.length > 0 ? nameOf(items[0]) : null;
      if (name === null || result.saved === 0) return;
      if (items.length === 1 && rows.length === 1) {
        setAnnouncement(t('canonical.a11y.linked', { spelling: rows[0].spellingLabel, name }));
      } else {
        setAnnouncement(
          t('canonical.bulk.ok', {
            count: result.saved,
            spellingNoun: pluralAr(t, config.labels.spellingNoun, result.saved),
            name,
          }),
        );
      }
    });
  };

  const requestLink = (items: LinkItem[], rows: LinkContextRow[], onLinked?: () => void) => {
    if (config.warnMultiContext && multiContextRows(rows).length > 0) {
      setWarning({ items, rows, onLinked });
      return;
    }
    runLink(items, rows, onLinked);
  };

  const confirmWarning = (pending: LinkWarningState) => {
    setWarning(null);
    runLink(pending.items, pending.rows, pending.onLinked);
  };

  const openShortcuts = () => {
    shortcutsFocus.remember();
    setShortcutsOpen(true);
  };

  const openCreate = () => {
    setCreateError(null);
    setCreateOpen(true);
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

  const linkGroupTo = (group: SourceGroup, nameId: number, rowIds: number[] = locationPicksOf(group)) => {
    const item: LinkItem = isLocation
      ? { scopeId: group.scopeId, rowIds, canonicalNameId: nameId }
      : { scopeId: group.scopeId, normalizedText: group.normalizedText, canonicalNameId: nameId };
    requestLink([item], [describeLinkGroup(group)]);
  };

  const addSynonym = async (group: SourceGroup) => {
    if (selectedName === null) return;
    linkGroupTo(group, selectedName.id);
  };

  const payloadOf = (data: { current?: unknown } | undefined) =>
    data?.current as DragPayload | undefined;

  const onDragStart = (event: DragStartEvent) => {
    setDragLabel(payloadOf(event.active.data)?.label ?? null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDragLabel(null);
    const payload = payloadOf(event.active.data);
    const nameId = payloadOf(event.over?.data)?.nameId;
    if (!payload?.group || nameId === undefined) return;
    if (isLocation && (payload.rowIds ?? []).length === 0) {
      setAnnouncement(t('canonical.action.disabledNoRow'));
      return;
    }
    linkGroupTo(payload.group, nameId, payload.rowIds);
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
      dragEnabled={dragEnabled}
    />
  );

  const renderBulkBar = (context: ReviewBulkContext) => (
    <QueueBulkBar
      domain={domain}
      canManage={canManage}
      names={names}
      context={context}
      onLink={requestLink}
      onAcceptSelected={isLocation && canManage ? acceptSelected : undefined}
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
    onClick: openCreate,
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
      onOpenShortcuts={openShortcuts}
      announcement={announcement}
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
          <DndContext
            sensors={sensors}
            accessibility={buildDragAccessibility(t)}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setDragLabel(null)}
          >
            <div className="relative sm:hidden">
              <div ref={phoneTabsRef} className="overflow-x-auto">
                <Tabs value={phonePane} onValueChange={(next) => setPhonePane(next as PhonePane)}>
                  <TabsList className="w-max min-w-full justify-start">
                    <TabsTrigger value="queue" className="min-h-11">
                      {t('canonical.phone.queueTab')}
                    </TabsTrigger>
                    <TabsTrigger value="names" className="min-h-11">
                      {t('canonical.phone.namesTab')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <ScrollEndFade visible={phoneTabsOverflow} />
            </div>
            <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
              <div className={cn('min-w-0', phonePane === 'queue' && 'max-sm:hidden')}>
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
                  dragEnabled={dragEnabled}
                />
              </div>
              <div className={cn('min-w-0', phonePane === 'names' && 'max-sm:hidden')}>
                <ReviewQueue
                  domain={domain}
                  canManage={canManage}
                  keyboard={{
                    onOpenRow: (row) => {
                      if (config.actions.viewProducts) setMembersOf(row.group);
                    },
                  }}
                  renderRow={renderRow}
                  renderBulkBar={renderBulkBar}
                  renderUnscopedParents={renderUnscopedParents}
                  scopeSlot={scopeSlot}
                />
              </div>
            </div>
            <DragOverlay>
              {dragLabel !== null && (
                <div className="rounded-md border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-md">
                  {dragLabel}
                </div>
              )}
            </DragOverlay>
          </DndContext>

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

          <ShortcutSheet
            open={shortcutsOpen}
            onOpenChange={setShortcutsOpen}
            onCloseAutoFocus={shortcutsFocus.onCloseAutoFocus}
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
