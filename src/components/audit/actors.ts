import type { ActorChipActor } from './ActorChip';

export interface EmployeeNameSource {
  id: number;
  fullName?: string | null;
}

export interface ActorRef {
  id: number;
  name: string | null;
}

const UNREGISTERED_ACTOR: ActorChipActor = { kind: 'UNKNOWN', id: null, name: null };

export const UNREGISTERED_ACTOR_NAME = 'غير مسجل';

export function employeeActor(employee: EmployeeNameSource | null | undefined): ActorChipActor {
  const name = employee?.fullName?.trim();
  if (!employee || !name) return UNREGISTERED_ACTOR;
  return { kind: 'EMPLOYEE', id: employee.id, name };
}

export function actorRefToChip(actor: ActorRef | null): ActorChipActor {
  if (!actor) return UNREGISTERED_ACTOR;
  return { kind: 'EMPLOYEE', id: actor.id, name: actor.name };
}

export function employeeDisplayName(employee: EmployeeNameSource | null | undefined): string {
  return employee?.fullName?.trim() || UNREGISTERED_ACTOR_NAME;
}
