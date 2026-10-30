import type { IntegrationProvider } from '@/app/dashboard/integrations/types/apiIntegration';
import type { StoreLinkMove } from '@/types/storeLinks';
import type { MergeVariantPlanEntry } from '../../types/products';

export const LINK_ISSUE_TYPE = {
  DUPLICATE_PRODUCTS: 'DUPLICATE_PRODUCTS',
  LOOK_ALIKE_VARIANTS: 'LOOK_ALIKE_VARIANTS',
  LINK_CONFLICT: 'LINK_CONFLICT',
  RETIRED_WITH_LINKS: 'RETIRED_WITH_LINKS',
} as const;

export type LinkIssueType = (typeof LINK_ISSUE_TYPE)[keyof typeof LINK_ISSUE_TYPE];

export const LINK_CONFLICT_RESOLUTION = {
  MOVE: 'MOVE',
  KEEP: 'KEEP',
} as const;

export type LinkConflictResolution =
  (typeof LINK_CONFLICT_RESOLUTION)[keyof typeof LINK_CONFLICT_RESOLUTION];

export type StoreLinkConflictStatus = 'OPEN' | 'MOVED' | 'KEPT';

export type StoreLinkConflictSource =
  | 'PRODUCT_SYNC'
  | 'ORDER_WEBHOOK'
  | 'MISSING_ORDER_RECOVERY'
  | 'MANUAL_LINK';

export const UNLINKED_SUGGESTION_KIND = {
  MATCHED: 'MATCHED',
  AMBIGUOUS: 'AMBIGUOUS',
  NONE: 'NONE',
} as const;

export type UnlinkedSuggestionKind =
  (typeof UNLINKED_SUGGESTION_KIND)[keyof typeof UNLINKED_SUGGESTION_KIND];

export type LinkKind = 'PRODUCT' | 'VARIANT';

export interface LinkIssuePage<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LinkIssuePageParams {
  page: number;
  limit: number;
}

export interface LinkIssueCounts {
  duplicateProducts: number;
  lookAlikeVariants: number;
  linkConflicts: number;
  retiredWithLinks: number;
  total: number;
}

export interface StoreLinkSummary {
  provider: IntegrationProvider;
  storeId: number | null;
  storeName: string | null;
  externalId: string;
  externalSku: string | null;
}

export interface LinkIssueProductRef {
  productId: number;
  name: string;
  sku: string | null;
}

export interface LinkIssueVariantRef {
  variantId: number;
  productId: number;
  productName: string;
  label: string;
  sku: string | null;
  stock: number;
  orderLineCount: number;
  storeLinks: StoreLinkSummary[];
}

export interface LinkIssueCountsSummary {
  stockUnits: number;
  orderLines: number;
  storeLinks: number;
}

export interface DuplicateProductIssue {
  issueKey: string;
  reason: 'NAME' | 'SKU';
  source: LinkIssueProductRef & { storeLinks: StoreLinkSummary[] };
  target: LinkIssueProductRef;
}

export interface DuplicateProductPreview {
  source: LinkIssueProductRef & { storeLinks: StoreLinkSummary[] };
  target: LinkIssueProductRef;
  variantPlan: MergeVariantPlanEntry[];
  counts: LinkIssueCountsSummary;
}

export interface DuplicateProductPreviewParams {
  sourceProductId: number;
  targetProductId: number;
}

export interface DuplicateProductMergeBody extends DuplicateProductPreviewParams {
  variantPlan: MergeVariantPlanEntry[];
  confirm: true;
}

export interface DuplicateProductMergeResult {
  jobId: string;
  sourceProductId: number;
  targetProductId: number;
}

export interface LookAlikeVariantIssue {
  issueKey: string;
  reason: 'SAME_LABEL' | 'REPAIR_MERGE';
  source: LinkIssueVariantRef;
  target: LinkIssueVariantRef;
}

export interface LookAlikeVariantPreviewParams {
  productId: number;
  sourceVariantId: number;
  targetVariantId: number;
}

export interface LookAlikeVariantPreview {
  source: LinkIssueVariantRef;
  target: LinkIssueVariantRef;
  counts: LinkIssueCountsSummary;
}

export interface LinkConflictIssue {
  id: number;
  provider: IntegrationProvider;
  storeId: number | null;
  storeName: string | null;
  externalId: string;
  externalSku: string | null;
  source: StoreLinkConflictSource;
  status: StoreLinkConflictStatus;
  occurrences: number;
  firstSeenAt: string;
  lastSeenAt: string;
  existing: LinkIssueVariantRef;
  attempted: LinkIssueVariantRef;
}

export interface LinkConflictPreview {
  conflict: LinkConflictIssue;
  linkIsCurrent: boolean;
  moveFrom: LinkIssueVariantRef;
  moveTo: LinkIssueVariantRef;
}

export interface RetiredLinkIssue {
  issueKey: string;
  variant: LinkIssueVariantRef;
  suggestedTarget: LinkIssueVariantRef | null;
}

export interface RetiredLinkPreviewParams {
  variantId: number;
  targetVariantId: number;
}

export interface RetiredLinkPreview {
  variant: LinkIssueVariantRef;
  target: LinkIssueVariantRef;
  linksMoving: number;
}

export interface UnlinkedSuggestion {
  kind: UnlinkedSuggestionKind;
  productId: number | null;
  variantId: number | null;
  candidateProductIds: number[];
}

export interface UnlinkedStoreItem {
  issueKey: string;
  configId: number;
  provider: IntegrationProvider;
  storeId: number;
  storeName: string | null;
  externalProductId: string;
  externalVariantId: string | null;
  productName: string;
  variantLabel: string | null;
  externalSku: string | null;
  suggestion: UnlinkedSuggestion;
}

export interface UnlinkedStoreItemsParams extends LinkIssuePageParams {
  configId: number;
}

export interface UnlinkedLinkEntry {
  externalProductId: string;
  externalVariantId: string | null;
  variantId: number | null;
  productId: number;
  confirmMove?: boolean;
}

export interface UnlinkedLinkBody {
  configId: number;
  links: UnlinkedLinkEntry[];
  dryRun?: boolean;
  confirm?: boolean;
}

export interface UnlinkedLinkCreate {
  linkKind: LinkKind;
  externalProductId: string;
  externalVariantId: string;
  productId: number;
  variantId: number | null;
  externalSku: string | null;
}

export interface UnlinkedLinkMove extends StoreLinkMove {
  externalProductId: string;
}

export interface UnlinkedLinkResult {
  dryRun: boolean;
  creates: UnlinkedLinkCreate[];
  moves: UnlinkedLinkMove[];
  created: number;
  moved: number;
}

export interface LinkIssueDismissBody {
  issueType: LinkIssueType;
  issueKey: string;
  confirm: true;
}

export interface LinkConflictResolveBody {
  action: LinkConflictResolution;
  confirm: true;
}

export interface LookAlikeVariantMergeBody extends LookAlikeVariantPreviewParams {
  confirm: true;
}

export interface RetiredLinkMoveBody extends RetiredLinkPreviewParams {
  confirm: true;
}
