'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PageLoading from '@/components/ui/page-loading';
import {
  isLocationDomain,
  useLinkSuggestionsMutation,
  useSourceGroupsQuery,
} from '@/services/canonicalNames';
import type {
  CanonicalNameDomain,
  LinkItem,
  LocationSource,
  SourceGroup,
} from '@/types/canonicalNames';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
import {
  buildSuggestionTargets,
  clusterUnlinkedRows,
  initialSuggestionPicks,
  proposedLinkKey,
  proposedNameKey,
  suggestionLinkItems,
  unlinkedRowsOf,
  type SuggestionPicks,
  type SuggestionTarget,
} from '../utils/locationSuggestions';
import { locationSourceLabel } from '../utils/locationSourceLabel';
import ScopeSelector from './ScopeSelector';
import { VisualizedSpelling } from './SourceGroupRow';

const UNAVAILABLE_LABEL = 'غير متاح، ابحث عنه في القائمة';

type Step = 'pick-scope' | 'select' | 'confirm';

interface SuggestionsPanelProps {
  domain: CanonicalNameDomain;
  scopeId: number | undefined;
  onApply: (items: LinkItem[]) => void;
  applying?: boolean;
}

export default function SuggestionsPanel({
  domain,
  scopeId,
  onApply,
  applying,
}: SuggestionsPanelProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pickedScopeId, setPickedScopeId] = useState<number>();
  const [targets, setTargets] = useState<SuggestionTarget[]>([]);
  const [picks, setPicks] = useState<SuggestionPicks>({});
  const suggest = useLinkSuggestionsMutation(domain);

  const isLocation = isLocationDomain(domain);
  const isCity = domain === CANONICAL_NAME_DOMAINS.CITY;
  const groupsScopeId = isCity ? pickedScopeId : 0;

  const { data: groupsPage, isLoading: groupsLoading } = useSourceGroupsQuery(
    domain,
    { scopeId: groupsScopeId ?? 0, page: 1, limit: 500 },
    open && isLocation && groupsScopeId !== undefined,
  );

  const groupsByText = useMemo(() => {
    const map = new Map<string, SourceGroup>();
    (groupsPage?.data ?? []).forEach((group) =>
      map.set(group.normalizedText, group),
    );
    return map;
  }, [groupsPage]);

  const toggle = (key: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const runSuggest = (nextScopeId: number | undefined) => {
    setSelected(new Set());
    setStep('select');
    suggest.mutate({ scopeId: nextScopeId });
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setTargets([]);
    setPicks({});
    if (isCity) {
      setPickedScopeId(scopeId);
      if (scopeId === undefined) {
        suggest.reset();
        setSelected(new Set());
        setStep('pick-scope');
        return;
      }
    }
    runSuggest(scopeId);
  };

  const linkAvailable = (normalizedText: string) =>
    !isLocation || unlinkedRowsOf(groupsByText.get(normalizedText)).length > 0;

  const nameAvailable = (key: string) => {
    if (!isLocation) return true;
    const cluster = suggest.data?.proposedNames.find(
      (entry) => proposedNameKey(entry) === key,
    );
    return !!cluster && clusterUnlinkedRows(cluster, groupsByText).length > 0;
  };

  const handleApply = () => {
    const result = suggest.data;
    if (!result) return;
    if (isLocation) {
      const nextTargets = buildSuggestionTargets(result, selected, groupsByText);
      setTargets(nextTargets);
      setPicks(initialSuggestionPicks(nextTargets));
      setStep('confirm');
      return;
    }
    const items: LinkItem[] = [];
    result.proposedLinks.forEach((link) => {
      const key = proposedLinkKey(link);
      if (!selected.has(key)) return;
      items.push({
        scopeId: link.scopeId,
        normalizedText: link.normalizedText,
        canonicalNameId: link.canonicalNameId ?? undefined,
        catalogKey: link.catalogKey ?? undefined,
      });
    });
    result.proposedNames.forEach((cluster) => {
      const key = proposedNameKey(cluster);
      if (!selected.has(key)) return;
      cluster.members.forEach((member) => {
        items.push({
          scopeId: cluster.scopeId,
          normalizedText: member.normalizedText,
          newName: cluster.name,
        });
      });
    });
    if (items.length === 0) return;
    onApply(items);
    setOpen(false);
  };

  const setPick = (
    targetKey: string,
    source: LocationSource,
    rowId: number | undefined,
  ) => {
    setPicks((prev) => {
      const chosen = { ...(prev[targetKey] ?? {}) };
      if (rowId === undefined) delete chosen[source];
      else chosen[source] = rowId;
      return { ...prev, [targetKey]: chosen };
    });
  };

  const confirmItems = suggestionLinkItems(targets, picks);

  const handleConfirm = () => {
    if (confirmItems.length === 0) return;
    onApply(confirmItems);
    setOpen(false);
  };

  const listReady = !isLocation || !groupsLoading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">اقتراح الربط</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>اقتراح الربط</DialogTitle>
        </DialogHeader>

        {step === 'pick-scope' && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-700">اختر المحافظة</p>
            <ScopeSelector
              value={pickedScopeId}
              onChange={(next) => {
                setPickedScopeId(next);
                runSuggest(next);
              }}
            />
          </div>
        )}

        {step === 'select' && (suggest.isPending || !listReady) && (
          <PageLoading size="sm" />
        )}

        {step === 'select' && suggest.data && listReady && (
          <div className="max-h-96 overflow-y-auto flex flex-col gap-4">
            {suggest.data.proposedLinks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  روابط مقترحة
                </p>
                <ul className="flex flex-col gap-2">
                  {suggest.data.proposedLinks.map((link) => {
                    const key = proposedLinkKey(link);
                    const available = linkAvailable(link.normalizedText);
                    return (
                      <li key={key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={available && selected.has(key)}
                          disabled={!available}
                          onCheckedChange={(checked) =>
                            toggle(key, checked === true)
                          }
                        />
                        <VisualizedSpelling text={link.normalizedText} />
                        <span className="text-gray-400">→</span>
                        <span>{link.name}</span>
                        <span className="text-gray-400 text-xs">
                          {Math.round(link.score * 100)}٪
                        </span>
                        {!available && (
                          <span className="text-gray-400 text-xs">
                            {UNAVAILABLE_LABEL}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {suggest.data.proposedNames.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  أسماء جديدة مقترحة
                </p>
                <ul className="flex flex-col gap-2">
                  {suggest.data.proposedNames.map((cluster) => {
                    const key = proposedNameKey(cluster);
                    const available = nameAvailable(key);
                    return (
                      <li key={key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={available && selected.has(key)}
                          disabled={!available}
                          onCheckedChange={(checked) =>
                            toggle(key, checked === true)
                          }
                        />
                        <span>{cluster.name}</span>
                        <span className="text-gray-400 text-xs">
                          ({cluster.members.length})
                        </span>
                        {!available && (
                          <span className="text-gray-400 text-xs">
                            {UNAVAILABLE_LABEL}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {suggest.data.proposedLinks.length === 0 &&
              suggest.data.proposedNames.length === 0 && (
                <p className="text-sm text-gray-500">لا توجد اقتراحات حاليا</p>
              )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="max-h-96 overflow-y-auto flex flex-col gap-4">
            {targets.length === 0 && (
              <p className="text-sm text-gray-500">{UNAVAILABLE_LABEL}</p>
            )}
            {targets.map((target) => (
              <div key={target.key} className="rounded-md border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-gray-900">
                    {target.name}
                  </span>
                  {target.target.newName !== undefined && (
                    <Badge variant="outline">اسم جديد</Badge>
                  )}
                </div>
                <ul className="flex flex-col gap-2">
                  {target.sources.map((candidates) => {
                    const chosen = picks[target.key]?.[candidates.source];
                    const providerLabel = locationSourceLabel(candidates.source);
                    if (candidates.rows.length === 1) {
                      const row = candidates.rows[0];
                      return (
                        <li
                          key={candidates.source}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={chosen === row.id}
                            onCheckedChange={(checked) =>
                              setPick(
                                target.key,
                                candidates.source,
                                checked === true ? row.id : undefined,
                              )
                            }
                          />
                          <span className="text-xs font-medium text-gray-500">
                            {providerLabel}
                          </span>
                          <VisualizedSpelling text={row.label} />
                        </li>
                      );
                    }
                    const groupName = `${target.key}:${candidates.source}`;
                    return (
                      <li key={candidates.source} className="flex flex-col gap-1 text-sm">
                        <span className="text-xs font-medium text-gray-500">
                          {providerLabel}: اختر صفا واحدا
                        </span>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={groupName}
                            checked={chosen === undefined}
                            onChange={() =>
                              setPick(target.key, candidates.source, undefined)
                            }
                          />
                          بدون
                        </label>
                        {candidates.rows.map((row) => (
                          <label key={row.id} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={groupName}
                              checked={chosen === row.id}
                              onChange={() =>
                                setPick(target.key, candidates.source, row.id)
                              }
                            />
                            <VisualizedSpelling text={row.label} />
                          </label>
                        ))}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          {step === 'confirm' ? (
            <>
              <Button variant="outline" onClick={() => setStep('select')}>
                رجوع
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={confirmItems.length === 0 || applying}
              >
                تأكيد الربط
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                إغلاق
              </Button>
              {step === 'select' && (
                <Button
                  onClick={handleApply}
                  disabled={selected.size === 0 || applying || !listReady}
                >
                  تطبيق المحدد
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
