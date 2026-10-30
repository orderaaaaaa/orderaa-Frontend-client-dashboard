'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ErrorWithRetry,
  PartialSuccessNotice,
} from '@/components/entity-manager/StateViews';
import { VisualizedSpelling } from '@/components/entity-manager/VisualizedSpelling';
import { runChunks } from '@/components/entity-manager/runChunks';
import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import type { TranslationKey } from '@/i18n/translate';
import {
  invalidateDomainQueries,
  isLocationDomain,
  useApplyLinks,
  useLinkSuggestionsMutation,
} from '@/services/canonicalNames';
import { useSuggestionGroups } from '@/services/canonicalSuggestionGroups';
import {
  CANONICAL_NAME_DOMAINS,
  type CanonicalNameDomain,
  type LinkItem,
  type LocationSource,
} from '@/types/canonicalNames';
import { getApiErrorMessage } from '@/utils/apiError';
import { locationLinkErrorMessage } from '../utils/linkFeedback';
import { locationSourceLabel } from '../utils/locationSourceLabel';
import { proposedLinkKey, proposedNameKey } from '../utils/locationSuggestions';
import {
  buildSendPlan,
  confidentLinkKeys,
  linkChoice,
  locationTargetsOf,
  nameChoice,
  resolvePicks,
  type ReviewChoice,
  type SuggestionScope,
  type UserPicks,
} from '../utils/suggestionReviewPlan';
import { useQueueUrlState } from '../utils/queueUrlState';
import ScopeSelector from './ScopeSelector';

const APPLY_CHUNK_SIZE = 500;

interface PartialState {
  saved: number;
  total: number;
  failed: number;
  reason: string;
  remaining: LinkItem[];
  suggestionCount: number;
}

const choiceNoteKey = (choice: ReviewChoice): TranslationKey | null => {
  if (choice === 'ok') return null;
  if (choice === 'alreadyLinked') return 'canonical.suggest.alreadyLinked';
  if (choice === 'catalogOnly') return 'canonical.suggest.notLinkable';
  return 'canonical.suggest.groupsUnavailable';
};

interface SuggestionReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: CanonicalNameDomain;
  initialScopeId?: number;
  onlyNormalizedTexts?: string[];
}

