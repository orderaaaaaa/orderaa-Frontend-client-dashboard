'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { useHasPermission } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import { getApiErrorMessage } from '@/utils/apiError';
import { toast } from 'react-toastify';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  deleteNameErrorMessage,
  isLocationDomain,
  useCanonicalNamesQuery,
  useCreateCanonicalName,
  useDeleteCanonicalName,
  useLocationSourcesStatus,
  useRefreshLocationSources,
  useRenameCanonicalName,
} from '@/services/canonicalNames';
import type {
  CanonicalName,
  CanonicalNameDomain,
  GroupAttributeContext,
  LinkItem,
  SourceGroup,
} from '@/types/canonicalNames';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
import { useApplyLinksInChunks } from '@/app/dashboard/canonical-names/utils/useApplyLinksInChunks';
import GroupMembersDrawer from './GroupMembersDrawer';
import {
  LinkContextWarning,
  describeLinkGroup,
  multiContextRows,
  type LinkContextRow,
  type LinkWarningState,
} from './LinkContextWarning';
import LocationSourcesStatusStrip from './LocationSourcesStatusStrip';
import NameFormDialog from './NameFormDialog';
import NameImpactDialog from './NameImpactDialog';
import NamesPane from './NamesPane';
import ScopeSelector from './ScopeSelector';
import SourceGroupsPane from './SourceGroupsPane';
import SuggestionsPanel from './SuggestionsPanel';

type NameFormState =
  | { mode: 'create' }
  | { mode: 'rename'; target: CanonicalName };

type ImpactDialogState =
  | { mode: 'view'; target: CanonicalName }
  | { mode: 'confirm-rename'; target: CanonicalName; pendingName: string }
  | { mode: 'confirm-delete'; target: CanonicalName };

type MembersDrawerState = { scopeId: number; normalizedText: string };

interface CanonicalNamesWorkspaceProps {
  domain: CanonicalNameDomain;
  title: string;
  scopeSelector: 'none' | 'governorate';
  initialSearch?: string;
}

