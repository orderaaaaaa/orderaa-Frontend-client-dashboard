import api from './index';

/**
 * Wire types for the ABAC authorization domain (roles + permission catalog).
 *
 * Shapes mirror the backend exactly — do not add fields the API does not send:
 * - `PermissionCatalogEntry` / `PermissionCatalogGroup`
 *   → `src/authorization/roles/interfaces/roles-service.interface.ts`
 * - `MerchantRoleSummary` / `MerchantRole` / `RoleAssignee` / `EmployeeRoleRef`
 *   → `src/authorization/roles/repositories/roles.repository.ts`
 *   (Prisma `Date` fields arrive as ISO strings over the wire)
 * - request bodies → `src/authorization/roles/dto/*.dto.ts`
 *
 * Routes are registered on a prefix-less controller
 * (`src/authorization/roles/roles.controller.ts`), so they live at the API root.
 */

/** A single permission code, already localized server-side via `Accept-Language`. */
export interface PermissionCatalogEntry {
  code: string;
  domain: string;
  sortOrder: number;
  /** i18n key the label was resolved from (stable; the client may re-translate). */
  labelKey: string;
  /** Label resolved in the request language, falling back to the raw code. */
  label: string;
}

export interface PermissionCatalogGroup {
  domain: string;
  labelKey: string;
  label: string;
  permissions: PermissionCatalogEntry[];
}

export interface MerchantRole {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissionCodes: string[];
}

export interface MerchantRoleSummary extends MerchantRole {
  assigneeCount: number;
}

export interface RoleAssignee {
  employeeId: number;
  name: string | null;
}

export interface MerchantRoleDetails extends MerchantRole {
  assignees: RoleAssignee[];
}

/** Minimal role reference embedded in `/auth/me` and employee payloads. */
export interface EmployeeRoleRef {
  id: number;
  name: string;
}

export interface CreateRoleBody {
  name: string;
  description?: string;
  permissionCodes: string[];
}

/** PATCH /roles/:id — `permissionCodes` fully replaces the current set. */
export type UpdateRoleBody = Partial<CreateRoleBody>;

export interface DeleteRoleResponse {
  success: boolean;
  message: string;
}

export async function getPermissionCatalog(): Promise<PermissionCatalogGroup[]> {
  const { data } = await api.get<PermissionCatalogGroup[]>('/permissions');
  return data;
}

export async function getRoles(): Promise<MerchantRoleSummary[]> {
  const { data } = await api.get<MerchantRoleSummary[]>('/roles');
  return data;
}

export async function getRole(id: number): Promise<MerchantRoleDetails> {
  const { data } = await api.get<MerchantRoleDetails>(`/roles/${id}`);
  return data;
}

export async function createRole(body: CreateRoleBody): Promise<MerchantRole> {
  const { data } = await api.post<MerchantRole>('/roles', body);
  return data;
}

export async function updateRole(
  id: number,
  body: UpdateRoleBody
): Promise<MerchantRole> {
  const { data } = await api.patch<MerchantRole>(`/roles/${id}`, body);
  return data;
}

/**
 * Soft-deletes a role. Without `force` the backend answers 409 when the role is
 * still assigned to employees; with `force` it also drops those assignments.
 */
export async function deleteRole(
  id: number,
  force = false
): Promise<DeleteRoleResponse> {
  const { data } = await api.delete<DeleteRoleResponse>(
    `/roles/${id}${force ? '?force=true' : ''}`
  );
  return data;
}

export async function getEmployeeRoles(
  employeeId: number
): Promise<EmployeeRoleRef[]> {
  const { data } = await api.get<EmployeeRoleRef[]>(
    `/employees/${employeeId}/roles`
  );
  return data;
}

/** PUT /employees/:id/roles — full replace of the employee's role set. */
export async function replaceEmployeeRoles(
  employeeId: number,
  roleIds: number[]
): Promise<EmployeeRoleRef[]> {
  const { data } = await api.put<EmployeeRoleRef[]>(
    `/employees/${employeeId}/roles`,
    { roleIds }
  );
  return data;
}
