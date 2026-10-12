'use client';

import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { AlertTriangle, Info } from 'lucide-react';
import { LiaStarSolid } from 'react-icons/lia';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/state-panels';
import PageLoading from '@/components/ui/page-loading';
import { useJobStore } from '@/store/useJobStore';
import { formatMoney } from '@/utils/formatMoney';
import type {
  MergeProductsPayload,
  MergeVariantPlanEntry,
  Product,
  ProductDetail,
} from '../../types/products';
import {
  useMergeProductDetails,
  useMergeProducts,
} from '../../hooks/useMergeProducts';
import {
  applyPlanEntry,
  autoMergedIds,
  collectMergeVariants,
  describeMergeIssue,
  keptCollisions,
  mergePlanErrorBody,
  resolveMergePlan,
  variantDisplayLabel,
  variantFullLabel,
  type MergePlanOverrides,
  type MergeVariantRef,
} from '../../utils/mergePlan';
import { productApiErrorMessage } from '../../utils/productApiError';
import { DeleteVariantDialog } from '../editor/DeleteVariantDialog';
import {
  MergeVariantChip,
  MergeVariantChipPreview,
  type MergeChipChoice,
} from './MergeVariantChip';

const mergeSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  sku: z.string().optional(),
  price: z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined ? undefined : value,
    z.coerce.number().min(0, 'السعر يجب أن يكون 0 أو أكثر').optional(),
  ),
});

type MergeFormData = z.infer<typeof mergeSchema>;

interface MergeProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSuccess: () => void;
}

const PLACEHOLDER_IMAGE = 'https://placehold.net/600x600.png';

const formatPrice = (price: number | null | undefined) =>
  formatMoney(price === null || price === undefined ? null : String(price));

const unionImages = (details: ProductDetail[]) =>
  Array.from(
    new Set(
      details.flatMap((detail) =>
        [detail.image, ...detail.images].filter(
          (url): url is string => typeof url === 'string' && url.length > 0,
        ),
      ),
    ),
  );

function TargetColumnDropZone({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'target-column',
    data: { kind: 'target' },
    disabled,
  });
  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'rounded-lg transition-colors',
        isOver && 'bg-primary/10 ring-2 ring-primary/40',
      )}
    >
      {children}
    </div>
  );
}

interface ProductColumnProps {
  product: Product;
  detail: ProductDetail | undefined;
  isTarget: boolean;
  disabled: boolean;
  onMakeTarget: () => void;
  children: React.ReactNode;
}

function ProductColumn({
  product,
  detail,
  isTarget,
  disabled,
  onMakeTarget,
  children,
}: ProductColumnProps) {
  const name = detail?.name ?? product.name;
  const image =
    detail?.image || detail?.images[0] || product.image || product.images?.[0];
  const sku = detail ? detail.sku : product.sku;
  const price = detail ? detail.price : product.price;
  return (
    <section
      aria-label={isTarget ? `المنتج الرئيسي ${name}` : `منتج مدمج ${name}`}
      className={clsx(
        'flex min-w-0 flex-col gap-3 rounded-xl border p-3',
        isTarget ? 'border-primary/40 bg-primary/5' : 'border-gray-200 bg-gray-50',
      )}
    >
      <div className="flex items-center gap-3">
        <img
          src={image || PLACEHOLDER_IMAGE}
          alt={name}
          className="size-10 shrink-0 rounded-md border border-gray-100 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">
            {sku && (
              <span dir="ltr" className="me-1">
                {sku} ·
              </span>
            )}
            {formatPrice(price)}
          </p>
        </div>
      </div>
      {isTarget ? (
        <p className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-primary">
          <LiaStarSolid className="size-4" aria-hidden />
          المنتج الرئيسي
        </p>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="min-h-10"
          disabled={disabled}
          onClick={onMakeTarget}
          aria-label={`اجعل ${name} المنتج الرئيسي`}
        >
          <LiaStarSolid className="size-4" aria-hidden />
          اجعله المنتج الرئيسي
        </Button>
      )}
      {children}
    </section>
  );
}