export default function CanonicalNamesWorkspace({
  domain,
  title,
  scopeSelector,
  initialSearch,
}: CanonicalNamesWorkspaceProps) {
  const canManage = useHasPermission(PERMISSION_CODES.CANONICAL_NAMES_MANAGE);
  const [governorateScopeId, setGovernorateScopeId] = useState<number>();

  const effectiveScopeId =
    domain === CANONICAL_NAME_DOMAINS.CITY ? (governorateScopeId ?? 0) : 0;
  const scopeReady =
    domain !== CANONICAL_NAME_DOMAINS.CITY || governorateScopeId !== undefined;

  const [nameForm, setNameForm] = useState<NameFormState | null>(null);
  const [impactDialog, setImpactDialog] = useState<ImpactDialogState | null>(
    null,
  );
  const [membersDrawer, setMembersDrawer] = useState<MembersDrawerState | null>(
    null,
  );
  const [linkWarning, setLinkWarning] = useState<LinkWarningState | null>(null);

  const { data: nameOptions } = useCanonicalNamesQuery(domain, {
    scopeId: effectiveScopeId,
  });

  const isLocation = isLocationDomain(domain);
  const { data: sourcesStatus } = useLocationSourcesStatus(isLocation);
  const refreshSources = useRefreshLocationSources();
  const sourcesRunning = sourcesStatus?.running ?? false;

  const { applyLinks, applying } = useApplyLinksInChunks(domain);
  const createName = useCreateCanonicalName(domain);
  const renameName = useRenameCanonicalName(domain);
  const { t } = useI18n();
  const deleteName = useDeleteCanonicalName(domain);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const requestLink = (
    items: LinkItem[],
    groups: SourceGroup[],
    onLinked?: () => void,
  ) => {
    const warnRows = multiContextRows(groups.map(describeLinkGroup));
    if (
      domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION &&
      warnRows.length > 0
    ) {
      setLinkWarning({ items, rows: warnRows, onLinked });
      return;
    }
    void applyLinks({ items }, onLinked);
  };

  const directLink = (item: LinkItem, onLinked?: () => void) => {
    void applyLinks({ items: [item] }, onLinked);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !canManage) return;
    const dropData = over.data.current as { nameId?: number } | undefined;
    const dragData = active.data.current as
      | {
          scopeId?: number;
          rowId?: number;
          normalizedText?: string;
          attributeContexts?: GroupAttributeContext[];
        }
      | undefined;
    if (!dropData?.nameId) return;
    if (isLocationDomain(domain)) {
      if (!dragData?.rowId) return;
      void applyLinks({
        items: [
          {
            scopeId: dragData.scopeId ?? 0,
            rowIds: [dragData.rowId],
            canonicalNameId: dropData.nameId,
          },
        ],
      });
      return;
    }
    if (!dragData?.normalizedText) return;
    const item: LinkItem = {
      scopeId: dragData.scopeId ?? 0,
      normalizedText: dragData.normalizedText,
      canonicalNameId: dropData.nameId,
    };
    const rows: LinkContextRow[] = [
      {
        spellingLabel: dragData.normalizedText,
        contexts: dragData.attributeContexts ?? [],
      },
    ];
    const warnRows = multiContextRows(rows);
    if (
      domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION &&
      warnRows.length > 0
    ) {
      setLinkWarning({ items: [item], rows: warnRows });
      return;
    }
    void applyLinks({ items: [item] });
  };

  const nameOptionsList = useMemo(() => nameOptions ?? [], [nameOptions]);

  const refreshButton =
    isLocation && canManage ? (
      <Button
        variant="outline"
        className="min-h-10"
        onClick={() => refreshSources.mutate()}
        disabled={refreshSources.isPending || sourcesRunning}
      >
        تحديث القوائم
      </Button>
    ) : null;

  const statusStrip = isLocation ? (
    <LocationSourcesStatusStrip status={sourcesStatus} />
  ) : null;

  if (domain === CANONICAL_NAME_DOMAINS.CITY && governorateScopeId === undefined) {
    return (
      <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <ScopeSelector
              value={governorateScopeId}
              onChange={setGovernorateScopeId}
            />
            {canManage && (
              <SuggestionsPanel
                domain={domain}
                scopeId={undefined}
                onApply={(items) => void applyLinks({ items })}
                applying={applying}
              />
            )}
            {refreshButton}
          </div>
        </div>
        {statusStrip}
        <p className="text-sm text-gray-500 text-center py-12">
          اختر المحافظة لعرض المدن
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {scopeSelector === 'governorate' && (
            <ScopeSelector
              value={governorateScopeId}
              onChange={setGovernorateScopeId}
            />
          )}
          {canManage && (
            <SuggestionsPanel
              domain={domain}
              scopeId={
                domain === CANONICAL_NAME_DOMAINS.CITY
                  ? governorateScopeId
                  : undefined
              }
              onApply={(items) => void applyLinks({ items })}
              applying={applying}
            />
          )}
          {refreshButton}
        </div>
      </div>

      {statusStrip}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <NamesPane
            domain={domain}
            scopeId={effectiveScopeId}
            canManage={canManage}
            onCreate={() => setNameForm({ mode: 'create' })}
            onRename={(target) => setNameForm({ mode: 'rename', target })}
            onDelete={(target) =>
              setImpactDialog({ mode: 'confirm-delete', target })
            }
            onViewImpact={(target) => setImpactDialog({ mode: 'view', target })}
          />
          <SourceGroupsPane
            domain={domain}
            scopeId={effectiveScopeId}
            scopeReady={scopeReady}
            canManage={canManage}
            nameOptions={nameOptionsList}
            initialSearch={initialSearch}
            sourcesRunning={isLocation && sourcesRunning}
            sourcesStatus={isLocation ? sourcesStatus : undefined}
            refreshToken={refreshSources.submittedAt}
            onRequestLink={requestLink}
            onDirectLink={directLink}
            onViewMembers={(scopeId, normalizedText) =>
              setMembersDrawer({ scopeId, normalizedText })
            }
          />
        </div>
      </DndContext>

      {nameForm && (
        <NameFormDialog
          mode={nameForm.mode}
          initialName={
            nameForm.mode === 'rename' ? nameForm.target.name : undefined
          }
          existingNames={nameOptionsList
            .filter(
              (option) =>
                nameForm.mode !== 'rename' || option.id !== nameForm.target.id,
            )
            .map((option) => option.name)}
          submitting={createName.isPending}
          onClose={() => setNameForm(null)}
          onSubmit={(name) => {
            if (nameForm.mode === 'create') {
              createName.mutate(
                {
                  name,
                  parentId:
                    domain === CANONICAL_NAME_DOMAINS.CITY
                      ? governorateScopeId
                      : undefined,
                },
                { onSuccess: () => setNameForm(null) },
              );
              return;
            }
            setImpactDialog({
              mode: 'confirm-rename',
              target: nameForm.target,
              pendingName: name,
            });
            setNameForm(null);
          }}
        />
      )}

      {impactDialog && (
        <NameImpactDialog
          domain={domain}
          id={impactDialog.target.id}
          mode={impactDialog.mode}
          pendingName={
            impactDialog.mode === 'confirm-rename'
              ? impactDialog.pendingName
              : undefined
          }
          confirming={renameName.isPending || deleteName.isPending}
          onClose={() => setImpactDialog(null)}
          onConfirm={() => {
            if (impactDialog.mode === 'confirm-rename') {
              const renamed = impactDialog.pendingName;
              renameName.mutate(
                { id: impactDialog.target.id, name: renamed },
                {
                  onSuccess: (result) => {
                    setImpactDialog(null);
                    const orders = result.impact.orderCount;
                    toast.success(
                      isLocation
                        ? t('canonical.name.renamedCount', {
                            orders,
                            ordersNoun: pluralAr(t, 'order', orders),
                          })
                        : t('canonical.name.renamed', { name: renamed }),
                    );
                  },
                  onError: (err: unknown) => {
                    toast.error(getApiErrorMessage(err, t('canonical.errors.generic')));
                  },
                },
              );
              return;
            }
            if (impactDialog.mode === 'confirm-delete') {
              deleteName.mutate(impactDialog.target.id, {
                onSuccess: () => setImpactDialog(null),
                onError: (err: unknown) => {
                  toast.error(deleteNameErrorMessage(err));
                },
              });
            }
          }}
        />
      )}

      {membersDrawer && (
        <GroupMembersDrawer
          domain={domain}
          scopeId={membersDrawer.scopeId}
          normalizedText={membersDrawer.normalizedText}
          onClose={() => setMembersDrawer(null)}
        />
      )}

      <LinkContextWarning
        warning={linkWarning}
        onCancel={() => setLinkWarning(null)}
        onConfirm={(warning) => {
          void applyLinks({ items: warning.items }, warning.onLinked);
          setLinkWarning(null);
        }}
      />
    </div>
  );
}
