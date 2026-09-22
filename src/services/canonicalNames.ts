import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  CANONICAL_NAME_DOMAINS,
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
  type NameImpact,
  type RenameNameResult,
  type SourceGroupPage,
  type SuggestRequest,
  type SuggestionResult,
} from '@/types/canonicalNames';

const CANONICAL_NAME_ERROR_MESSAGES: Record<string, string> = {
  GOVERNORATE_IS_CLOSED: 'قائمة المحافظات ثابتة ولا يمكن إضافة محافظة جديدة',
  SYSTEM_CANONICAL: 'هذا اسم نظامي ولا يمكن إعادة تسميته أو حذفه',
  PARENT_REQUIRED: 'اسم المدينة يحتاج إلى محافظة أصل',
  PARENT_DOMAIN_MISMATCH: 'يجب أن ينتمي الاسم الأصل إلى نطاق المحافظات',
  PARENT_NOT_ALLOWED: 'هذا النطاق لا يقبل اسما أصلا',
  SCOPE_REQUIRED: 'يلزم تحديد نطاق المحافظة لاسم المدينة',
  SCOPE_NOT_APPLICABLE: 'هذا النطاق لا يقبل نطاقا غير 0',
  DOMAIN_NOT_APPLICABLE: 'هذه النقطة لا تنطبق على هذا النطاق',
  CANONICAL_NAME_EXISTS: 'يوجد اسم بهذا الإملاء بالفعل',
  SPELLING_IS_CANONICAL_NAME: 'هذا الإملاء اسم موحد بالفعل',
  CANONICAL_NAME_NOT_FOUND: 'الاسم الموحد غير موجود',
  NORMALIZED_TEXT_REQUIRED: 'يلزم تحديد نص مطابق',
  CANONICAL_SCOPE_MISMATCH: 'النطاق المحدد لا يطابق نطاق الاسم الموحد',
  UNSCOPED_GROUP: 'هذه المجموعة تحتاج إلى تحديد نطاق قبل الربط',
};

const extractErrorMessage = (err: any): string => {
  const code = err?.response?.data?.code;
  if (typeof code === 'string' && CANONICAL_NAME_ERROR_MESSAGES[code]) {
    return CANONICAL_NAME_ERROR_MESSAGES[code];
  }
  const message = err?.response?.data?.message;
  if (typeof message === 'string' && message.trim()) return message;
  return 'حدث خطأ غير متوقع';
};

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
      toast.error(extractErrorMessage(err));
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
      toast.error(extractErrorMessage(err));
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
      toast.error(extractErrorMessage(err));
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
      toast.error(extractErrorMessage(err));
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
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err));
    },
  });
};
