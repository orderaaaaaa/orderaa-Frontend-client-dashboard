import http from '@/lib/api/http';
import type {
  DuplicateProductIssue,
  DuplicateProductMergeBody,
  DuplicateProductMergeResult,
  DuplicateProductPreview,
  DuplicateProductPreviewParams,
  LinkConflictIssue,
  LinkConflictPreview,
  LinkConflictResolveBody,
  LinkIssueCounts,
  LinkIssueDismissBody,
  LinkIssuePage,
  LinkIssuePageParams,
  LookAlikeVariantIssue,
  LookAlikeVariantMergeBody,
  LookAlikeVariantPreview,
  LookAlikeVariantPreviewParams,
  RetiredLinkIssue,
  RetiredLinkMoveBody,
  RetiredLinkPreview,
  RetiredLinkPreviewParams,
  UnlinkedLinkBody,
  UnlinkedLinkResult,
  UnlinkedStoreItem,
  UnlinkedStoreItemsParams,
} from '../types/linkIssues';

const BASE = '/products/link-issues';

export const linkIssuesApi = {
  getCounts: async (): Promise<LinkIssueCounts> => {
    const response = await http.get<LinkIssueCounts>(`${BASE}/counts`);
    return response.data;
  },

  listDuplicateProducts: async (
    params: LinkIssuePageParams,
  ): Promise<LinkIssuePage<DuplicateProductIssue>> => {
    const response = await http.get<LinkIssuePage<DuplicateProductIssue>>(
      `${BASE}/duplicate-products`,
      { params },
    );
    return response.data;
  },

  previewDuplicateProduct: async (
    params: DuplicateProductPreviewParams,
  ): Promise<DuplicateProductPreview> => {
    const response = await http.get<DuplicateProductPreview>(
      `${BASE}/duplicate-products/preview`,
      { params },
    );
    return response.data;
  },

  mergeDuplicateProduct: async (
    body: DuplicateProductMergeBody,
  ): Promise<DuplicateProductMergeResult> => {
    const response = await http.post<DuplicateProductMergeResult>(
      `${BASE}/duplicate-products/merge`,
      body,
    );
    return response.data;
  },

  dismissIssue: async (body: LinkIssueDismissBody): Promise<void> => {
    await http.post(`${BASE}/dismiss`, body);
  },

  listLookAlikeVariants: async (
    params: LinkIssuePageParams,
  ): Promise<LinkIssuePage<LookAlikeVariantIssue>> => {
    const response = await http.get<LinkIssuePage<LookAlikeVariantIssue>>(
      `${BASE}/look-alike-variants`,
      { params },
    );
    return response.data;
  },

  previewLookAlikeVariant: async (
    params: LookAlikeVariantPreviewParams,
  ): Promise<LookAlikeVariantPreview> => {
    const response = await http.get<LookAlikeVariantPreview>(
      `${BASE}/look-alike-variants/preview`,
      { params },
    );
    return response.data;
  },

  mergeLookAlikeVariant: async (
    body: LookAlikeVariantMergeBody,
  ): Promise<LookAlikeVariantPreview> => {
    const response = await http.post<LookAlikeVariantPreview>(
      `${BASE}/look-alike-variants/merge`,
      body,
    );
    return response.data;
  },

  listLinkConflicts: async (
    params: LinkIssuePageParams,
  ): Promise<LinkIssuePage<LinkConflictIssue>> => {
    const response = await http.get<LinkIssuePage<LinkConflictIssue>>(
      `${BASE}/link-conflicts`,
      { params },
    );
    return response.data;
  },

  previewLinkConflict: async (id: number): Promise<LinkConflictPreview> => {
    const response = await http.get<LinkConflictPreview>(
      `${BASE}/link-conflicts/${id}/preview`,
    );
    return response.data;
  },

  resolveLinkConflict: async (
    id: number,
    body: LinkConflictResolveBody,
  ): Promise<LinkConflictPreview> => {
    const response = await http.post<LinkConflictPreview>(
      `${BASE}/link-conflicts/${id}/resolve`,
      body,
    );
    return response.data;
  },

  listRetiredLinks: async (
    params: LinkIssuePageParams,
  ): Promise<LinkIssuePage<RetiredLinkIssue>> => {
    const response = await http.get<LinkIssuePage<RetiredLinkIssue>>(
      `${BASE}/retired-links`,
      { params },
    );
    return response.data;
  },

  previewRetiredLinks: async (
    params: RetiredLinkPreviewParams,
  ): Promise<RetiredLinkPreview> => {
    const response = await http.get<RetiredLinkPreview>(
      `${BASE}/retired-links/preview`,
      { params },
    );
    return response.data;
  },

  moveRetiredLinks: async (
    body: RetiredLinkMoveBody,
  ): Promise<RetiredLinkPreview> => {
    const response = await http.post<RetiredLinkPreview>(
      `${BASE}/retired-links/move`,
      body,
    );
    return response.data;
  },

  listUnlinkedStoreItems: async (
    params: UnlinkedStoreItemsParams,
  ): Promise<LinkIssuePage<UnlinkedStoreItem>> => {
    const response = await http.get<LinkIssuePage<UnlinkedStoreItem>>(
      `${BASE}/unlinked`,
      { params },
    );
    return response.data;
  },

  linkUnlinkedStoreItems: async (
    body: UnlinkedLinkBody,
  ): Promise<UnlinkedLinkResult> => {
    const response = await http.post<UnlinkedLinkResult>(
      `${BASE}/unlinked/link`,
      body,
    );
    return response.data;
  },
};
