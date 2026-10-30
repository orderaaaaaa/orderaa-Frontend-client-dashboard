import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type {
  CanonicalNameDomain,
  ListGroupsParams,
  SourceGroup,
  SourceGroupPage,
} from '@/types/canonicalNames';

export const SUGGEST_GROUP_PAGE_SIZE = 500;
export const SUGGEST_MAX_GROUP_PAGES = 10;

const fetchGroupsPage = async (domain: CanonicalNameDomain, params: ListGroupsParams) => {
  const { data } = await http.get<SourceGroupPage>(`/canonical-names/${domain}/groups`, {
    params,
  });
  return data;
};

const groupsParams = (scopeId: number, page: number): ListGroupsParams => ({
  scopeId,
  page,
  limit: SUGGEST_GROUP_PAGE_SIZE,
});

export const useSuggestionGroups = (
  domain: CanonicalNameDomain,
  scopeId: number,
  enabled: boolean,
) => {
  const first = useQuery({
    queryKey: [QUERY_KEYS.CANONICAL_NAME_GROUPS, domain, groupsParams(scopeId, 1)],
    queryFn: () => fetchGroupsPage(domain, groupsParams(scopeId, 1)),
    enabled,
  });

  const total = first.data?.total ?? 0;
  const pageCount = Math.min(Math.ceil(total / SUGGEST_GROUP_PAGE_SIZE), SUGGEST_MAX_GROUP_PAGES);

  const restPages = useQueries({
    queries: Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => {
      const params = groupsParams(scopeId, index + 2);
      return {
        queryKey: [QUERY_KEYS.CANONICAL_NAME_GROUPS, domain, params],
        queryFn: () => fetchGroupsPage(domain, params),
        enabled: enabled && first.isSuccess,
      };
    }),
  });

  const groups = useMemo(() => {
    const pages = [first.data, ...restPages.map((query) => query.data)];
    return pages.flatMap((page) => page?.data ?? []);
  }, [first.data, restPages]);

  const groupsByText = useMemo(() => {
    const map = new Map<string, SourceGroup>();
    groups.forEach((group) => map.set(group.normalizedText, group));
    return map;
  }, [groups]);

  const loading =
    enabled &&
    (first.isPending || (first.isSuccess && restPages.some((query) => query.isPending)));
  const error = first.isError || restPages.some((query) => query.isError);

  const refetch = () => {
    void first.refetch();
    restPages.forEach((query) => void query.refetch());
  };

  return {
    groupsByText,
    loading,
    error,
    truncated: total > SUGGEST_GROUP_PAGE_SIZE * SUGGEST_MAX_GROUP_PAGES,
    refetch,
  };
};
