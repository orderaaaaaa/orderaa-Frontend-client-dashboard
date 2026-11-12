'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import ToggleGroup from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/state-panels';
import { useStartStocktakeMutation, useStocktakeTypesQuery } from '@/services/stocktake';
import type { StocktakeType, StocktakeTypeOptionDto } from '../../types/stocktake';
import { getStocktakeErrorMessage } from '../../utils/stocktakeErrors';
import { STOCKTAKE_TYPE_LABELS } from '../../utils/stocktakeTypes';
import { stocktakeSheetHref } from './stocktakeRoutes';

const NO_SELECTION = 'NONE';

interface StartStocktakeDialogProps {
  initialType: StocktakeType | null;
  onClose(): void;
}

const defaultType = (
  options: StocktakeTypeOptionDto[] | undefined,
  initialType: StocktakeType | null,
): StocktakeType | null => {
  const available = (options ?? [])
    .filter((option) => option.available)
    .map((option) => option.type);
  if (initialType !== null && available.includes(initialType)) return initialType;
  return available[0] ?? null;
};

export function StartStocktakeDialog({ initialType, onClose }: StartStocktakeDialogProps) {
  const router = useRouter();
  const startStocktake = useStartStocktakeMutation();
  const typesQuery = useStocktakeTypesQuery(true);
  const [picked, setPicked] = useState<StocktakeType | null>(null);
  const [note, setNote] = useState('');

  const options = typesQuery.data ?? [];
  const selected = picked ?? defaultType(typesQuery.data, initialType);

  const onConfirm = () => {
    if (selected === null) return;
    startStocktake.mutate(
      { type: selected, note: note.trim() || null },
      {
        onSuccess: (stocktake) => {
          toast.success('تم بدء جلسة الجرد');
          router.push(stocktakeSheetHref(stocktake.id));
        },
        onError: (err: unknown) => {
          toast.error(getStocktakeErrorMessage(err, 'تعذر بدء جلسة الجرد'));
        },
      },
    );
  };

  const toggleOptions = options.map((option) => ({
    value: option.type,
    label: STOCKTAKE_TYPE_LABELS[option.type],
    disabled: !option.available,
  }));

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="بدء جلسة جرد جديدة"
      onConfirm={onConfirm}
      confirmText="بدء الجرد"
      isLoading={startStocktake.isPending}
      confirmDisabled={selected === null}
      maxWidth="md:max-w-[480px]"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">نوع الجرد</p>
          {typesQuery.isError ? (
            <ErrorState
              error={typesQuery.error}
              fallback="تعذر تحميل أنواع الجرد"
              onRetry={() => typesQuery.refetch()}
            />
          ) : typesQuery.isLoading ? (
            <Skeleton className="h-10 w-full rounded-full" />
          ) : (
            <>
              <ToggleGroup
                options={toggleOptions}
                value={selected ?? NO_SELECTION}
                onChange={(next) => setPicked(next === NO_SELECTION ? null : next)}
              />
              {options
                .filter((option) => !option.available)
                .map((option) => (
                  <p key={option.type} className="text-xs text-muted-foreground">
                    {`${STOCKTAKE_TYPE_LABELS[option.type]}: ${
                      option.warehouse === null ? 'لا يوجد مخزن لهذا النوع' : 'المخزن غير مفعّل'
                    }`}
                  </p>
                ))}
            </>
          )}
          <p className="text-xs text-muted-foreground">
            لكل نوع جلسة جرد مفتوحة واحدة في الوقت نفسه.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="stocktake-start-note" className="text-sm font-medium text-foreground">
            ملاحظة (اختياري)
          </label>
          <textarea
            id="stocktake-start-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
    </BaseModal>
  );
}
