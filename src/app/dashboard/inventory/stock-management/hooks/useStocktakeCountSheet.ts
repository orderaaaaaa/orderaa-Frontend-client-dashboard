'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { useStocktakeCancel } from './useStocktakeCancel';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  useLoadChangedStocktakeLines,
  usePostStocktakeMutation,
  useStocktakeLinesQuery,
  useStocktakeQuery,
  useStocktakeSelectionQuery,
  useUpdateStocktakeLinesMutation,
} from '@/services/stocktake';
import { useDebounce } from '@/utils/debounce';
import { formatStockNumber } from '@/utils/format';
import type {
  StocktakeLineDto,
  StocktakeLineFilter,
  StocktakeLineInputDto,
  StocktakeRefusedLine,
} from '../types/stocktake';
import {
  getStocktakeErrorCode,
  getStocktakeErrorMessage,
  getStocktakeShortageLines,
} from '../utils/stocktakeErrors';
import {
  STOCKTAKE_LINES_PAGE_SIZE,
  STOCKTAKE_LINES_WRITE_LIMIT,
  STOCKTAKE_SAVE_BATCH_SIZE,
  chunkLines,
  countedValueText,
  parseCountDraft,
  toRefusedLines,
  toStocktakeCountSheetLine,
} from '../utils/stocktakeSheet';

type Drafts = Record<number, string>;

export interface StocktakeReviewState {
  lines: StocktakeLineDto[];
}

