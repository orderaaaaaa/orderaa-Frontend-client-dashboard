export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum EmployeeAccessLevel {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export interface Permission {
  minRole: Role;
  minAccessLevel?: EmployeeAccessLevel;
}

export const ROLE_RANK: Record<Role, number> = {
  [Role.SUPERADMIN]: 300,
  [Role.ADMIN]: 200,
  [Role.USER]: 100,
};

export const ACCESS_LEVEL_RANK: Record<EmployeeAccessLevel, number> = {
  [EmployeeAccessLevel.SUPER_ADMIN]: 40,
  [EmployeeAccessLevel.ADMIN]: 30,
  [EmployeeAccessLevel.MANAGER]: 20,
  [EmployeeAccessLevel.EMPLOYEE]: 10,
};

export function hasPermission(
  userRole: Role | undefined,
  userAccessLevel: EmployeeAccessLevel | undefined,
  required: Permission
): boolean {
  if (!userRole) return false;

  const userRoleRank = ROLE_RANK[userRole] ?? 0;
  const requiredRoleRank = ROLE_RANK[required.minRole] ?? 0;

  if (userRoleRank > requiredRoleRank) return true;
  if (userRoleRank < requiredRoleRank) return false;

  if (userRole !== Role.USER) return true;

  if (!required.minAccessLevel) return true;

  const userALRank = userAccessLevel
    ? (ACCESS_LEVEL_RANK[userAccessLevel] ?? 0)
    : 0;
  const requiredALRank = ACCESS_LEVEL_RANK[required.minAccessLevel] ?? 0;

  return userALRank >= requiredALRank;
}
