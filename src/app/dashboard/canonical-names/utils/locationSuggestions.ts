import {
  LOCATION_SOURCES,
  type LinkItem,
  type LocationSource,
  type SourceGroup,
  type SourceRow,
  type SuggestionProposedLink,
  type SuggestionProposedName,
  type SuggestionResult,
} from '@/types/canonicalNames';

export type LinkTarget = Pick<LinkItem, 'canonicalNameId' | 'catalogKey' | 'newName'>;

export interface SourceCandidates {
  source: LocationSource;
  rows: SourceRow[];
}

export interface SuggestionTarget {
  key: string;
  name: string;
  scopeId: number;
  target: LinkTarget;
  sources: SourceCandidates[];
}

export type SuggestionPicks = Record<string, Partial<Record<LocationSource, number>>>;

const SOURCE_ORDER = Object.values(LOCATION_SOURCES);

export const proposedLinkKey = (link: SuggestionProposedLink) =>
  `link:${link.scopeId}:${link.normalizedText}`;

export const proposedNameKey = (cluster: SuggestionProposedName) =>
  `name:${cluster.scopeId}:${cluster.name}`;

export const unlinkedRowsOf = (group: SourceGroup | undefined) =>
  group ? group.sourceRows.filter((row) => row.canonicalNameId === null) : [];

export const clusterUnlinkedRows = (
  cluster: SuggestionProposedName,
  groupsByText: ReadonlyMap<string, SourceGroup>,
) =>
  cluster.members.flatMap((member) =>
    unlinkedRowsOf(groupsByText.get(member.normalizedText)),
  );

const linkTargetOf = (
  link: SuggestionProposedLink,
): { key: string; target: LinkTarget } => {
  if (link.canonicalNameId !== null) {
    return {
      key: `id:${link.canonicalNameId}`,
      target: { canonicalNameId: link.canonicalNameId },
    };
  }
  if (link.catalogKey !== null) {
    return { key: `catalog:${link.catalogKey}`, target: { catalogKey: link.catalogKey } };
  }
  return { key: `new:${link.name}`, target: { newName: link.name } };
};

export function buildSuggestionTargets(
  result: SuggestionResult,
  selected: ReadonlySet<string>,
  groupsByText: ReadonlyMap<string, SourceGroup>,
): SuggestionTarget[] {
  const targets = new Map<
    string,
    { name: string; scopeId: number; target: LinkTarget; rows: SourceRow[] }
  >();
  const taken = new Set<number>();

  const addRows = (
    key: string,
    base: { name: string; scopeId: number; target: LinkTarget },
    rows: SourceRow[],
  ) => {
    const entry = targets.get(key) ?? { ...base, rows: [] };
    rows.forEach((row) => {
      if (taken.has(row.id)) return;
      taken.add(row.id);
      entry.rows.push(row);
    });
    targets.set(key, entry);
  };

  result.proposedLinks.forEach((link) => {
    if (!selected.has(proposedLinkKey(link))) return;
    const { key, target } = linkTargetOf(link);
    addRows(
      key,
      { name: link.name, scopeId: link.scopeId, target },
      unlinkedRowsOf(groupsByText.get(link.normalizedText)),
    );
  });

  result.proposedNames.forEach((cluster) => {
    if (!selected.has(proposedNameKey(cluster))) return;
    addRows(
      `new:${cluster.name}`,
      { name: cluster.name, scopeId: cluster.scopeId, target: { newName: cluster.name } },
      clusterUnlinkedRows(cluster, groupsByText),
    );
  });

  return [...targets.entries()]
    .map(([key, entry]) => ({
      key,
      name: entry.name,
      scopeId: entry.scopeId,
      target: entry.target,
      sources: SOURCE_ORDER.map((source) => ({
        source,
        rows: entry.rows.filter((row) => row.source === source),
      })).filter((candidates) => candidates.rows.length > 0),
    }))
    .filter((target) => target.sources.length > 0);
}

export function initialSuggestionPicks(targets: SuggestionTarget[]): SuggestionPicks {
  const picks: SuggestionPicks = {};
  targets.forEach((target) => {
    const chosen: Partial<Record<LocationSource, number>> = {};
    target.sources.forEach((candidates) => {
      if (candidates.rows.length === 1) chosen[candidates.source] = candidates.rows[0].id;
    });
    picks[target.key] = chosen;
  });
  return picks;
}

export function suggestionLinkItems(
  targets: SuggestionTarget[],
  picks: SuggestionPicks,
): LinkItem[] {
  return targets.flatMap((target) => {
    const chosen = picks[target.key] ?? {};
    const rowIds = target.sources
      .map((candidates) => chosen[candidates.source])
      .filter((id): id is number => id !== undefined);
    if (rowIds.length === 0) return [];
    return [{ scopeId: target.scopeId, rowIds, ...target.target }];
  });
}
