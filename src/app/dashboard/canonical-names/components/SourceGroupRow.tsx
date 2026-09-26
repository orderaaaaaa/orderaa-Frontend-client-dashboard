'use client';

import { Fragment, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { isLocationDomain } from '@/services/canonicalNames';
import type {
  CanonicalName,
  CanonicalNameDomain,
  LinkItem,
  LocationSource,
  SourceGroup,
  SourceRow,
} from '@/types/canonicalNames';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
import { locationSourceLabel } from '../utils/locationSourceLabel';
import CandidatesPopover from './CandidatesPopover';

export function VisualizedSpelling({ text }: { text: string }) {
  const leadingMatch = text.match(/^\s+/);
  const trailingMatch = text.match(/\s+$/);
  const leading = leadingMatch?.[0] ?? '';
  const trailing = trailingMatch?.[0] ?? '';
  const core = text.slice(leading.length, text.length - trailing.length);

  return (
    <span dir="rtl" className="whitespace-pre">
      {leading && (
        <span className="text-gray-400" aria-hidden>
          {'·'.repeat(leading.length)}
        </span>
      )}
      {core || <Fragment>&nbsp;</Fragment>}
      {trailing && (
        <span className="text-gray-400" aria-hidden>
          {'·'.repeat(trailing.length)}
        </span>
      )}
    </span>
  );
}

const stateBadge = (group: SourceGroup, isLocation: boolean) => {
  if (isLocation && group.sourceRows.every((row) => row.canonicalNameId === null)) {
    return { label: 'غير مرتبط', variant: 'outline' as const };
  }
  if (group.state === 'LINKED') {
    return { label: `مرتبط بـ ${group.linkedName?.name ?? ''}`, variant: 'default' as const };
  }
  if (group.state === 'PARTIAL') {
    return { label: 'مرتبط جزئيا', variant: 'secondary' as const };
  }
  if (group.state === 'MIXED') {
    return { label: 'مختلط', variant: 'destructive' as const };
  }
  if (!isLocation && group.implicitName) {
    return { label: 'مطابق تلقائيا', variant: 'outline' as const };
  }
  return { label: 'غير مرتبط', variant: 'outline' as const };
};

interface SourceRowChipProps {
  row: SourceRow;
  scopeId: number;
  nameOptions: CanonicalName[];
  canManage: boolean;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  onUnlink: () => void;
}

function SourceRowChip({
  row,
  scopeId,
  nameOptions,
  canManage,
  checked,
  onToggle,
  onUnlink,
}: SourceRowChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `row:${row.id}`,
    data: { scopeId, rowId: row.id },
    disabled: !canManage,
  });
  const linkedName =
    row.canonicalNameId !== null
      ? nameOptions.find((name) => name.id === row.canonicalNameId)
      : undefined;

  return (
    <li
      ref={setNodeRef}
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-md border bg-gray-50 px-2 py-1 text-sm',
        isDragging && 'opacity-50',
      )}
    >
      {canManage && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Checkbox
                checked={checked}
                onCheckedChange={(next) => onToggle(next === true)}
                aria-label="اختيار الصف"
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>صف واحد لكل شركة شحن</TooltipContent>
        </Tooltip>
      )}
      {canManage && (
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="cursor-grab text-gray-400 hover:text-gray-600"
          aria-label="سحب للربط"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <span className="text-xs font-medium text-gray-500">
        {locationSourceLabel(row.source)}
      </span>
      <span className="text-gray-900">
        <VisualizedSpelling text={row.label} />
      </span>
      {row.canonicalNameId !== null && (
        <Badge variant="default">
          {linkedName ? `مرتبط بـ ${linkedName.name}` : 'مرتبط'}
        </Badge>
      )}
      {row.stale && <Badge variant="destructive">لم يعد في قائمة الشركة</Badge>}
      {canManage && row.canonicalNameId !== null && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={onUnlink}
        >
          إلغاء الربط
        </Button>
      )}
    </li>
  );
}

interface SourceGroupRowProps {
  domain: CanonicalNameDomain;
  group: SourceGroup;
  nameOptions: CanonicalName[];
  selected: boolean;
  onToggleSelect: (checked: boolean) => void;
  onRequestLink: (item: LinkItem, group: SourceGroup) => void;
  onDirectLink: (item: LinkItem) => void;
  onUnlink: () => void;
  onViewMembers?: () => void;
  canManage: boolean;
}

