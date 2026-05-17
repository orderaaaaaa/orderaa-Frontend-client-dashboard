'use client';

import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import {
  LiaGripVerticalSolid,
  LiaStarSolid,
  LiaTimesSolid,
} from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Product, VariantOption } from '../../types/products';
import { useMergeProducts } from '../../hooks/useMergeProducts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import clsx from 'clsx';

const mergeSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  sku: z.string().optional(),
  price: z.coerce.number().min(0, 'السعر يجب أن يكون 0 أو أكثر').optional(),
});

type MergeFormData = z.infer<typeof mergeSchema>;

interface MergeProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSuccess: () => void;
}

function SortableProductCard({
  product,
  isOverlay,
}: {
  product: Product;
  isOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 select-none',
        isDragging && !isOverlay && 'opacity-30',
        isOverlay && 'shadow-xl border-primary ring-2 ring-primary/20',
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing h-8 w-8 text-gray-400 hover:text-gray-600 touch-none"
      >
        <LiaGripVerticalSolid className="w-5 h-5" />
      </Button>
      <img
        src={
          product.image ||
          product.images?.[0] ||
          'https://placehold.net/600x600.png'
        }
        alt={product.name}
        className="w-10 h-10 rounded-md object-cover border border-gray-100"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {product.name}
        </p>
        <p className="text-xs text-gray-500">
          {product.sku && `SKU: ${product.sku} · `}
          {product.price} ج.م
        </p>
      </div>
    </div>
  );
}

function TargetDropZone({
  targetProduct,
  onRemove,
}: {
  targetProduct: Product | null;
  onRemove: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'target-zone' });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'rounded-xl border-2 border-dashed p-4 transition-colors min-h-[80px] flex items-center justify-center',
        isOver && !targetProduct && 'border-primary bg-primary/5',
        targetProduct
          ? 'border-primary/30 bg-primary/5'
          : 'border-gray-300 bg-gray-50',
      )}
    >
      {targetProduct ? (
        <div className="flex items-center gap-3 w-full">
          <LiaStarSolid className="w-5 h-5 text-primary flex-shrink-0" />
          <img
            src={
              targetProduct.image ||
              targetProduct.images?.[0] ||
              'https://placehold.net/600x600.png'
            }
            alt={targetProduct.name}
            className="w-10 h-10 rounded-md object-cover border border-gray-100"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {targetProduct.name}
            </p>
            <p className="text-xs text-gray-500">
              {targetProduct.sku && `SKU: ${targetProduct.sku} · `}
              {targetProduct.price} ج.م
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <LiaTimesSolid className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">اسحب المنتج الرئيسي هنا</p>
      )}
    </div>
  );
}

