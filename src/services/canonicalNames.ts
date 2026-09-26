import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getApiErrorMessage } from '@/utils/apiError';
import { getCanonicalNameError } from '@/app/dashboard/canonical-names/utils/canonicalNameErrors';
import {
  isRowNotFoundError,
  locationLinkErrorMessage,
  skippedAliasesMessage,
} from '@/app/dashboard/canonical-names/utils/linkFeedback';
import {
  CANONICAL_NAME_DOMAINS,
  CANONICAL_NAME_ERROR_CODES,
  REFRESH_REQUEST_STATUSES,
  type ApplyLinksRequest,
  type ApplyLinksResponse,
  type CanonicalName,
  type CanonicalNameDomain,
  type CreateCanonicalNameInput,
  type DeleteNameResult,
  type GroupMembersPage,
  type LinkCandidate,
  type ListCandidatesParams,
  type ListGroupMembersParams,
  type ListGroupsParams,
  type ListNamesParams,
  type LocationSourcesStatus,
  type NameImpact,
  type RefreshRequestStatus,
  type RenameNameResult,
  type SourceGroupPage,
  type SuggestRequest,
  type SuggestionResult,
} from '@/types/canonicalNames';

const invalidateDomainQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  domain: CanonicalNameDomain,
) => {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CANONICAL_NAMES, domain] });
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.CANONICAL_NAME_GROUPS, domain],
  });
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.CANONICAL_NAME_IMPACT, domain],
  });
  if (domain === CANONICAL_NAME_DOMAINS.GOVERNORATE) {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.CANONICAL_NAME_GROUPS, CANONICAL_NAME_DOMAINS.CITY],
    });
  }
  if (domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_NAME) {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.CANONICAL_NAMES, CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION],
    });
    queryClient.invalidateQueries({
      queryKey: [
        QUERY_KEYS.CANONICAL_NAME_GROUPS,
        CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION,
      ],
    });
  }
};

export const isLocationDomain = (domain: CanonicalNameDomain) =>
  domain === CANONICAL_NAME_DOMAINS.GOVERNORATE ||
  domain === CANONICAL_NAME_DOMAINS.CITY;

export const useCanonicalNamesQuery = (
  domain: CanonicalNameDomain,
  params: ListNamesParams = {},
) =>
  useQuery({
    queryKey: [QUERY_KEYS.CANONICAL_NAMES, domain, params],
    queryFn: async () => {
      const { data } = await http.get<CanonicalName[]>(`/canonical-names/${domain}`, {
        params,
      });
      return data;
    },
  });

export const useSourceGroupsQuery = (
  domain: CanonicalNameDomain,
  params: ListGroupsParams,
  enabled = true,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.CANONICAL_NAME_GROUPS, domain, params],
    queryFn: async () => {
      const { data } = await http.get<SourceGroupPage>(
        `/canonical-names/${domain}/groups`,
        { params },
      );
      return data;
    },
    enabled,
  });

export const useGroupMembersQuery = (
  domain: CanonicalNameDomain,
  params: ListGroupMembersParams,
  enabled: boolean,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.CANONICAL_NAME_GROUP_MEMBERS, domain, params],
    queryFn: async () => {
      const { data } = await http.get<GroupMembersPage>(
        `/canonical-names/${domain}/groups/members`,
        { params },
      );
      return data;
    },
    enabled,
  });

export const useLinkCandidatesQuery = (
  domain: CanonicalNameDomain,
  params: ListCandidatesParams,
  enabled: boolean,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.CANONICAL_NAME_CANDIDATES, domain, params],
    queryFn: async () => {
      const { data } = await http.get<LinkCandidate[]>(
        `/canonical-names/${domain}/groups/candidates`,
        { params },
      );
      return data;
    },
    enabled,
  });

export const useLinkSuggestionsMutation = (domain: CanonicalNameDomain) =>
  useMutation({
    mutationFn: async (payload: SuggestRequest) => {
      const { data } = await http.post<SuggestionResult>(
        `/canonical-names/${domain}/groups/suggest`,
        payload,
      );
      return data;
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, 'تعذر توليد الاقتراحات'));
    },
  });

export const useNameImpactQuery = (
  domain: CanonicalNameDomain,
  id: number | undefined,
  params: { page: number; limit: number },
  enabled: boolean,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.CANONICAL_NAME_IMPACT, domain, id, params],
    queryFn: async () => {
      const { data } = await http.get<NameImpact>(
        `/canonical-names/${domain}/${id}/impact`,
        { params },
      );
      return data;
    },
    enabled: enabled && id !== undefined,
  });

export const useCreateCanonicalName = (domain: CanonicalNameDomain) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCanonicalNameInput) => {
      const { data } = await http.post<CanonicalName>(
        `/canonical-names/${domain}`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      invalidateDomainQueries(queryClient, domain);
      toast.success('تم إنشاء الاسم الموحد');
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, 'تعذر إنشاء الاسم الموحد'));
    },
  });
};

export const useRenameCanonicalName = (domain: CanonicalNameDomain) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number; name: string }) => {
      const { data } = await http.patch<RenameNameResult>(
        `/canonical-names/${domain}/${payload.id}`,
        { name: payload.name },
      );
      return data;
    },
    onSuccess: (result) => {
      invalidateDomainQueries(queryClient, domain);
      toast.success(`تم تغيير الاسم الظاهر في ${result.impact.rowCount} عنصر`);
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, 'تعذر تغيير الاسم'));
    },
  });
};

