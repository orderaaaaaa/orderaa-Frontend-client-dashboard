'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLinkCandidatesQuery } from '@/services/canonicalNames';
import type { CanonicalNameDomain, LinkCandidate } from '@/types/canonicalNames';

interface CandidatesPopoverProps {
  domain: CanonicalNameDomain;
  scopeId: number;
  normalizedText: string;
  onSelect: (candidate: LinkCandidate) => void;
}

export default function CandidatesPopover({
  domain,
  scopeId,
  normalizedText,
  onSelect,
}: CandidatesPopoverProps) {
  const [open, setOpen] = useState(false);
  const { data: candidates, isLoading } = useLinkCandidatesQuery(
    domain,
    { scopeId, normalizedText },
    open,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          اقتراحات
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        {isLoading && <p className="text-xs text-gray-500">جاري التحميل...</p>}
        {!isLoading && (candidates ?? []).length === 0 && (
          <p className="text-xs text-gray-500">لا توجد اقتراحات</p>
        )}
        <ul className="flex flex-col gap-2">
          {(candidates ?? []).map((candidate) => (
            <li
              key={`${candidate.canonicalNameId ?? candidate.catalogKey ?? candidate.name}`}
              className="flex items-center justify-between gap-2"
            >
              <div>
                <p className="text-sm text-gray-900">{candidate.name}</p>
                <p className="text-xs text-gray-400">
                  {Math.round(candidate.score * 100)}٪
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  onSelect(candidate);
                  setOpen(false);
                }}
              >
                ربط
              </Button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
