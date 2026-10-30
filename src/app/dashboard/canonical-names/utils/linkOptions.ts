import type { ComboGroup, ComboOption, LinkTarget } from '@/components/entity-manager/types';
import type { TranslationKey, TranslationParams } from '@/i18n/translate';
import type { CanonicalName, LinkCandidate, LinkItem } from '@/types/canonicalNames';
import { nameCountText } from './nameCountText';

type Translate = (key: TranslationKey, params?: TranslationParams) => string;

export const linkFieldsOf = (
  target: LinkTarget,
): Pick<LinkItem, 'canonicalNameId' | 'catalogKey' | 'newName'> => {
  if (target.kind === 'name') return { canonicalNameId: target.canonicalNameId };
  if (target.kind === 'new') return { newName: target.newName };
  return { catalogKey: target.catalogKey };
};

export function namesGroup(
  t: Translate,
  isLocation: boolean,
  names: CanonicalName[] | undefined,
  state: { isError: boolean; refetch: () => unknown },
): ComboGroup {
  const status: ComboGroup['status'] = state.isError
    ? 'error'
    : names === undefined
      ? 'loading'
      : 'ready';
  return {
    id: 'all',
    headingKey: 'canonical.combobox.groupAll',
    options: (names ?? []).map(
      (name): ComboOption => ({
        id: String(name.id),
        label: name.name,
        hint: nameCountText(t, isLocation, name),
        target: { kind: 'name', canonicalNameId: name.id },
      }),
    ),
    status,
    onRetry: () => void state.refetch(),
  };
}

export function suggestedGroup(
  t: Translate,
  enabled: boolean,
  isCity: boolean,
  scopeId: number,
  candidates: { data: LinkCandidate[] | undefined; isError: boolean; refetch: () => unknown },
): ComboGroup | null {
  if (!enabled) return null;
  const onRetry = () => void candidates.refetch();
  if (candidates.isError) {
    return {
      id: 'suggested',
      headingKey: 'canonical.combobox.groupSuggested',
      options: [],
      status: 'error',
      onRetry,
    };
  }
  if (candidates.data === undefined) {
    return {
      id: 'suggested',
      headingKey: 'canonical.combobox.groupSuggested',
      options: [],
      status: 'loading',
      onRetry,
    };
  }
  const options = candidates.data.slice(0, 3).flatMap((candidate): ComboOption[] => {
    const hint = t('canonical.suggest.score', { score: Math.round(candidate.score * 100) });
    if (candidate.canonicalNameId !== null) {
      return [
        {
          id: `id:${candidate.canonicalNameId}`,
          label: candidate.name,
          hint,
          score: candidate.score,
          target: { kind: 'name', canonicalNameId: candidate.canonicalNameId },
        },
      ];
    }
    if (isCity && candidate.catalogKey !== null) {
      return [
        {
          id: `catalog:${candidate.catalogKey}`,
          label: candidate.name,
          hint,
          score: candidate.score,
          target: { kind: 'catalog', catalogKey: candidate.catalogKey, scopeId },
        },
      ];
    }
    return [];
  });
  if (options.length === 0) return null;
  return {
    id: 'suggested',
    headingKey: 'canonical.combobox.groupSuggested',
    options,
    status: 'ready',
  };
}