export const useDeleteCanonicalName = (domain: CanonicalNameDomain) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await http.delete<DeleteNameResult>(
        `/canonical-names/${domain}/${id}`,
      );
      return data;
    },
    onSuccess: () => {
      invalidateDomainQueries(queryClient, domain);
      toast.success('تم حذف الاسم الموحد');
    },
    onError: (err: any) => {
      const error = getCanonicalNameError(err);
      if (error?.code === CANONICAL_NAME_ERROR_CODES.NAME_HAS_LINKED_ROWS) {
        const withCities = (error.details?.cityNameIds ?? []).length > 0;
        toast.error(
          withCities
            ? 'لا يمكن حذف الاسم لأنه مرتبط بصفوف من شركات الشحن ومدن تابعة، ألغ ربطها أولا'
            : 'لا يمكن حذف الاسم لأنه مرتبط بصفوف من شركات الشحن، ألغ ربطها أولا',
        );
        invalidateDomainQueries(queryClient, domain);
        return;
      }
      toast.error(getApiErrorMessage(err, 'تعذر حذف الاسم الموحد'));
    },
  });
};

export const useApplyLinks = (domain: CanonicalNameDomain) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ApplyLinksRequest) => {
      const { data } = await http.put<ApplyLinksResponse>(
        `/canonical-names/${domain}/links`,
        payload,
      );
      return data;
    },
    onSuccess: (result) => {
      invalidateDomainQueries(queryClient, domain);
      const rowsLinked = result.data.reduce((sum, row) => sum + row.rowsLinked, 0);
      if (rowsLinked > 0) {
        toast.success(`تم ربط ${rowsLinked} عنصر`);
      } else {
        toast.success('تم تحديث الربط');
      }
      if (!isLocationDomain(domain)) return;
      const names = queryClient
        .getQueriesData<CanonicalName[]>({
          queryKey: [QUERY_KEYS.CANONICAL_NAMES, domain],
        })
        .flatMap(([, data]) => data ?? []);
      const skipped = skippedAliasesMessage(result.data, names);
      if (skipped) toast.info(skipped);
    },
    onError: (err: any) => {
      if (!isLocationDomain(domain)) {
        toast.error(getApiErrorMessage(err, 'تعذر تنفيذ الربط'));
        return;
      }
      if (isRowNotFoundError(err)) invalidateDomainQueries(queryClient, domain);
      toast.error(locationLinkErrorMessage(err));
    },
  });
};

const STATUS_POLL_MS = 5000;
const STATUS_WATCH_MS = 60000;

let statusWatchUntil = 0;

const extendStatusWatch = () => {
  statusWatchUntil = Date.now() + STATUS_WATCH_MS;
};

const latestAttemptOf = (status: LocationSourcesStatus) =>
  status.sources.reduce(
    (latest, source) => Math.max(latest, Date.parse(source.lastAttemptAt) || 0),
    0,
  );

interface SeenSourcesStatus {
  running: boolean;
  latestAttempt: number;
  sourceCount: number;
  changed: boolean;
}

export const useLocationSourcesStatus = (enabled: boolean) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (enabled) extendStatusWatch();
  }, [enabled]);

  const query = useQuery({
    queryKey: [QUERY_KEYS.CANONICAL_NAME_SOURCES_STATUS],
    queryFn: async () => {
      const { data } = await http.get<LocationSourcesStatus>(
        '/canonical-names/location-sources/status',
      );
      return data;
    },
    enabled,
    refetchInterval: (current) => {
      const data = current.state.data;
      if (!data) return false;
      if (data.running) return STATUS_POLL_MS;
      return data.sources.length === 0 && Date.now() < statusWatchUntil
        ? STATUS_POLL_MS
        : false;
    },
  });

  const data = query.data;
  const seen = useRef<SeenSourcesStatus | null>(null);

  useEffect(() => {
    if (!data) return;
    const latestAttempt = latestAttemptOf(data);
    const sourceCount = data.sources.length;
    const previous = seen.current;
    const changed =
      previous !== null &&
      (previous.changed ||
        previous.running ||
        latestAttempt > previous.latestAttempt ||
        (previous.sourceCount === 0 && sourceCount > 0));

    if (changed && !data.running) {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CANONICAL_NAME_GROUPS, CANONICAL_NAME_DOMAINS.GOVERNORATE],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CANONICAL_NAME_GROUPS, CANONICAL_NAME_DOMAINS.CITY],
      });
      seen.current = { running: false, latestAttempt, sourceCount, changed: false };
      return;
    }
    seen.current = { running: data.running, latestAttempt, sourceCount, changed };
  }, [data, queryClient]);

  return query;
};

export const useRecheckLocationSourcesStatus = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.CANONICAL_NAME_SOURCES_STATUS],
    });
  }, [queryClient]);
};

export const useRefreshLocationSources = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QUERY_KEYS.CANONICAL_NAME_SOURCES_REFRESH],
    mutationFn: async () => {
      const { data } = await http.post<RefreshRequestStatus>(
        '/canonical-names/location-sources/refresh',
      );
      return data;
    },
    onSuccess: (result) => {
      extendStatusWatch();
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CANONICAL_NAME_SOURCES_STATUS],
      });
      if (result.status === REFRESH_REQUEST_STATUSES.ALREADY_RUNNING) {
        toast.info('التحديث قيد التشغيل بالفعل');
      } else {
        toast.success('بدأ تحديث القوائم');
      }
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, 'تعذر بدء تحديث القوائم'));
    },
  });
};
