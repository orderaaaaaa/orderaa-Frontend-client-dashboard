'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
import { useCanonicalNamesQuery } from '@/services/canonicalNames';

interface ScopeSelectorProps {
  value: number | undefined;
  onChange: (governorateId: number) => void;
}

export default function ScopeSelector({ value, onChange }: ScopeSelectorProps) {
  const { data: governorates, isLoading } = useCanonicalNamesQuery(
    CANONICAL_NAME_DOMAINS.GOVERNORATE,
    {},
  );

  return (
    <Select
      value={value !== undefined ? String(value) : undefined}
      onValueChange={(next) => onChange(Number(next))}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="اختر المحافظة" />
      </SelectTrigger>
      <SelectContent>
        {(governorates ?? []).map((governorate) => (
          <SelectItem key={governorate.id} value={String(governorate.id)}>
            {governorate.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