const MergeProductsModal = ({
  isOpen,
  onClose,
  products,
  onSuccess,
}: MergeProductsModalProps) => {
  const [targetId, setTargetId] = useState<number>(products[0]?.id ?? 0);
  const [overrides, setOverrides] = useState<MergePlanOverrides>({});
  const [chipErrors, setChipErrors] = useState<Record<number, string[]>>({});
  const [generalErrors, setGeneralErrors] = useState<string[]>([]);
  const [storeLinkTarget, setStoreLinkTarget] = useState<MergeVariantRef | null>(
    null,
  );
  const [activeVariantId, setActiveVariantId] = useState<number | null>(null);

  const { mutate, isPending } = useMergeProducts();
  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const detailsQuery = useMergeProductDetails(productIds);

  const detailById = useMemo(
    () => new Map(detailsQuery.details.map((detail) => [detail.id, detail])),
    [detailsQuery.details],
  );
  const orderedProducts = useMemo(
    () => [
      ...products.filter((p) => p.id === targetId),
      ...products.filter((p) => p.id !== targetId),
    ],
    [products, targetId],
  );
  const targetDetail = detailById.get(targetId);
  const sourceDetails = useMemo(
    () =>
      orderedProducts
        .slice(1)
        .map((p) => detailById.get(p.id))
        .filter((detail): detail is ProductDetail => detail !== undefined),
    [orderedProducts, detailById],
  );
  const allLoaded =
    targetDetail !== undefined && sourceDetails.length === products.length - 1;

  const refs = useMemo(
    () =>
      allLoaded && targetDetail
        ? collectMergeVariants(targetDetail, sourceDetails)
        : [],
    [allLoaded, targetDetail, sourceDetails],
  );
  const refById = useMemo(
    () => new Map(refs.map((ref) => [ref.variant.id, ref])),
    [refs],
  );
  const plan = useMemo(() => resolveMergePlan(refs, overrides), [refs, overrides]);
  const collisions = useMemo(() => keptCollisions(refs, plan), [refs, plan]);
  const collidingIds = useMemo(() => new Set(collisions.flat()), [collisions]);
  const autoMerged = useMemo(() => autoMergedIds(plan, overrides), [plan, overrides]);
  const keptRefs = refs.filter((ref) => plan.get(ref.variant.id)?.action === 'KEEP');
  const nothingKept = refs.length > 0 && keptRefs.length === 0;
  const droppedCount = refs.filter(
    (ref) => plan.get(ref.variant.id)?.action === 'DROP',
  ).length;

  const labelOf = (variantId: number) => {
    const ref = refById.get(variantId);
    return ref ? variantFullLabel(ref) : `المتغير #${variantId}`;
  };

  const form = useForm<MergeFormData>({
    resolver: zodResolver(mergeSchema),
    defaultValues: {
      name: products[0]?.name ?? '',
      sku: products[0]?.sku ?? '',
      price: products[0]?.price ?? undefined,
    },
  });

  const setEntry = (variantId: number, entry: MergeVariantPlanEntry) => {
    const change = applyPlanEntry(plan, overrides, entry);
    setOverrides(change.overrides);
    setChipErrors((prev) => {
      if (!(variantId in prev)) return prev;
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
    if (change.revertedIds.length > 0) {
      toast.info(
        `لن يُدمج ${change.revertedIds.map(labelOf).join('، ')} بعد الآن، وسيبقى كمتغير منفصل`,
        { autoClose: 6000 },
      );
    }
  };

  const handleChoose = (ref: MergeVariantRef, choice: MergeChipChoice) => {
    const variantId = ref.variant.id;
    if (choice.action === 'KEEP') {
      setEntry(variantId, { variantId, action: 'KEEP' });
      return;
    }
    if (choice.action === 'MERGE_INTO') {
      setEntry(variantId, {
        variantId,
        action: 'MERGE_INTO',
        intoVariantId: choice.intoVariantId,
      });
      return;
    }
    if (!ref.variant.deletable) return;
    if (ref.variant.deleteConfirmation === 'HAS_EXTERNAL_LINK') {
      setStoreLinkTarget(ref);
      return;
    }
    setEntry(variantId, { variantId, action: 'DROP' });
  };

  const handleMakeTarget = (product: Product) => {
    setTargetId(product.id);
    setOverrides({});
    setChipErrors({});
    setGeneralErrors([]);
    const detail = detailById.get(product.id);
    form.reset({
      name: detail?.name ?? product.name,
      sku: (detail ? detail.sku : product.sku) ?? '',
      price: (detail ? detail.price : product.price) ?? undefined,
    });
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { variantId?: number } | undefined;
    setActiveVariantId(data?.variantId ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveVariantId(null);
    const dragged = event.active.data.current as { variantId?: number } | undefined;
    const over = event.over?.data.current as
      | { kind?: 'into' | 'target'; variantId?: number }
      | undefined;
    const ref = dragged?.variantId ? refById.get(dragged.variantId) : undefined;
    if (!ref || !over) return;
    if (over.kind === 'target') {
      handleChoose(ref, { action: 'KEEP' });
      return;
    }
    if (
      over.kind === 'into' &&
      over.variantId !== undefined &&
      over.variantId !== ref.variant.id &&
      plan.get(over.variantId)?.action === 'KEEP'
    ) {
      handleChoose(ref, { action: 'MERGE_INTO', intoVariantId: over.variantId });
    }
  };

  const applyServerIssues = (error: unknown) => {
    const body = mergePlanErrorBody(error);
    if (!body) {
      setGeneralErrors([
        productApiErrorMessage(error, 'حدث خطأ أثناء دمج المنتجات'),
      ]);
      return;
    }
    const byVariant: Record<number, string[]> = {};
    const general: string[] = [];
    body.details.issues.forEach((issue) => {
      const ids =
        issue.code === 'VARIANT_COMBINATION_TAKEN' && issue.variantIds
          ? issue.variantIds
          : issue.variantId !== null
            ? [issue.variantId]
            : [];
      const known = ids.filter((id) => refById.has(id));
      if (known.length === 0) {
        const message = describeMergeIssue(issue, labelOf);
        general.push(
          issue.variantId !== null
            ? `${labelOf(issue.variantId)}: ${message}`
            : message,
        );
        return;
      }
      known.forEach((id) => {
        const chipMessage = describeMergeIssue({ ...issue, variantId: id }, labelOf);
        byVariant[id] = [...(byVariant[id] ?? []), chipMessage];
      });
    });
    const hasChipErrors = Object.keys(byVariant).length > 0;
    setChipErrors(byVariant);
    setGeneralErrors([
      ...general,
      ...(hasChipErrors
        ? ['راجع المتغيرات المعلّمة بالأحمر ثم أعد المحاولة']
        : general.length === 0
          ? ['ترتيب المتغيرات غير صالح، راجعه وحاول مرة أخرى']
          : []),
    ]);
    detailsQuery.refetch();
  };

  const canSubmit =
    !isPending &&
    allLoaded &&
    products.length >= 2 &&
    collisions.length === 0 &&
    !nothingKept;

  const handleSubmit = form.handleSubmit((data) => {
    if (!targetDetail || !canSubmit) return;
    setGeneralErrors([]);
    setChipErrors({});

    const images = unionImages([targetDetail, ...sourceDetails]);
    const variantPlan = refs
      .map((ref) => plan.get(ref.variant.id))
      .filter((entry): entry is MergeVariantPlanEntry => entry !== undefined);
    const payload: MergeProductsPayload = {
      sourceProductId: sourceDetails.map((detail) => detail.id),
      name: data.name,
      sku: data.sku || undefined,
      price: data.price,
      image: targetDetail.image || images[0] || undefined,
      images: images.length > 0 ? images : undefined,
      ...(variantPlan.length > 0 && { variantPlan }),
    };
    const variantLabels = Object.fromEntries(
      refs.map((ref) => [ref.variant.id, variantFullLabel(ref)]),
    );

    mutate(
      { targetProductId: targetDetail.id, payload },
      {
        onSuccess: (response) => {
          toast.info('بدأ دمج المنتجات في الخلفية، ستظهر النتيجة عند انتهائه', {
            autoClose: 4000,
          });
          useJobStore.getState().addJob({
            jobId: response.jobId,
            type: 'MERGE',
            label: 'دمج المنتجات',
            variantLabels,
          });
          onSuccess();
          onClose();
        },
        onError: applyServerIssues,
      },
    );
  });

  const activeRef =
    activeVariantId !== null ? refById.get(activeVariantId) ?? null : null;

  const renderChips = (product: Product) => {
    const productRefs = refs.filter((ref) => ref.productId === product.id);
    if (productRefs.length === 0) {
      return <p className="text-sm text-gray-500">لا توجد متغيرات</p>;
    }
    return (
      <ul className="flex flex-col gap-2">
        {productRefs.map((ref) => {
          const entry = plan.get(ref.variant.id) ?? {
            variantId: ref.variant.id,
            action: 'KEEP' as const,
          };
          const intoRef =
            entry.action === 'MERGE_INTO' && entry.intoVariantId !== undefined
              ? refById.get(entry.intoVariantId) ?? null
              : null;
          return (
            <li key={ref.variant.id}>
              <MergeVariantChip
                variantRef={ref}
                entry={entry}
                intoRef={intoRef}
                mergeTargets={keptRefs.filter(
                  (kept) => kept.variant.id !== ref.variant.id,
                )}
                errors={chipErrors[ref.variant.id] ?? []}
                colliding={collidingIds.has(ref.variant.id)}
                autoMerged={autoMerged.has(ref.variant.id)}
                disabled={isPending}
                onChoose={(choice) => handleChoose(ref, choice)}
              />
            </li>
          );
        })}
      </ul>
    );
  };

  const mergedIntoCount = (variantId: number) =>
    refs.filter((ref) => {
      const entry = plan.get(ref.variant.id);
      return entry?.action === 'MERGE_INTO' && entry.intoVariantId === variantId;
    }).length;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="دمج المنتجات"
      showFooter={false}
      isLoading={isPending}
      maxWidth="md:max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          role="note"
          className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            رتّب متغيرات كل منتج: أبقِه في المنتج الرئيسي، أو ادمجه مع متغير آخر،
            أو احذفه. النتيجة بعد الدمج هي القائمة الظاهرة في الأسفل تماماً. يتم
            الدمج في الخلفية، وتظهر نتيجته في مؤشر المهام.
          </p>
        </div>

        {allLoaded && autoMerged.size > 0 && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              تم دمج {autoMerged.size} متغير تلقائياً لأن لها نفس القيم، راجعها قبل
              الدمج.
            </p>
          </div>
        )}

        {detailsQuery.error && !allLoaded ? (
          <ErrorState
            error={detailsQuery.error}
            fallback="تعذر تحميل متغيرات المنتجات"
            onRetry={() => detailsQuery.refetch()}
          />
        ) : !allLoaded ? (
          <PageLoading size="sm" message="جاري تحميل المتغيرات..." />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveVariantId(null)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orderedProducts.map((product) => {
                const isTarget = product.id === targetId;
                const column = (
                  <ProductColumn
                    key={product.id}
                    product={product}
                    detail={detailById.get(product.id)}
                    isTarget={isTarget}
                    disabled={isPending}
                    onMakeTarget={() => handleMakeTarget(product)}
                  >
                    {renderChips(product)}
                  </ProductColumn>
                );
                return isTarget ? (
                  <TargetColumnDropZone key={product.id} disabled={isPending}>
                    {column}
                  </TargetColumnDropZone>
                ) : (
                  column
                );
              })}
            </div>
            {ReactDOM.createPortal(
              <DragOverlay>
                {activeRef && <MergeVariantChipPreview variantRef={activeRef} />}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-fit space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
            <h4 className="text-sm font-semibold text-gray-900">
              بيانات المنتج بعد الدمج
            </h4>
            <Input
              register={form.register}
              name="name"
              label="اسم المنتج"
              placeholder="أدخل اسم المنتج..."
              error={form.formState.errors.name?.message}
            />
            <Input
              register={form.register}
              name="sku"
              label="SKU"
              placeholder="أدخل رمز المنتج..."
              error={form.formState.errors.sku?.message}
            />
            <Input
              register={form.register}
              name="price"
              label="السعر"
              type="number"
              inputMode="decimal"
              placeholder="أدخل السعر..."
              error={form.formState.errors.price?.message}
            />
          </div>

          <div className="h-fit space-y-3 rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
            <h4 className="text-sm font-semibold text-gray-900">
              المتغيرات بعد الدمج ({keptRefs.length})
            </h4>
            {allLoaded && keptRefs.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="المتغيرات بعد الدمج">
                {keptRefs.map((ref) => {
                  const merged = mergedIntoCount(ref.variant.id);
                  const colliding = collidingIds.has(ref.variant.id);
                  return (
                    <li
                      key={ref.variant.id}
                      className={clsx(
                        'inline-flex min-h-8 items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium',
                        colliding
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-primary/20 bg-primary/10 text-primary',
                      )}
                    >
                      {colliding && <AlertTriangle className="size-3" aria-hidden />}
                      {variantDisplayLabel(ref.variant)}
                      {!ref.isTarget && (
                        <span className="text-gray-500">({ref.productName})</span>
                      )}
                      {merged > 0 && (
                        <span className="text-gray-600">+{merged} مدمج</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {droppedCount > 0 && (
              <p className="text-xs text-red-600">سيُحذف {droppedCount} متغير</p>
            )}
            {collisions.length > 0 && (
              <p role="alert" className="text-xs text-red-700">
                يوجد متغيران أو أكثر بنفس القيم في النتيجة. ادمج أحدهما في الآخر أو
                احذفه قبل الدمج.
              </p>
            )}
            {nothingKept && (
              <p role="alert" className="text-xs text-red-700">
                يجب إبقاء متغير واحد على الأقل في المنتج الرئيسي.
              </p>
            )}
          </div>
        </div>

        {generalErrors.length > 0 && (
          <div
            role="alert"
            className="space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {generalErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}

        <div className="sticky -bottom-6 z-10 -mx-4 -mb-6 mt-2 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 bg-white px-4 py-3 sm:-mx-8 sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="min-h-10 px-6"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="min-h-10 flex-1 bg-primary text-white sm:flex-none sm:px-8"
          >
            {isPending ? 'جاري بدء الدمج...' : 'دمج المنتجات'}
          </Button>
        </div>
      </form>

      <DeleteVariantDialog
        variant={storeLinkTarget?.variant ?? null}
        storeLinked
        label={storeLinkTarget ? variantFullLabel(storeLinkTarget) : ''}
        onCancel={() => setStoreLinkTarget(null)}
        onConfirm={async () => {
          if (storeLinkTarget) {
            setEntry(storeLinkTarget.variant.id, {
              variantId: storeLinkTarget.variant.id,
              action: 'DROP',
              confirmStoreLink: true,
            });
          }
          setStoreLinkTarget(null);
        }}
      />
    </BaseModal>
  );
};

export default MergeProductsModal;
