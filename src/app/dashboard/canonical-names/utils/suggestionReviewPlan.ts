import type {
  LinkItem,
  LocationSource,
  SourceGroup,
  SuggestionProposedLink,
  SuggestionProposedName,
  SuggestionResult,
} from '@/types/canonicalNames';
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
} from './locationSuggestions';

export type ReviewChoice = 'ok' | 'catalogOnly' | 'alreadyLinked' | 'unavailable';

export type UserPicks = Record<string, Partial<Record<LocationSource, number | null>>>;

export interface SuggestionScope {
  isLocation: boolean;
  isCity: boolean;
  groupsByText: ReadonlyMap<string, SourceGroup>;
}

export const linkChoice = (link: SuggestionProposedLink, scope: SuggestionScope): ReviewChoice => {
  if (scope.isLocation) {
    const group = scope.groupsByText.get(link.normalizedText);
    if (!group) return 'unavailable';
    if (unlinkedRowsOf(group).length === 0) return 'alreadyLinked';
  }
  if (link.canonicalNameId === null && !(scope.isCity && link.catalogKey !== null)) {
    return 'catalogOnly';
  }
  return 'ok';
};

export const nameChoice = (cluster: SuggestionProposedName, scope: SuggestionScope): ReviewChoice => {
  if (!scope.isLocation) return 'ok';
  const known = cluster.members.some((member) => scope.groupsByText.has(member.normalizedText));
  if (!known) return 'unavailable';
  if (clusterUnlinkedRows(cluster, scope.groupsByText).length === 0) return 'alreadyLinked';
  return 'ok';
};

export const confidentLinkKeys = (result: SuggestionResult, scope: SuggestionScope): string[] =>
  result.proposedLinks
    .filter((link) => linkChoice(link, scope) === 'ok')
    .map((link) => proposedLinkKey(link));

export const resolvePicks = (targets: SuggestionTarget[], user: UserPicks): SuggestionPicks => {
  const initial = initialSuggestionPicks(targets);
  const resolved: SuggestionPicks = {};
  targets.forEach((target) => {
    const chosen: Partial<Record<LocationSource, number>> = { ...initial[target.key] };
    const overrides = user[target.key] ?? {};
    target.sources.forEach(({ source }) => {
      const override = overrides[source];
      if (override === undefined) return;
      if (override === null) delete chosen[source];
      else chosen[source] = override;
    });
    resolved[target.key] = chosen;
  });
  return resolved;
};

export interface SendPlan {
  items: LinkItem[];
  links: number;
  names: number;
}

export const locationTargetsOf = (
  result: SuggestionResult,
  scope: SuggestionScope,
  selected: ReadonlySet<string>,
): SuggestionTarget[] => {
  const eligible: SuggestionResult = {
    ...result,
    proposedLinks: result.proposedLinks.filter((link) => linkChoice(link, scope) === 'ok'),
    proposedNames: result.proposedNames.filter((cluster) => nameChoice(cluster, scope) === 'ok'),
  };
  return buildSuggestionTargets(eligible, selected, scope.groupsByText);
};

export const buildSendPlan = (
  result: SuggestionResult,
  scope: SuggestionScope,
  selected: ReadonlySet<string>,
  picks: UserPicks,
): SendPlan => {
  if (scope.isLocation) {
    const targets = locationTargetsOf(result, scope, selected);
    const items = suggestionLinkItems(targets, resolvePicks(targets, picks));
    const names = items.filter((item) => item.newName !== undefined).length;
    return { items, links: items.length - names, names };
  }

  const items: LinkItem[] = [];
  let links = 0;
  let names = 0;

  result.proposedLinks.forEach((link) => {
    if (!selected.has(proposedLinkKey(link))) return;
    if (linkChoice(link, scope) !== 'ok') return;
    links += 1;
    items.push({
      scopeId: link.scopeId,
      normalizedText: link.normalizedText,
      canonicalNameId: link.canonicalNameId ?? undefined,
      catalogKey: link.canonicalNameId === null ? (link.catalogKey ?? undefined) : undefined,
    });
  });

  result.proposedNames.forEach((cluster) => {
    if (!selected.has(proposedNameKey(cluster))) return;
    if (nameChoice(cluster, scope) !== 'ok') return;
    names += 1;
    cluster.members.forEach((member) => {
      items.push({
        scopeId: cluster.scopeId,
        normalizedText: member.normalizedText,
        newName: cluster.name,
      });
    });
  });

  return { items, links, names };
};