export function useStocktakeCountSheet(stocktakeId: number) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const canRead = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_STOCKTAKE_READ);
  const canManage = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_STOCKTAKE_MANAGE);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filter, setFilter] = useState<StocktakeLineFilter>('ALL');
  const [page, setPage] = useState(1);
  const [drafts, setDrafts] = useState<Drafts>({});
  const draftsRef = useRef<Drafts>(drafts);
  const [review, setReview] = useState<StocktakeReviewState | null>(null);
  const [refused, setRefused] = useState<StocktakeRefusedLine[]>([]);

  const summaryQuery = useStocktakeQuery(stocktakeId, canRead);
  const linesQuery = useStocktakeLinesQuery(
    stocktakeId,
    {
      search: debouncedSearch.trim() || undefined,
      filter,
      page,
      pageSize: STOCKTAKE_LINES_PAGE_SIZE,
    },
    canRead,
  );
  const selectionQuery = useStocktakeSelectionQuery(stocktakeId, canRead);
  const updateLines = useUpdateStocktakeLinesMutation();
  const postStocktake = usePostStocktakeMutation();
  const { cancelOpen, setCancelOpen, onCancel, cancelStocktake } = useStocktakeCancel(stocktakeId);
  const loadChangedLines = useLoadChangedStocktakeLines();
  const { mutateAsync: saveLines } = updateLines;
  const { refetch: refetchSelection } = selectionQuery;

  const summary = summaryQuery.data;
  const isOpen = summary?.status === 'OPEN';
  const isEditable = isOpen && canManage;

  const rawLines = useMemo(() => linesQuery.data?.data ?? [], [linesQuery.data]);
  const linesById = useMemo(
    () => new Map(rawLines.map((line) => [line.variantId, line])),
    [rawLines],
  );
  const sheetLines = useMemo(() => rawLines.map(toStocktakeCountSheetLine), [rawLines]);

  const updateDrafts = useCallback((next: Drafts) => {
    draftsRef.current = next;
    setDrafts(next);
  }, []);

  const dropRemovedDrafts = useCallback(async (): Promise<boolean> => {
    const selection = await refetchSelection();
    if (selection.isError || !selection.data) return false;
    const selected = new Set(selection.data.variantIds);
    const kept: Drafts = {};
    let dropped = 0;
    Object.entries(draftsRef.current).forEach(([key, raw]) => {
      const variantId = Number(key);
      if (selected.has(variantId)) kept[variantId] = raw;
      else dropped += 1;
    });
    updateDrafts(kept);
    if (dropped > 0) {
      toast.warning('تمت إزالة بعض المنتجات من الجرد، وتم تجاهل أعدادها');
    }
    return true;
  }, [refetchSelection, updateDrafts]);

  const saveDrafts = useCallback(async (): Promise<boolean> => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const sent = Object.entries(draftsRef.current)
        .map(([key, raw]) => ({ variantId: Number(key), raw, counted: parseCountDraft(raw) }))
        .filter((entry) => entry.counted !== undefined);
      if (sent.length === 0) return true;

      const payload: StocktakeLineInputDto[] = sent.map((entry) => ({
        variantId: entry.variantId,
        countedQuantity: entry.counted ?? null,
      }));
      try {
        for (const chunk of chunkLines(payload, STOCKTAKE_LINES_WRITE_LIMIT)) {
          await saveLines({ id: stocktakeId, body: { lines: chunk } });
        }
      } catch (err: unknown) {
        const retryable =
          attempt === 0 && getStocktakeErrorCode(err) === 'STOCKTAKE_LINE_UNKNOWN_VARIANT';
        if (retryable && (await dropRemovedDrafts())) continue;
        toast.error(getStocktakeErrorMessage(err, 'تعذر حفظ الأعداد'));
        return false;
      }

      await queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.STOCKTAKE_LINES, stocktakeId],
        type: 'active',
      });
      const remaining = { ...draftsRef.current };
      sent.forEach((entry) => {
        if (remaining[entry.variantId] === entry.raw) delete remaining[entry.variantId];
      });
      updateDrafts(remaining);
      return true;
    }
    return false;
  }, [dropRemovedDrafts, queryClient, saveLines, stocktakeId, updateDrafts]);

  const chainRef = useRef<Promise<boolean>>(Promise.resolve(true));
  const flushDrafts = useCallback(() => {
    chainRef.current = chainRef.current.then(saveDrafts);
    return chainRef.current;
  }, [saveDrafts]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasDrafts = Object.keys(draftsRef.current).length > 0;
      void flushDrafts();
      if (!hasDrafts) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [flushDrafts]);

  useEffect(
    () => () => {
      void flushDrafts();
    },
    [flushDrafts, pathname],
  );

  const valueOf = (line: { variantId: number }) => {
    const draft = drafts[line.variantId];
    if (draft !== undefined) return draft;
    return countedValueText(linesById.get(line.variantId)?.countedQuantity ?? null);
  };

  const onCountedChange = (variantId: number, raw: string) => {
    const next = { ...draftsRef.current, [variantId]: raw };
    updateDrafts(next);
    if (Object.keys(next).length >= STOCKTAKE_SAVE_BATCH_SIZE) {
      void flushDrafts();
    }
  };

  const onCancelEdit = (variantId: number) => {
    const next = { ...draftsRef.current };
    delete next[variantId];
    updateDrafts(next);
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const onFilterChange = (next: StocktakeLineFilter) => {
    setFilter(next);
    setPage(1);
  };

  const pendingCount = Object.keys(drafts).length;
  const hasInvalidDraft = Object.values(drafts).some(
    (raw) => parseCountDraft(raw) === undefined,
  );

  const onReview = async () => {
    setRefused([]);
    const saved = await flushDrafts();
    if (!saved) return;
    if (Object.keys(draftsRef.current).length > 0) {
      toast.error('ما زالت بعض الأعداد قيد الحفظ، أعد المحاولة بعد لحظات');
      return;
    }
    try {
      const lines = await loadChangedLines(stocktakeId);
      setReview({ lines });
    } catch (err: unknown) {
      toast.error(getStocktakeErrorMessage(err, 'تعذر تحميل الفروقات'));
    }
  };

  const onPost = (note: string) => {
    postStocktake.mutate(
      { id: stocktakeId, body: { note: note || null } },
      {
        onSuccess: (result) => {
          toast.success(`تم ترحيل الجرد (${formatStockNumber(result.movementCount)} حركة)`);
          setRefused([]);
          setReview(null);
        },
        onError: (err: unknown) => {
          toast.error(getStocktakeErrorMessage(err, 'تعذر ترحيل الجرد'));
          const shortages = getStocktakeShortageLines(err);
          if (shortages.length > 0) {
            setRefused(toRefusedLines(shortages, review?.lines ?? []));
            return;
          }
          setReview(null);
        },
      },
    );
  };

  return {
    canRead,
    canManage,
    summary,
    isOpen,
    isEditable,
    search,
    onSearchChange,
    filter,
    onFilterChange,
    page,
    setPage,
    linesQuery,
    sheetLines,
    valueOf,
    onCountedChange,
    onCancelEdit,
    flushDrafts,
    pendingCount,
    hasInvalidDraft,
    review,
    setReview,
    refused,
    onReview,
    onPost,
    cancelOpen,
    setCancelOpen,
    onCancel,
    updateLines,
    postStocktake,
    cancelStocktake,
  };
}