const MergeProductsModal = ({
  isOpen,
  onClose,
  products,
  onSuccess,
}: MergeProductsModalProps) => {
  const [targetProduct, setTargetProduct] = useState<Product | null>(
    products[0] ?? null
  );
  const [sourceProducts, setSourceProducts] = useState<Product[]>(
    products.slice(1)
  );
  const [activeId, setActiveId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const { mutate, isPending } = useMergeProducts();

  const form = useForm<MergeFormData>({
    resolver: zodResolver(mergeSchema),
    defaultValues: {
      name: products[0]?.name ?? '',
      sku: products[0]?.sku ?? '',
      price: products[0]?.price ?? undefined,
    },
  });

  const mergedVariants = useMemo(() => {
    const LABEL_ALIASES: Record<string, string> = {
      size: 'المقاسات',
      sizes: 'المقاسات',
      المقاس: 'المقاسات',
      المقاسات: 'المقاسات',
      color: 'الألوان',
      colors: 'الألوان',
      اللون: 'الألوان',
      الألوان: 'الألوان',
      الالوان: 'الألوان',
    };

    const normalizeLabel = (label: string) => {
      const lower = label.toLowerCase().trim();
      return LABEL_ALIASES[lower] ?? label;
    };

    const allProducts = targetProduct
      ? [targetProduct, ...sourceProducts]
      : sourceProducts;
    const variantMap = new Map<string, Set<string>>();

    allProducts.forEach((p) => {
      (p.variantOptions ?? []).forEach((v) => {
        const normalized = normalizeLabel(v.label);
        const existing = variantMap.get(normalized);
        if (existing) {
          v.values.forEach((val) => existing.add(val));
        } else {
          variantMap.set(normalized, new Set(v.values));
        }
      });
    });

    const result: VariantOption[] = [];
    variantMap.forEach((values, label) => {
      result.push({ label, values: Array.from(values) });
    });
    return result;
  }, [targetProduct, sourceProducts]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );


  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedId = Number(active.id);

    if (over.id === 'target-zone') {
      const draggedProduct = sourceProducts.find((p) => p.id === draggedId);
      if (!draggedProduct) return;

      const newSources = sourceProducts.filter((p) => p.id !== draggedId);
      if (targetProduct) {
        newSources.push(targetProduct);
      }

      setTargetProduct(draggedProduct);
      setSourceProducts(newSources);
      form.reset({
        name: draggedProduct.name,
        sku: draggedProduct.sku || '',
        price: draggedProduct.price,
      });
    }
  };

  const handleRemoveTarget = () => {
    if (targetProduct) {
      setSourceProducts((prev) => [...prev, targetProduct]);
      setTargetProduct(null);
      form.reset({ name: '', sku: '', price: undefined });
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    if (!targetProduct) return;
    setError('');

    const sourceIds = sourceProducts.map((p) => p.id);

    mutate(
      {
        targetProductId: targetProduct.id,
        payload: {
          sourceProductId: sourceIds,
          name: data.name,
          sku: data.sku || undefined,
          price: data.price,
          image: targetProduct.image || undefined,
          images: targetProduct.images?.length ? targetProduct.images : undefined,
          //variants: mergedVariants.length > 0 ? mergedVariants : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('تم دمج المنتجات بنجاح');
          onSuccess();
          onClose();
        },
        onError: (err: any) => {
          setError(
            err?.response?.data?.message || 'حدث خطأ أثناء دمج المنتجات',
          );
        },
      },
    );
  });

  const activeProduct = activeId
    ? sourceProducts.find((p) => p.id === activeId) || null
    : null;

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="overflow-hidden rounded-xl">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    المنتج الرئيسي
                  </h4>
                  <TargetDropZone
                    targetProduct={targetProduct}
                    onRemove={handleRemoveTarget}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    المنتجات المدمجة ({sourceProducts.length})
                  </h4>
                  {sourceProducts.length > 0 ? (
                    <SortableContext
                      items={sourceProducts.map((p) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {sourceProducts.map((product) => (
                          <SortableProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </SortableContext>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                      <p className="text-sm text-gray-400">
                        جميع المنتجات تم اختيارها كمنتج رئيسي
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {ReactDOM.createPortal(
                <DragOverlay>
                  {activeProduct && (
                    <SortableProductCard product={activeProduct} isOverlay />
                  )}
                </DragOverlay>,
                document.body,
              )}
            </DndContext>
          </div>

          <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100 h-fit">
            <h4 className="text-sm font-semibold text-gray-900">
              بيانات المنتج بعد الدمج
            </h4>
            {targetProduct ? (
              <>
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
                  placeholder="أدخل السعر..."
                  error={form.formState.errors.price?.message}
                />
                {mergedVariants.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                      المتغيرات بعد الدمج
                    </h4>
                    {mergedVariants.map((variant) => (
                      <div key={variant.label} className="space-y-1.5">
                        <p className="text-xs font-medium text-gray-600">
                          {variant.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {variant.values.map((val) => (
                            <span
                              key={val}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                اختر المنتج الرئيسي أولاً
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={
              isPending || !targetProduct || sourceProducts.length === 0
            }
            className="flex-1 bg-primary text-white h-10"
          >
            {isPending ? 'جاري الدمج...' : 'دمج المنتجات'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="h-10 px-6"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default MergeProductsModal;
