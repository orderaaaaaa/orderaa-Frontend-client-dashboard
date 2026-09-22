'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PageLoading from '@/components/ui/page-loading';
import { useLinkSuggestionsMutation } from '@/services/canonicalNames';
import type { CanonicalNameDomain, LinkItem } from '@/types/canonicalNames';
import { VisualizedSpelling } from './SourceGroupRow';

interface SuggestionsPanelProps {
  domain: CanonicalNameDomain;
  scopeId: number | undefined;
  onApply: (items: LinkItem[]) => void;
  applying?: boolean;
}

export default function SuggestionsPanel({
  domain,
  scopeId,
  onApply,
  applying,
}: SuggestionsPanelProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const suggest = useLinkSuggestionsMutation(domain);

  const toggle = (key: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setSelected(new Set());
      suggest.mutate({ scopeId });
    }
  };

  const handleApply = () => {
    const result = suggest.data;
    if (!result) return;
    const items: LinkItem[] = [];
    result.proposedLinks.forEach((link) => {
      const key = `link:${link.scopeId}:${link.normalizedText}`;
      if (!selected.has(key)) return;
      items.push({
        scopeId: link.scopeId,
        normalizedText: link.normalizedText,
        canonicalNameId: link.canonicalNameId ?? undefined,
        catalogKey: link.catalogKey ?? undefined,
      });
    });
    result.proposedNames.forEach((cluster) => {
      const key = `name:${cluster.scopeId}:${cluster.name}`;
      if (!selected.has(key)) return;
      cluster.members.forEach((member) => {
        items.push({
          scopeId: cluster.scopeId,
          normalizedText: member.normalizedText,
          newName: cluster.name,
        });
      });
    });
    if (items.length === 0) return;
    onApply(items);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">اقتراح الربط</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>اقتراح الربط</DialogTitle>
        </DialogHeader>

        {suggest.isPending && <PageLoading size="sm" />}

        {suggest.data && (
          <div className="max-h-96 overflow-y-auto flex flex-col gap-4">
            {suggest.data.proposedLinks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  روابط مقترحة
                </p>
                <ul className="flex flex-col gap-2">
                  {suggest.data.proposedLinks.map((link) => {
                    const key = `link:${link.scopeId}:${link.normalizedText}`;
                    return (
                      <li key={key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selected.has(key)}
                          onCheckedChange={(checked) =>
                            toggle(key, checked === true)
                          }
                        />
                        <VisualizedSpelling text={link.normalizedText} />
                        <span className="text-gray-400">→</span>
                        <span>{link.name}</span>
                        <span className="text-gray-400 text-xs">
                          {Math.round(link.score * 100)}٪
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {suggest.data.proposedNames.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  أسماء جديدة مقترحة
                </p>
                <ul className="flex flex-col gap-2">
                  {suggest.data.proposedNames.map((cluster) => {
                    const key = `name:${cluster.scopeId}:${cluster.name}`;
                    return (
                      <li key={key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selected.has(key)}
                          onCheckedChange={(checked) =>
                            toggle(key, checked === true)
                          }
                        />
                        <span>{cluster.name}</span>
                        <span className="text-gray-400 text-xs">
                          ({cluster.members.length})
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {suggest.data.proposedLinks.length === 0 &&
              suggest.data.proposedNames.length === 0 && (
                <p className="text-sm text-gray-500">لا توجد اقتراحات حاليا</p>
              )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إغلاق
          </Button>
          <Button
            onClick={handleApply}
            disabled={selected.size === 0 || applying}
          >
            تطبيق المحدد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
