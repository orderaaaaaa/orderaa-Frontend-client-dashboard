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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  isLocationDomain,
  useApplyLinks,
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
import GroupMembersDrawer from './GroupMembersDrawer';
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

type LinkWarningState = {
  items: LinkItem[];
  rows: LinkContextRow[];
  onLinked?: () => void;
};

interface LinkContextRow {
  spellingLabel: string;
  contexts: GroupAttributeContext[];
}

const describeGroup = (group: SourceGroup): LinkContextRow => ({
  spellingLabel: group.spellings[0]?.text ?? group.normalizedText,
  contexts: group.attributeContexts,
});

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

  const applyLinks = useApplyLinks(domain);
  const createName = useCreateCanonicalName(domain);
  const renameName = useRenameCanonicalName(domain);
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
    const rows = groups.map(describeGroup);
    const warnRows = rows.filter((row) => row.contexts.length >= 2);
    if (
      domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION &&
      warnRows.length > 0
    ) {
      setLinkWarning({ items, rows: warnRows, onLinked });
      return;
    }
    applyLinks.mutate({ items }, { onSuccess: () => onLinked?.() });
  };

  const directLink = (item: LinkItem, onLinked?: () => void) => {
    applyLinks.mutate({ items: [item] }, { onSuccess: () => onLinked?.() });
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
      applyLinks.mutate({
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
    const warnRows = rows.filter((row) => row.contexts.length >= 2);
    if (
      domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION &&
      warnRows.length > 0
    ) {
      setLinkWarning({ items: [item], rows: warnRows });
      return;
    }
    applyLinks.mutate({ items: [item] });
  };

  const nameOptionsList = useMemo(() => nameOptions ?? [], [nameOptions]);

  const refreshButton =
    isLocation && canManage ? (
      <Button
        variant="outline"
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
          <div className="flex items-center gap-2">
            <ScopeSelector
              value={governorateScopeId}
              onChange={setGovernorateScopeId}
            />
            {canManage && (
              <SuggestionsPanel
                domain={domain}
                scopeId={undefined}
                onApply={(items) => applyLinks.mutate({ items })}
                applying={applyLinks.isPending}
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
        <div className="flex items-center gap-2">
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
              onApply={(items) => applyLinks.mutate({ items })}
              applying={applyLinks.isPending}
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
              renameName.mutate(
                { id: impactDialog.target.id, name: impactDialog.pendingName },
                { onSuccess: () => setImpactDialog(null) },
              );
              return;
            }
            if (impactDialog.mode === 'confirm-delete') {
              deleteName.mutate(impactDialog.target.id, {
                onSuccess: () => setImpactDialog(null),
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

      {linkWarning && (
        <Dialog open onOpenChange={(open) => !open && setLinkWarning(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تنبيه الربط</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              {linkWarning.rows.map((row) => (
                <p key={row.spellingLabel}>
                  هذه القيمة &quot;{row.spellingLabel}&quot; تظهر تحت{' '}
                  {row.contexts.length} خصائص. سيظهر الاسم الموحد فيها كلها.
                </p>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLinkWarning(null)}>
                إلغاء
              </Button>
              <Button
                onClick={() => {
                  applyLinks.mutate(
                    { items: linkWarning.items },
                    { onSuccess: () => linkWarning.onLinked?.() },
                  );
                  setLinkWarning(null);
                }}
              >
                تأكيد
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
