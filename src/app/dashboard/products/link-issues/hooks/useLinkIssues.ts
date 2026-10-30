import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { linkIssueKeys } from '../../hooks/queryKeys';
import { linkIssuesApi } from '../api/linkIssuesApi';
import type {
  DuplicateProductPreviewParams,
  LinkConflictResolveBody,
  LinkIssueDismissBody,
  LinkIssuePageParams,
  LookAlikeVariantMergeBody,
  LookAlikeVariantPreviewParams,
  DuplicateProductMergeBody,
  RetiredLinkMoveBody,
  RetiredLinkPreviewParams,
  UnlinkedLinkBody,
  UnlinkedStoreItemsParams,
} from '../types/linkIssues';

const COUNTS_STALE_TIME_MS = 60_000;

export const useLinkIssueCounts = (enabled: boolean) =>
  useQuery({
    queryKey: linkIssueKeys.counts(),
    queryFn: linkIssuesApi.getCounts,
    enabled,
    staleTime: COUNTS_STALE_TIME_MS,
  });

export const useDuplicateProducts = (params: LinkIssuePageParams) =>
  useQuery({
    queryKey: linkIssueKeys.list('duplicates', params),
    queryFn: () => linkIssuesApi.listDuplicateProducts(params),
    placeholderData: (previousData) => previousData,
  });

export const useDuplicateProductPreview = (
  params: DuplicateProductPreviewParams | null,
) =>
  useQuery({
    queryKey: linkIssueKeys.preview('duplicates', params ?? {}),
    queryFn: () => linkIssuesApi.previewDuplicateProduct(params!),
    enabled: params !== null,
  });

export const useLookAlikeVariants = (params: LinkIssuePageParams) =>
  useQuery({
    queryKey: linkIssueKeys.list('look-alike', params),
    queryFn: () => linkIssuesApi.listLookAlikeVariants(params),
    placeholderData: (previousData) => previousData,
  });

export const useLookAlikeVariantPreview = (
  params: LookAlikeVariantPreviewParams | null,
) =>
  useQuery({
    queryKey: linkIssueKeys.preview('look-alike', params ?? {}),
    queryFn: () => linkIssuesApi.previewLookAlikeVariant(params!),
    enabled: params !== null,
  });

export const useLinkConflicts = (params: LinkIssuePageParams) =>
  useQuery({
    queryKey: linkIssueKeys.list('conflicts', params),
    queryFn: () => linkIssuesApi.listLinkConflicts(params),
    placeholderData: (previousData) => previousData,
  });

export const useLinkConflictPreview = (id: number | null) =>
  useQuery({
    queryKey: linkIssueKeys.preview('conflicts', { id }),
    queryFn: () => linkIssuesApi.previewLinkConflict(id!),
    enabled: id !== null,
  });

export const useRetiredLinks = (params: LinkIssuePageParams) =>
  useQuery({
    queryKey: linkIssueKeys.list('retired', params),
    queryFn: () => linkIssuesApi.listRetiredLinks(params),
    placeholderData: (previousData) => previousData,
  });

export const useRetiredLinkPreview = (params: RetiredLinkPreviewParams | null) =>
  useQuery({
    queryKey: linkIssueKeys.preview('retired', params ?? {}),
    queryFn: () => linkIssuesApi.previewRetiredLinks(params!),
    enabled: params !== null,
  });

export const useUnlinkedStoreItems = (
  params: UnlinkedStoreItemsParams | null,
) =>
  useQuery({
    queryKey: linkIssueKeys.list('unlinked', params ?? {}),
    queryFn: () => linkIssuesApi.listUnlinkedStoreItems(params!),
    enabled: params !== null,
    placeholderData: (previousData) => previousData,
  });

export const useInvalidateLinkIssues = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: linkIssueKeys.all });
};

export const useDismissLinkIssue = () => {
  const invalidate = useInvalidateLinkIssues();
  return useMutation({
    mutationFn: (body: LinkIssueDismissBody) => linkIssuesApi.dismissIssue(body),
    onSuccess: invalidate,
  });
};

export const useMergeDuplicateProduct = () => {
  const invalidate = useInvalidateLinkIssues();
  return useMutation({
    mutationFn: (body: DuplicateProductMergeBody) =>
      linkIssuesApi.mergeDuplicateProduct(body),
    onSuccess: invalidate,
  });
};

export const useMergeLookAlikeVariant = () => {
  const invalidate = useInvalidateLinkIssues();
  return useMutation({
    mutationFn: (body: LookAlikeVariantMergeBody) =>
      linkIssuesApi.mergeLookAlikeVariant(body),
    onSuccess: invalidate,
  });
};

export const useResolveLinkConflict = () => {
  const invalidate = useInvalidateLinkIssues();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: LinkConflictResolveBody }) =>
      linkIssuesApi.resolveLinkConflict(id, body),
    onSuccess: invalidate,
  });
};

export const useMoveRetiredLinks = () => {
  const invalidate = useInvalidateLinkIssues();
  return useMutation({
    mutationFn: (body: RetiredLinkMoveBody) => linkIssuesApi.moveRetiredLinks(body),
    onSuccess: invalidate,
  });
};

export const usePlanUnlinkedLinks = () =>
  useMutation({
    mutationFn: (body: UnlinkedLinkBody) =>
      linkIssuesApi.linkUnlinkedStoreItems({ ...body, dryRun: true }),
  });

export const useSaveUnlinkedLinks = () => {
  const invalidate = useInvalidateLinkIssues();
  return useMutation({
    mutationFn: (body: UnlinkedLinkBody) =>
      linkIssuesApi.linkUnlinkedStoreItems({
        ...body,
        dryRun: false,
        confirm: true,
      }),
    onSuccess: invalidate,
  });
};