export default function SourceGroupRow({
  domain,
  group,
  nameOptions,
  selected,
  onToggleSelect,
  onRequestLink,
  onDirectLink,
  onUnlink,
  onViewMembers,
  canManage,
}: SourceGroupRowProps) {
  const [spellingsOpen, setSpellingsOpen] = useState(false);
  const [checkedBySource, setCheckedBySource] = useState<
    Map<LocationSource, number>
  >(new Map());
  const isLocation = isLocationDomain(domain);
  const dragId = `group:${group.scopeId}:${group.normalizedText}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: {
      scopeId: group.scopeId,
      normalizedText: group.normalizedText,
      attributeContexts: group.attributeContexts,
    },
    disabled: !canManage || isLocation,
  });

  const badge = stateBadge(group, isLocation);
  const primarySpelling = group.spellings[0]?.text ?? group.normalizedText;
  const otherSpellings = group.spellings.slice(1);
  const isAttributeOption = domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION;
  const isAttributeDomain =
    domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_NAME || isAttributeOption;
  const hasMultipleContexts = group.attributeContexts.length >= 2;
  const countLabel = isAttributeDomain
    ? `${group.productCount} منتج`
    : `${group.orderCount} طلب`;

  const nameSelectOptions = nameOptions.map((name) => ({
    key: String(name.id),
    label: name.name,
  }));

  const checkedRowIds = group.sourceRows
    .filter((row) => checkedBySource.get(row.source) === row.id)
    .map((row) => row.id);
  const linkDisabled = isLocation && checkedRowIds.length === 0;

  const toggleRow = (row: SourceRow, checked: boolean) => {
    setCheckedBySource((prev) => {
      const next = new Map(prev);
      if (checked) next.set(row.source, row.id);
      else if (next.get(row.source) === row.id) next.delete(row.source);
      return next;
    });
  };

  const linkTarget = (
    target: Pick<LinkItem, 'canonicalNameId' | 'catalogKey' | 'newName'>,
  ): LinkItem => {
    if (!isLocation) {
      return { scopeId: group.scopeId, normalizedText: group.normalizedText, ...target };
    }
    setCheckedBySource(new Map());
    return { scopeId: group.scopeId, rowIds: checkedRowIds, ...target };
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-3 bg-white',
        isDragging && 'opacity-50',
      )}
    >
      <div className="flex items-start gap-2">
        {canManage && !isLocation && (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onToggleSelect(checked === true)}
            className="mt-1"
          />
        )}
        {canManage && !isLocation && (
          <button
            type="button"
            {...listeners}
            {...attributes}
            className="mt-1 cursor-grab text-gray-400 hover:text-gray-600"
            aria-label="سحب للربط"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-sm text-gray-900">
              <VisualizedSpelling text={primarySpelling} />
            </span>
            {otherSpellings.length > 0 && (
              <Popover open={spellingsOpen} onOpenChange={setSpellingsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    +{otherSpellings.length} صيغ
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <ul className="flex flex-col gap-1 text-sm">
                    {otherSpellings.map((spelling) => (
                      <li
                        key={spelling.text}
                        className="flex items-center justify-between gap-2"
                      >
                        <VisualizedSpelling text={spelling.text} />
                        <span className="text-gray-400 text-xs">
                          {spelling.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            )}
            <Badge variant={badge.variant}>{badge.label}</Badge>
            {isAttributeOption && hasMultipleContexts && (
              <Badge variant="destructive">
                تظهر تحت {group.attributeContexts.length} خصائص
              </Badge>
            )}
          </div>

          {isAttributeOption && group.attributeContexts.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              تظهر في: {group.attributeContexts.map((c) => c.name).join('، ')}
            </p>
          )}

          <p className="mt-1 text-xs text-gray-500">{countLabel}</p>
        </div>
      </div>

      {isLocation && group.sourceRows.length > 0 && (
        <ul className="flex flex-col gap-1">
          {group.sourceRows.map((row) => (
            <SourceRowChip
              key={row.id}
              row={row}
              scopeId={group.scopeId}
              nameOptions={nameOptions}
              canManage={canManage}
              checked={checkedBySource.get(row.source) === row.id}
              onToggle={(checked) => toggleRow(row, checked)}
              onUnlink={() =>
                onDirectLink({
                  scopeId: group.scopeId,
                  rowIds: [row.id],
                  unlink: true,
                })
              }
            />
          ))}
        </ul>
      )}

      {canManage && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-48">
            <SearchableSelect
              options={nameSelectOptions}
              placeholder={linkDisabled ? 'اختر صفا للربط' : 'ربط بـ'}
              disabled={linkDisabled}
              onChange={(next) => {
                const target = nameOptions.find((n) => String(n.id) === next);
                if (!target) return;
                onRequestLink(linkTarget({ canonicalNameId: target.id }), group);
              }}
            />
          </div>
          <CandidatesPopover
            domain={domain}
            scopeId={group.scopeId}
            normalizedText={group.normalizedText}
            disabled={linkDisabled}
            onSelect={(candidate) =>
              onRequestLink(
                linkTarget({
                  canonicalNameId: candidate.canonicalNameId ?? undefined,
                  catalogKey: candidate.catalogKey ?? undefined,
                }),
                group,
              )
            }
          />
          {isAttributeDomain && onViewMembers && (
            <Button variant="outline" size="sm" onClick={onViewMembers}>
              عرض المنتجات
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={linkDisabled}
            onClick={() => onDirectLink(linkTarget({ newName: primarySpelling }))}
          >
            إنشاء اسم من هذه القيمة
          </Button>
          {!isLocation && group.state !== 'UNLINKED' && (
            <Button variant="ghost" size="sm" onClick={onUnlink}>
              إلغاء الربط
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
