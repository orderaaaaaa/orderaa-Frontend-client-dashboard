import type { PluralNoun } from '@/i18n/pluralAr';
import type { TranslationKey } from '@/i18n/translate';

export type QueueItemState = 'unlinked' | 'partial' | 'mixed' | 'linked' | 'implicit' | 'stale';

export interface QueueChip {
  id: string;
  label: string;
  stale: boolean;
}

export interface QueueItem {
  id: string;
  spelling: string;
  state: QueueItemState;
  counts: Record<string, number>;
  chips?: QueueChip[];
}

export type LinkTarget =
  | { kind: 'name'; canonicalNameId: number }
  | { kind: 'new'; newName: string }
  | { kind: 'catalog'; catalogKey: string; scopeId: number };

export interface ApplyResult {
  saved: number;
  total: number;
  failed: number;
  reason: string | null;
}

export type QueueTab = 'all' | 'unlinked' | 'partial' | 'mixed' | 'linked';

export type TabCounts<TTab extends string = QueueTab> = Partial<Record<TTab, number>>;

export type ReviewListStatus = 'loading' | 'ready' | 'refetching' | 'empty' | 'error';

export interface ComboOption {
  id: string;
  label: string;
  hint?: string;
  score?: number;
  target: LinkTarget;
}

export interface ComboGroup {
  id: 'suggested' | 'all';
  headingKey: 'canonical.combobox.groupSuggested' | 'canonical.combobox.groupAll';
  options: ComboOption[];
  status: 'loading' | 'ready' | 'error';
  onRetry?: () => void;
}

export type EntityAction =
  | 'create'
  | 'rename'
  | 'delete'
  | 'linkRow'
  | 'linkGroup'
  | 'bulkLink'
  | 'suggest'
  | 'refresh'
  | 'viewProducts'
  | 'unlinkChild';

export interface EntityManagerConfig<TDomain extends string> {
  domain: TDomain;
  route: string;
  labels: {
    title: TranslationKey;
    spellingNoun: PluralNoun;
    nameNoun: PluralNoun;
    countNouns: {
      rows: PluralNoun;
      products: PluralNoun;
      orders: PluralNoun;
      aliases: PluralNoun;
    };
  };
  hasScope: boolean;
  isLocation: boolean;
  columns: readonly string[];
  actions: Record<EntityAction, boolean>;
  deleteGuard: 'none' | 'linkedRows';
  showCreate: boolean;
  showTabCounts: boolean;
  permissions: {
    read: string;
    manage: string;
  };
  warnMultiContext: boolean;
}