export function SuggestionReview({
  open,
  onOpenChange,
  domain,
  initialScopeId,
  onlyNormalizedTexts,
}: SuggestionReviewProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const suggest = useLinkSuggestionsMutation(domain);
  const { mutate: runSuggest, reset: resetSuggest } = suggest;
  const { mutateAsync: applyLinks } = useApplyLinks(domain);
  const queue = useQueueUrlState();

  const isLocation = isLocationDomain(domain);
  const isCity = domain === CANONICAL_NAME_DOMAINS.CITY;

  const [scopeId, setScopeId] = useState<number | undefined>(initialScopeId);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [userPicks, setUserPicks] = useState<UserPicks>({});
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [partial, setPartial] = useState<PartialState | null>(null);

  const groups = useSuggestionGroups(
    domain,
    isCity ? (scopeId ?? 0) : 0,
    open && isLocation && (!isCity || scopeId !== undefined),
  );

  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
    setUserPicks({});
    setExpanded(new Set());
    setPartial(null);
    if (isCity && scopeId === undefined) {
      resetSuggest();
      return;
    }
    runSuggest({ scopeId: isCity ? scopeId : 0 });
  }, [open, isCity, scopeId, runSuggest, resetSuggest]);

  const scope: SuggestionScope = useMemo(
    () => ({ isLocation, isCity, groupsByText: groups.groupsByText }),
    [isLocation, isCity, groups.groupsByText],
  );

  const result = useMemo(() => {
    const data = suggest.data;
    if (!data || !onlyNormalizedTexts) return data;
    const only = new Set(onlyNormalizedTexts);
    return {
      ...data,
      proposedLinks: data.proposedLinks.filter((link) => only.has(link.normalizedText)),
      proposedNames: data.proposedNames.flatMap((cluster) => {
        const members = cluster.members.filter((member) => only.has(member.normalizedText));
        return members.length > 0 ? [{ ...cluster, members }] : [];
      }),
      ambiguous: 0,
      unmatched: 0,
    };
  }, [suggest.data, onlyNormalizedTexts]);
  const listReady = !!result && (!isLocation || (!groups.loading && !groups.error));

  const plan = useMemo(
    () =>
      result
        ? buildSendPlan(result, scope, selected, userPicks)
        : { items: [] as LinkItem[], links: 0, names: 0 },
    [result, scope, selected, userPicks],
  );

  const confidentKeys = useMemo(
    () => (result ? confidentLinkKeys(result, scope) : []),
    [result, scope],
  );

  const locationTargets = useMemo(() => {
    if (!result || !isLocation) return { targets: [], picks: {} };
    const targets = locationTargetsOf(result, scope, selected);
    return { targets, picks: resolvePicks(targets, userPicks) };
  }, [result, scope, selected, userPicks, isLocation]);

  const toggle = (key: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const setPick = (targetKey: string, source: LocationSource, rowId: number | null) => {
    setUserPicks((prev) => ({
      ...prev,
      [targetKey]: { ...prev[targetKey], [source]: rowId },
    }));
  };

  const acceptConfident = () => {
    setSelected((prev) => new Set([...prev, ...confidentKeys]));
  };

  const reasonOf = (error: unknown) =>
    isLocation
      ? locationLinkErrorMessage(error)
      : getApiErrorMessage(error, t('canonical.suggest.error'));

  const applyItems = async (items: LinkItem[], suggestionCount: number) => {
    setApplying(true);
    setPartial(null);
    setProgress({ done: 0, total: items.length });
    const run = await runChunks(
      items,
      async (chunk) => (await applyLinks({ items: chunk })).data,
      APPLY_CHUNK_SIZE,
      (done, total) => setProgress({ done, total }),
    );
    setApplying(false);
    setProgress(null);
    if (run.saved > 0) await invalidateDomainQueries(queryClient, domain);
    if (run.error === null) {
      toast.success(t('canonical.suggest.applied', { count: suggestionCount }));
      onOpenChange(false);
      return;
    }
    setPartial({
      saved: run.saved,
      total: run.total,
      failed: run.failed,
      reason: reasonOf(run.error),
      remaining: items.slice(run.saved),
      suggestionCount,
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (applying) return;
    onOpenChange(next);
  };

  const requestSuggest = () => runSuggest({ scopeId: isCity ? scopeId : 0 });

  const renderBody = () => {
    if (isCity && scopeId === undefined) {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-foreground">{t('canonical.suggest.pickScope')}</p>
          <ScopeSelector value={scopeId} onChange={setScopeId} />
        </div>
      );
    }
    if (suggest.isPending || groups.loading) {
      return (
        <p role="status" className="text-sm text-muted-foreground">
          {t('canonical.suggest.loading')}
        </p>
      );
    }
    if (suggest.isError) {
      return <ErrorWithRetry message={t('canonical.suggest.error')} onRetry={requestSuggest} />;
    }
    if (isLocation && groups.error) {
      return (
        <ErrorWithRetry message={t('canonical.suggest.groupsUnavailable')} onRetry={groups.refetch} />
      );
    }
    if (!result) return null;

    const nothingProposed = result.proposedLinks.length === 0 && result.proposedNames.length === 0;
    const ambiguousAndUnmatched = result.ambiguous + result.unmatched;

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 text-sm text-foreground">
          <p>
            {t('canonical.suggest.clear', {
              count: result.proposedLinks.length,
              suggestionNoun: pluralAr(t, 'suggestion', result.proposedLinks.length),
            })}
          </p>
          <p>
            {t('canonical.suggest.ambiguous', {
              count: result.ambiguous,
              spellingNoun: pluralAr(t, 'spelling', result.ambiguous),
            })}
          </p>
          <p>
            {t('canonical.suggest.unmatched', {
              count: result.unmatched,
              spellingNoun: pluralAr(t, 'spelling', result.unmatched),
            })}
          </p>
          {result.truncated && (
            <p className="text-muted-foreground">{t('canonical.suggest.truncated')}</p>
          )}
          {groups.truncated && (
            <p className="text-muted-foreground">{t('canonical.suggest.groupsTruncated')}</p>
          )}
          {ambiguousAndUnmatched > 0 && (
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  queue.update({ state: 'unlinked' });
                  onOpenChange(false);
                }}
              >
                {t('canonical.suggest.openQueue')}
              </Button>
            </div>
          )}
          {nothingProposed && (
            <p className="text-muted-foreground">{t('canonical.suggest.none')}</p>
          )}
        </div>

        {result.proposedLinks.length > 0 && (
          <ul role="list" className="flex flex-col">
            {result.proposedLinks.map((link) => {
              const key = proposedLinkKey(link);
              const choice = linkChoice(link, scope);
              const enabled = choice === 'ok';
              const note = choiceNoteKey(choice);
              return (
                <li
                  key={key}
                  className="flex flex-wrap items-center gap-2 border-b py-1 text-sm last:border-b-0"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center">
                    <Checkbox
                      checked={enabled && selected.has(key)}
                      disabled={!enabled}
                      onCheckedChange={(checked) => toggle(key, checked === true)}
                      aria-label={`${link.normalizedText} ${link.name}`}
                    />
                  </span>
                  <VisualizedSpelling text={link.normalizedText} />
                  <ArrowLeft aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium text-foreground">{link.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('canonical.suggest.score', { score: Math.round(link.score * 100) })}
                  </span>
                  {note && <span className="text-xs text-muted-foreground">{t(note)}</span>}
                </li>
              );
            })}
          </ul>
        )}

        {result.proposedNames.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">{t('canonical.suggest.newNames')}</h3>
            <ul role="list" className="flex flex-col">
              {result.proposedNames.map((cluster) => {
                const key = proposedNameKey(cluster);
                const choice = nameChoice(cluster, scope);
                const enabled = choice === 'ok';
                const note = choiceNoteKey(choice);
                const isOpen = expanded.has(key);
                const count = cluster.members.length;
                return (
                  <li key={key} className="flex flex-col gap-1 border-b py-1 text-sm last:border-b-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex size-11 shrink-0 items-center justify-center">
                        <Checkbox
                          checked={enabled && selected.has(key)}
                          disabled={!enabled}
                          onCheckedChange={(checked) => toggle(key, checked === true)}
                          aria-label={cluster.name}
                        />
                      </span>
                      <span className="font-medium text-foreground">{cluster.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-expanded={isOpen}
                        onClick={() => toggleExpanded(key)}
                      >
                        {t('canonical.suggest.newNameMembers', {
                          count,
                          spellingNoun: pluralAr(t, 'spelling', count),
                        })}
                        {isOpen ? (
                          <ChevronUp aria-hidden="true" className="size-4" />
                        ) : (
                          <ChevronDown aria-hidden="true" className="size-4" />
                        )}
                      </Button>
                      {note && <span className="text-xs text-muted-foreground">{t(note)}</span>}
                    </div>
                    {isOpen && (
                      <ul role="list" className="flex flex-col gap-1 ps-11">
                        {cluster.members.map((member) => (
                          <li key={member.normalizedText}>
                            <VisualizedSpelling text={member.normalizedText} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {isLocation && locationTargets.targets.length > 0 && (
          <section className="flex flex-col gap-3">
            {locationTargets.targets.map((target) => (
              <div key={target.key} className="flex flex-col gap-2 rounded-md border p-3">
                <span className="text-sm font-medium text-foreground">{target.name}</span>
                {target.sources.map((candidates) => {
                  const chosen = locationTargets.picks[target.key]?.[candidates.source];
                  const groupName = `${target.key}:${candidates.source}`;
                  return (
                    <fieldset key={candidates.source} className="flex flex-col gap-1">
                      <legend className="text-xs font-medium text-muted-foreground">
                        {t('canonical.suggest.pickRow', {
                          carrier: locationSourceLabel(candidates.source),
                        })}
                      </legend>
                      <label className="flex min-h-11 items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={groupName}
                          checked={chosen === undefined}
                          onChange={() => setPick(target.key, candidates.source, null)}
                        />
                        <span>{t('canonical.suggest.clearPick')}</span>
                      </label>
                      {candidates.rows.map((row) => (
                        <label key={row.id} className="flex min-h-11 items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={groupName}
                            checked={chosen === row.id}
                            onChange={() => setPick(target.key, candidates.source, row.id)}
                          />
                          <VisualizedSpelling text={row.label} />
                        </label>
                      ))}
                    </fieldset>
                  );
                })}
              </div>
            ))}
          </section>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('canonical.suggest.title')}</DialogTitle>
          <DialogDescription>{t('canonical.suggest.intro')}</DialogDescription>
        </DialogHeader>

        {applying && progress && (
          <p role="status" className="text-sm text-muted-foreground">
            {t('canonical.suggest.applyProgress', progress)}
          </p>
        )}
        {partial && (
          <PartialSuccessNotice
            saved={partial.saved}
            total={partial.total}
            failed={partial.failed}
            reason={partial.reason}
            onRetry={() => void applyItems(partial.remaining, partial.suggestionCount)}
          />
        )}

        {renderBody()}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          {!isLocation && (
            <p className="text-xs text-muted-foreground">{t('canonical.link.noUndo')}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={applying}
            >
              {t('canonical.action.cancel')}
            </Button>
            {listReady && (
              <Button
                variant="outline"
                onClick={acceptConfident}
                disabled={applying || confidentKeys.length === 0}
              >
                {t('canonical.action.acceptConfident', { count: confidentKeys.length })}
              </Button>
            )}
            {listReady && (
              <Button
                onClick={() => void applyItems(plan.items, plan.links + plan.names)}
                disabled={applying || partial !== null || plan.items.length === 0}
              >
                {t('canonical.suggest.confirmCount', { links: plan.links, names: plan.names })}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
