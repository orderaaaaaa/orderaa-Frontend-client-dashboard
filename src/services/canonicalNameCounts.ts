import { useQuery } from '@tanstack/react-query';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type {
  CanonicalNameDomain,
  GroupCounts,
  ListGroupCountsParams,
} from '@/types/canonicalNames';

export const canonicalNameGroupCountsKey = (
  domain: CanonicalNameDomain,
  params: ListGroupCountsParams,
) => [QUERY_KEYS.CANONICAL_NAME_GROUP_COUNTS, domain, params] as const;

export const useGroupCountsQuery = (
  domain: CanonicalNameDomain,
  params: ListGroupCountsParams,
  enabled = true,
) =>
  useQuery({
    queryKey: canonicalNameGroupCountsKey(domain, params),
    queryFn: async () => {
      const { data } = await http.get<GroupCounts>(
        `/canonical-names/${domain}/groups/counts`,
        { params },
      );
      return data;
    },
    enabled,
  });
