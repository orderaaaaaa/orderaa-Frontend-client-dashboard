export const CANONICAL_NAME_DOMAINS = {
  ATTRIBUTE_NAME: 'ATTRIBUTE_NAME',
  ATTRIBUTE_OPTION: 'ATTRIBUTE_OPTION',
  GOVERNORATE: 'GOVERNORATE',
  CITY: 'CITY',
} as const;

export type CanonicalNameDomain =
  (typeof CANONICAL_NAME_DOMAINS)[keyof typeof CANONICAL_NAME_DOMAINS];

export const GROUP_STATES = {
  UNLINKED: 'UNLINKED',
  LINKED: 'LINKED',
  PARTIAL: 'PARTIAL',
  MIXED: 'MIXED',
} as const;

export type GroupState = (typeof GROUP_STATES)[keyof typeof GROUP_STATES];

export const GROUP_STATE_FILTERS = [
  'all',
  'unlinked',
  'linked',
  'partial',
  'mixed',
] as const;

export type GroupStateFilter = (typeof GROUP_STATE_FILTERS)[number];

export const CANONICAL_DOMAIN_ROUTES: Record<
  CanonicalNameDomain,
  { segment: string; title: string }
> = {
  ATTRIBUTE_NAME: { segment: 'attribute-names', title: 'أسماء الخصائص' },
  ATTRIBUTE_OPTION: { segment: 'attribute-options', title: 'قيم الخصائص' },
  GOVERNORATE: { segment: 'governorates', title: 'المحافظات' },
  CITY: { segment: 'cities', title: 'المدن' },
};

export const CANONICAL_NAME_ERROR_CODES = {
  GOVERNORATE_IS_CLOSED: 'GOVERNORATE_IS_CLOSED',
  SYSTEM_CANONICAL: 'SYSTEM_CANONICAL',
  PARENT_REQUIRED: 'PARENT_REQUIRED',
  PARENT_DOMAIN_MISMATCH: 'PARENT_DOMAIN_MISMATCH',
  PARENT_NOT_ALLOWED: 'PARENT_NOT_ALLOWED',
  SCOPE_REQUIRED: 'SCOPE_REQUIRED',
  SCOPE_NOT_APPLICABLE: 'SCOPE_NOT_APPLICABLE',
  DOMAIN_NOT_APPLICABLE: 'DOMAIN_NOT_APPLICABLE',
  CANONICAL_NAME_EXISTS: 'CANONICAL_NAME_EXISTS',
  SPELLING_IS_CANONICAL_NAME: 'SPELLING_IS_CANONICAL_NAME',
  CANONICAL_NAME_NOT_FOUND: 'CANONICAL_NAME_NOT_FOUND',
  NORMALIZED_TEXT_REQUIRED: 'NORMALIZED_TEXT_REQUIRED',
  CANONICAL_SCOPE_MISMATCH: 'CANONICAL_SCOPE_MISMATCH',
  UNSCOPED_GROUP: 'UNSCOPED_GROUP',
} as const;

export type CanonicalNameErrorCode =
  (typeof CANONICAL_NAME_ERROR_CODES)[keyof typeof CANONICAL_NAME_ERROR_CODES];

export interface CanonicalName {
  id: number;
  name: string;
  isSystem: boolean;
  catalogKey: string | null;
  parentId: number | null;
  scopeId: number;
  aliasCount: number;
  rowCount: number;
  productCount: number;
  orderCount: number;
}

export interface CreateCanonicalNameInput {
  name: string;
  parentId?: number;
  catalogKey?: string;
}

export interface ListNamesParams {
  scopeId?: number;
  search?: string;
}

export interface GroupSpelling {
  text: string;
  count: number;
}

export interface GroupAttributeContext {
  name: string;
  rowCount: number;
}

export interface GroupImplicitName {
  id: number | null;
  catalogKey: string | null;
  name: string;
}

export interface SourceGroup {
  scopeId: number;
  normalizedText: string;
  spellings: GroupSpelling[];
  rowCount: number;
  productCount: number;
  orderCount: number;
  state: GroupState;
  linkedName: { id: number; name: string } | null;
  implicitName: GroupImplicitName | null;
  attributeContexts: GroupAttributeContext[];
}

export interface UnscopedCityBucket {
  parentText: string;
  normalizedText: string;
  rowCount: number;
}

export interface ListGroupsParams {
  scopeId?: number;
  state?: GroupStateFilter;
  search?: string;
  page: number;
  limit: number;
}

export interface SourceGroupPage {
  data: SourceGroup[];
  page: number;
  limit: number;
  total: number;
  unscoped: UnscopedCityBucket[];
}

export interface GroupMemberRow {
  id: number;
  storedName: string;
  canonicalNameId: number | null;
  attributeName: string | null;
}

export interface GroupMemberProduct {
  productId: number;
  productName: string;
  rows: GroupMemberRow[];
}

export interface ListGroupMembersParams {
  scopeId: number;
  normalizedText: string;
  page: number;
  limit: number;
}

export interface GroupMembersPage {
  data: GroupMemberProduct[];
  page: number;
  limit: number;
  total: number;
}

export interface ListCandidatesParams {
  scopeId: number;
  normalizedText: string;
}

export interface LinkCandidate {
  canonicalNameId: number | null;
  catalogKey: string | null;
  name: string;
  score: number;
}

export interface SuggestionProposedLink {
  scopeId: number;
  normalizedText: string;
  canonicalNameId: number | null;
  catalogKey: string | null;
  name: string;
  score: number;
}

export interface SuggestionProposedNameMember {
  normalizedText: string;
  score: number;
}

export interface SuggestionProposedName {
  scopeId: number;
  name: string;
  members: SuggestionProposedNameMember[];
}

export interface SuggestRequest {
  scopeId?: number;
}

export interface SuggestionResult {
  proposedLinks: SuggestionProposedLink[];
  proposedNames: SuggestionProposedName[];
  ambiguous: number;
  unmatched: number;
  truncated: boolean;
}

export interface NameImpactAlias {
  sourceText: string;
  normalizedText: string;
}

export interface NameImpactChild {
  id: number;
  name: string;
  orderCount: number;
}

export interface NameImpactProductRow {
  id: number;
  storedName: string;
  attributeName: string | null;
}

export interface NameImpactProduct {
  productId: number;
  productName: string;
  rows: NameImpactProductRow[];
}

export interface NameImpactProductsPage {
  data: NameImpactProduct[];
  page: number;
  limit: number;
  total: number;
}

export interface NameImpact {
  rowCount: number;
  productCount: number;
  orderCount: number;
  aliases: NameImpactAlias[];
  children: NameImpactChild[];
  products: NameImpactProductsPage;
}

export interface NameImpactSummary {
  rowCount: number;
  productCount: number;
  orderCount: number;
}

export interface RenameNameResult {
  name: string;
  impact: NameImpactSummary;
}

export interface DeleteNameResult {
  impact: NameImpactSummary;
}

export interface LinkItem {
  scopeId: number;
  normalizedText: string;
  canonicalNameId?: number;
  catalogKey?: string;
  newName?: string;
  unlink?: boolean;
}

export interface ApplyLinksRequest {
  items: LinkItem[];
}

export interface LinkResult {
  scopeId: number;
  normalizedText: string;
  canonicalNameId: number | null;
  rowsLinked: number;
  rowsUnlinked: number;
}

export interface ApplyLinksResponse {
  data: LinkResult[];
}
