'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ItemSelectOption {
  id: number;
  label: string;
}

interface ItemSelectProps {
  value: number | null;
  options: ItemSelectOption[];
  onChange: (id: number) => void;
  placeholder: string;
  disabled?: boolean;
  ariaLabel: string;
}

export function ItemSelect({ value, options, onChange, placeholder, disabled, ariaLabel }: ItemSelectProps) {
  return (
    <Select
      value={value === null ? undefined : String(value)}
      onValueChange={(next) => onChange(Number(next))}
      disabled={disabled}
    >
      <SelectTrigger className="w-full min-w-0" aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
