'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { LinkCombobox } from '@/components/entity-manager/LinkCombobox';
import type { ComboGroup, LinkTarget } from '@/components/entity-manager/types';
import { QueueRow } from '@/components/entity-manager/QueueRow';
import type { ReviewRowState } from '@/components/entity-manager/ReviewListCore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useI18n } from '@/i18n/I18nProvider';
import { isLocationDomain, useLinkCandidatesQuery } from '@/services/canonicalNames';
import {
  CANONICAL_NAME_DOMAINS,
  type CanonicalName,
  type CanonicalNameDomain,
  type LinkItem,
  type SourceGroup,
  type SourceRow,
} from '@/types/canonicalNames';
import type { GroupQueueRow } from './ReviewQueue';
import { AttributeRowContent } from './AttributeRowContent';
import { LocationChips } from './LocationChips';
import { LocationRowContent } from './LocationRowContent';
import { describeLinkGroup, type LinkContextRow } from './LinkContextWarning';
import { useLocationPicks } from '../utils/locationPicks';
import { linkFieldsOf, namesGroup, suggestedGroup } from '../utils/linkOptions';

export interface GroupRowNames {
  data: CanonicalName[] | undefined;
  isError: boolean;
  refetch: () => unknown;
}

export interface GroupRowActions {
  link: (items: LinkItem[], rows: LinkContextRow[], onLinked?: () => void) => void;
  unlinkRow: (group: SourceGroup, row: SourceRow) => void;
  viewProducts: (group: SourceGroup) => void;
}

export interface QueueGroupRowProps {
  domain: CanonicalNameDomain;
  row: GroupQueueRow;
  state: ReviewRowState;
  canManage: boolean;
  names: GroupRowNames;
  actions: GroupRowActions;
  dragEnabled: boolean;
}

export function QueueGroupRow({ domain, row, state, canManage, names, actions, dragEnabled }: QueueGroupRowProps) {
  const { t } = useI18n();
  const isLocation = isLocationDomain(domain);
  const isCity = domain === CANONICAL_NAME_DOMAINS.CITY;
  const group = row.group;
  const drag = useDraggable({
    id: row.id,
    data: { label: row.spelling, group },
    disabled: !dragEnabled || !canManage,
  });
  const picks = useLocationPicks(group);
  const noPicks = isLocation && picks.rowIds.length === 0;
  const [wantsCandidates, setWantsCandidates] = useState(false);
  const candidates = useLinkCandidatesQuery(
    domain,
    { scopeId: group.scopeId, normalizedText: group.normalizedText },
    wantsCandidates && canManage,
  );

  const linkTo = (target: LinkTarget) => {
    const fields = linkFieldsOf(target);
    if (isLocation) {
      actions.link([{ scopeId: group.scopeId, rowIds: picks.rowIds, ...fields }], [describeLinkGroup(group)], state.onLinked);
      return;
    }
    actions.link(
      [{ scopeId: group.scopeId, normalizedText: group.normalizedText, ...fields }],
      [describeLinkGroup(group)],
      state.onLinked,
    );
  };

  const groups: ComboGroup[] = [
    suggestedGroup(t, wantsCandidates && canManage, isCity, group.scopeId, candidates),
    namesGroup(t, isLocation, names.data, names),
  ].filter((value): value is ComboGroup => value !== null);

  const linkControl = canManage ? (
    <span
      data-link-control
      onPointerEnter={() => setWantsCandidates(true)}
      onFocus={() => setWantsCandidates(true)}
    >
      <LinkCombobox
        groups={groups}
        onSelect={(target) => linkTo(target)}
        onCreate={(newName) => linkTo({ kind: 'new', newName })}
        createLabel={t('canonical.action.createFromSpelling')}
        triggerLabel={t('canonical.action.link')}
        ariaLabel={`${t('canonical.action.link')}: ${row.spelling}`}
        placement="popover"
        disabled={noPicks}
        disabledReason={noPicks ? t('canonical.action.disabledNoRow') : undefined}
      />
    </span>
  ) : undefined;

  const dragHandle =
    dragEnabled && canManage ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={drag.setActivatorNodeRef}
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 cursor-grab touch-none"
              aria-label={t('canonical.a11y.dragInstructions')}
              {...drag.listeners}
              {...drag.attributes}
            >
              <GripVertical aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('canonical.a11y.dragInstructions')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : null;

  return (
    <QueueRow
      row={row}
      selected={state.selected}
      canManage={canManage}
      tabIndex={state.tabIndex}
      focused={state.focused}
      checkboxLabel={`${t('canonical.keys.select')}: ${row.spelling}`}
      onToggleSelect={state.onToggleSelect}
      counts={
        isLocation ? (
          <LocationRowContent group={group} />
        ) : (
          <AttributeRowContent domain={domain} group={group} />
        )
      }
      chips={
        isLocation ? (
          <LocationChips
            group={group}
            picks={picks.picks}
            canManage={canManage}
            onTogglePick={picks.togglePick}
            onUnlinkRow={(target) => actions.unlinkRow(group, target)}
          />
        ) : undefined
      }
      linkControl={linkControl}
      overflow={
        <>
          {dragHandle}
          {!isLocation && (
            <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={() => actions.viewProducts(group)}>
              {t('canonical.action.viewProducts')}
            </Button>
          )}
        </>
      }
    />
  );
}
