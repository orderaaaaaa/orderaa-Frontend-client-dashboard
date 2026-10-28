import { CircleHelp, Cpu, ShieldCheck, User, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type ActorKind = 'EMPLOYEE' | 'SYSTEM' | 'UNKNOWN' | 'PLATFORM';

export interface ActorChipActor {
  kind: ActorKind;
  id: number | null;
  name: string | null;
}

interface ActorChipProps {
  actor: ActorChipActor;
}

const UNREGISTERED_LABEL = 'غير مسجل';

const ACTOR_ICONS: Record<ActorKind, LucideIcon> = {
  EMPLOYEE: User,
  SYSTEM: Cpu,
  PLATFORM: ShieldCheck,
  UNKNOWN: CircleHelp,
};

const labelOf = ({ kind, name }: ActorChipActor): string => {
  if (kind === 'SYSTEM') return 'النظام';
  if (kind === 'PLATFORM') return 'إدارة المنصة';
  if (kind === 'EMPLOYEE') return name?.trim() || UNREGISTERED_LABEL;
  return UNREGISTERED_LABEL;
};

export function ActorChip({ actor }: ActorChipProps) {
  const Icon = ACTOR_ICONS[actor.kind];

  return (
    <Badge
      variant="outline"
      className="max-w-full gap-1 border-border bg-muted/40 font-medium text-muted-foreground"
    >
      <Icon aria-hidden="true" />
      <span className="truncate">{labelOf(actor)}</span>
    </Badge>
  );
}
