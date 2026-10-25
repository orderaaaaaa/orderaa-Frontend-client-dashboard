import { PERMISSIONS, type PermissionCode } from '@/lib/permissions';
import type { FollowupClosureKind } from '@/types/logistics';

const CLOSURE_KIND_MANAGE_CODES: Record<FollowupClosureKind, PermissionCode> = {
  CLOSED_TODAY: PERMISSIONS.FOLLOWUP_CARRIERS_CLOSE_MANAGE,
  REFUSE: PERMISSIONS.FOLLOWUP_CARRIERS_REFUSE_MANAGE,
  CANCEL: PERMISSIONS.FOLLOWUP_CARRIERS_CANCEL_MANAGE,
};

export const closureKindAnyOfCodes = (kind: FollowupClosureKind): PermissionCode[] => [
  CLOSURE_KIND_MANAGE_CODES[kind],
  PERMISSIONS.FOLLOWUP_MANAGE,
];
