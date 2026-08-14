import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { useRefreshCurrentUser } from '@/hooks/usePermissions';
import {
  createRole,
  deleteRole,
  getEmployeeRoles,
  getPermissionCatalog,
  getRole,
  getRoles,
  replaceEmployeeRoles,
  updateRole,
  type CreateRoleBody,
  type UpdateRoleBody,
} from '@/lib/api/authorization';

const STALE_TIME = 60 * 1000;
/** The catalog is static per deploy — only the localized labels can change. */
const CATALOG_STALE_TIME = 60 * 60 * 1000;

export const usePermissionCatalogQuery = (enabled = true) =>
  useQuery({
    queryKey: [QUERY_KEYS.PERMISSION_CATALOG] as QueryKey,
    queryFn: getPermissionCatalog,
    enabled,
    staleTime: CATALOG_STALE_TIME,
  });

export const useRolesQuery = (enabled = true) =>
  useQuery({
    queryKey: [QUERY_KEYS.ROLES] as QueryKey,
    queryFn: getRoles,
    enabled,
    staleTime: STALE_TIME,
  });

export const useRoleQuery = (id: number | undefined) =>
  useQuery({
    queryKey: [QUERY_KEYS.ROLE_DETAIL, id] as QueryKey,
    queryFn: () => getRole(id!),
    enabled: !!id,
    staleTime: STALE_TIME,
  });

export const useEmployeeRolesQuery = (employeeId: number | undefined) =>
  useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEE_ROLES, employeeId] as QueryKey,
    queryFn: () => getEmployeeRoles(employeeId!),
    enabled: !!employeeId,
    staleTime: STALE_TIME,
  });

/**
 * Every role write can change the caller's own grants (they may hold the role
 * being edited), so each mutation invalidates the roles caches, the employee
 * lists that embed `roles[]`, and re-reads `/auth/me` into the auth store.
 */
const useRolesInvalidation = () => {
  const queryClient = useQueryClient();
  const refreshCurrentUser = useRefreshCurrentUser();

  return async () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROLES] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROLE_DETAIL] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEE_ROLES] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES] });
    // employee-settings/[employeeSettingId] caches its detail under ['employee', id]
    queryClient.invalidateQueries({ queryKey: ['employee'] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTH_ME] });
    await refreshCurrentUser();
  };
};

export const useCreateRoleMutation = () => {
  const invalidate = useRolesInvalidation();
  return useMutation({
    mutationFn: (body: CreateRoleBody) => createRole(body),
    onSuccess: invalidate,
  });
};

export const useUpdateRoleMutation = () => {
  const invalidate = useRolesInvalidation();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateRoleBody }) =>
      updateRole(id, body),
    onSuccess: invalidate,
  });
};

export const useDeleteRoleMutation = () => {
  const invalidate = useRolesInvalidation();
  return useMutation({
    mutationFn: ({ id, force }: { id: number; force?: boolean }) =>
      deleteRole(id, force),
    onSuccess: invalidate,
  });
};

export const useReplaceEmployeeRolesMutation = () => {
  const invalidate = useRolesInvalidation();
  return useMutation({
    mutationFn: ({
      employeeId,
      roleIds,
    }: {
      employeeId: number;
      roleIds: number[];
    }) => replaceEmployeeRoles(employeeId, roleIds),
    onSuccess: invalidate,
  });
};
