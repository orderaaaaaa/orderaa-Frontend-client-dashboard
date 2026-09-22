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
import { cn } from '@/lib/utils';
import type {
  CanonicalName,
  CanonicalNameDomain,
  LinkItem,
  SourceGroup,
} from '@/types/canonicalNames';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
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

const stateBadge = (group: SourceGroup) => {
  if (group.state === 'LINKED') {
    return { label: `مرتبط بـ ${group.linkedName?.name ?? ''}`, variant: 'default' as const };
  }
  if (group.state === 'PARTIAL') {
    return { label: 'مرتبط جزئيا', variant: 'secondary' as const };
  }
  if (group.state === 'MIXED') {
    return { label: 'مختلط', variant: 'destructive' as const };
  }
  if (group.implicitName) {
    return { label: 'مطابق تلقائيا', variant: 'outline' as const };
  }
  return { label: 'غير مرتبط', variant: 'outline' as const };
};

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
  const dragId = `group:${group.scopeId}:${group.normalizedText}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: {
      scopeId: group.scopeId,
      normalizedText: group.normalizedText,
      attributeContexts: group.attributeContexts,
    },
    disabled: !canManage,
  });

  const badge = stateBadge(group);
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

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-3 bg-white',
        isDragging && 'opacity-50',
      )}
    >
      <div className="flex items-start gap-2">
        {canManage && (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onToggleSelect(checked === true)}
            className="mt-1"
          />
        )}
        {canManage && (
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

      {canManage && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-48">
            <SearchableSelect
              options={nameSelectOptions}
              placeholder="ربط بـ"
              onChange={(next) => {
                const target = nameOptions.find((n) => String(n.id) === next);
                if (!target) return;
                onRequestLink(
                  {
                    scopeId: group.scopeId,
                    normalizedText: group.normalizedText,
                    canonicalNameId: target.id,
                  },
                  group,
                );
              }}
            />
          </div>
          <CandidatesPopover
            domain={domain}
            scopeId={group.scopeId}
            normalizedText={group.normalizedText}
            onSelect={(candidate) =>
              onRequestLink(
                {
                  scopeId: group.scopeId,
                  normalizedText: group.normalizedText,
                  canonicalNameId: candidate.canonicalNameId ?? undefined,
                  catalogKey: candidate.catalogKey ?? undefined,
                },
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
            onClick={() =>
              onDirectLink({
                scopeId: group.scopeId,
                normalizedText: group.normalizedText,
                newName: primarySpelling,
              })
            }
          >
            إنشاء اسم من هذه القيمة
          </Button>
          {group.state !== 'UNLINKED' && (
            <Button variant="ghost" size="sm" onClick={onUnlink}>
              إلغاء الربط
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
