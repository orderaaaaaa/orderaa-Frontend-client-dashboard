'use client';

import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { CheckCircle2, Info, PackageX } from 'lucide-react';
import { Breadcrumb } from '@/components/dashboard-layout/Breadcrumb';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import { FIXED_BOTTOM_BAR_CLASS } from '@/constants/dashboard-layout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';
import { uploadFile } from '@/lib/api/upload';
import { useProductAttributeOptionsQuery } from '@/services/products';
import {
  useDeleteVariant,
  usePatchProduct,
  useProductDetail,
  useUpdateProductAttributes,
  useUpdateProductSpecifications,
  useUpsertVariants,
} from '../../hooks/useProduct';
import { productKeys } from '../../hooks/queryKeys';
import type { ProductDetail, ProductDetailVariant } from '../../types/products';
import {
  productApiErrorBody,
  productApiErrorMessage,
} from '../../utils/productApiError';
import { CompactField } from '../CompactField';
import { EditorSection } from './EditorSection';
import { ProductImagesField } from './ProductImagesField';
import { AttributesEditor } from './AttributesEditor';
import { VariantsEditor } from './VariantsEditor';
import { SpecificationsEditor } from './SpecificationsEditor';
import { DeleteVariantDialog } from './DeleteVariantDialog';
import {
  type AttributeDraft,
  type BasicDraft,
  type GalleryItem,
  type NewVariantRow,
  type SpecRow,
  type VariantEdit,
  attributesFromDetail,
  basicFromDetail,
  buildAttributesPayload,
  buildScalarsPayload,
  buildSpecsPayload,
  buildVariantPlan,
  existingRowKey,
  galleryFromDetail,
  galleryUrls,
  hasAttributeErrors,
  hasSpecErrors,
  isStoreLinked,
  sameAttributes,
  sameBasic,
  sameGallery,
  sameSpecs,
  sameVariantEdit,
  specsFromDetail,
  validateAttributes,
  validateBasic,
  validateSpecs,
  validateVariants,
  variantEditFromDetail,
} from './editorModel';

const PRODUCTS_HREF = '/dashboard/products';

type SectionKey = 'basic' | 'images' | 'attributes' | 'variants' | 'specifications';

const SECTION_IDS: Record<SectionKey, string> = {
  basic: 'product-basic',
  images: 'product-images',
  attributes: 'product-attributes',
  variants: 'product-variants',
  specifications: 'product-specifications',
};

const scrollToSection = (key: SectionKey) => {
  document
    .getElementById(SECTION_IDS[key])
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const variantLabelOf = (variant: ProductDetailVariant) =>
  variant.labels.length === 0
    ? 'المنتج بدون خصائص'
    : variant.labels.map((label) => label.option).join(' / ');

function CurationNotice({ detail }: { detail: ProductDetail }) {
  if (!isStoreLinked(detail)) return null;
  if (detail.merchantCuratedAt) {
    return (
      <div
        role="status"
        className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
      >
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>نسختك محفوظة — المزامنة لا تغيّر الاسم والسعر والصور</span>
      </div>
    );
  }
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>سيتم حفظ نسختك ولن تستبدلها المزامنة بعد أول حفظ</span>
    </div>
  );
}

interface ProductEditorProps {
  productId: number;
}

export function ProductEditor({ productId }: ProductEditorProps) {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissionCheck();
  const canUpdate = hasPermission(PERMISSIONS.PRODUCTS_UPDATE);
  const { data: detail, isLoading, isError, error, refetch } =
    useProductDetail(productId);
  const { data: attributeOptions } = useProductAttributeOptionsQuery(productId);

  const patchProduct = usePatchProduct(productId);
  const updateAttributes = useUpdateProductAttributes(productId);
  const upsertVariants = useUpsertVariants(productId);
  const updateSpecifications = useUpdateProductSpecifications(productId);
  const deleteVariant = useDeleteVariant(productId);

  const [basicDraft, setBasicDraft] = useState<BasicDraft | null>(null);
  const [galleryDraft, setGalleryDraft] = useState<GalleryItem[] | null>(null);
  const [attributesDraft, setAttributesDraft] = useState<AttributeDraft[] | null>(null);
  const [variantEdits, setVariantEdits] = useState<Record<number, VariantEdit>>({});
  const [newVariantRows, setNewVariantRows] = useState<NewVariantRow[]>([]);
  const [specsDraft, setSpecsDraft] = useState<SpecRow[] | null>(null);

  const [showErrors, setShowErrors] = useState(false);
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<SectionKey, string>>>({});
  const [skuServerError, setSkuServerError] = useState<string | undefined>();
  const [invalidImageUrls, setInvalidImageUrls] = useState<string[]>([]);
  const [variantServerErrors, setVariantServerErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductDetailVariant | null>(null);

  const displayNames = useMemo(
    () =>
      new Map(
        (attributeOptions?.options ?? []).map((group) => [
          group.id,
          group.displayName,
        ]),
      ),
    [attributeOptions],
  );

  const state = useMemo(() => {
    if (!detail) return null;
    const basic = basicDraft ?? basicFromDetail(detail);
    const gallery = galleryDraft ?? galleryFromDetail(detail);
    const attributes = attributesDraft ?? attributesFromDetail(detail);
    const specs = specsDraft ?? specsFromDetail(detail);
    const basicDirty = !sameBasic(basic, basicFromDetail(detail));
    const galleryDirty = !sameGallery(gallery, detail);
    const attributesDirty = !sameAttributes(attributes, attributesFromDetail(detail));
    const variantsDirty =
      newVariantRows.length > 0 ||
      detail.variants.some((variant) => {
        const edit = variantEdits[variant.id];
        return !!edit && !sameVariantEdit(edit, variantEditFromDetail(variant));
      });
    const specsDirty = !sameSpecs(specs, specsFromDetail(detail));
    return {
      basic,
      gallery,
      attributes,
      specs,
      basicDirty,
      galleryDirty,
      attributesDirty,
      variantsDirty,
      specsDirty,
      basicErrors: validateBasic(basic, detail),
      attributeErrors: validateAttributes(attributes, detail.attributes.length),
      variantErrors: validateVariants(detail, variantEdits, newVariantRows),
      specErrors: validateSpecs(specs),
    };
  }, [
    detail,
    basicDraft,
    galleryDraft,
    attributesDraft,
    variantEdits,
    newVariantRows,
    specsDraft,
  ]);

  const isDirty =
    !!state &&
    (state.basicDirty ||
      state.galleryDirty ||
      state.attributesDirty ||
      state.variantsDirty ||
      state.specsDirty);

  const guard = useUnsavedChangesGuard(isDirty);

  if (isLoading) {
    return <PageLoading message="جارٍ تحميل المنتج..." />;
  }

  if (isError || !detail || !state) {
    const notFound =
      productApiErrorBody(error)?.code === 'PRODUCT_NOT_FOUND' ||
      (error as { response?: { status?: number } } | null)?.response?.status === 404;
    return (
      <div className="p-4">
        {notFound ? (
          <EmptyState
            icon={<PackageX className="size-10 text-gray-300" aria-hidden />}
            title="المنتج غير موجود"
            description="ربما تم حذفه أو دمجه في منتج آخر"
            action={
              <Button asChild variant="outline" className="min-h-10">
                <Link href={PRODUCTS_HREF}>العودة إلى المنتجات</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState
            error={error}
            fallback="تعذر تحميل المنتج"
            onRetry={() => refetch()}
          />
        )}
      </div>
    );
  }

  const variantRowErrors = {
    ...(showErrors ? state.variantErrors : {}),
    ...variantServerErrors,
  };
  const fieldsDisabled = isSaving || !canUpdate;

  const freshDetail = () =>
    queryClient.getQueryData<ProductDetail>(productKeys.detail(productId)) ??
    detail;

  const failSection = (key: SectionKey, message: string) => {
    setSectionErrors((current) => ({ ...current, [key]: message }));
    scrollToSection(key);
  };

  const saveProductScalars = async () => {
    let images: string[] | undefined;
    if (state.galleryDirty) {
      let uploaded: GalleryItem[];
      try {
        uploaded = await Promise.all(
          state.gallery.map(async (item): Promise<GalleryItem> => {
            if (item.kind === 'url') return item;
            const { url } = await uploadFile(item.file);
            return { key: item.key, kind: 'url', url };
          }),
        );
      } catch {
        toast.error('تعذر رفع الصور، حاول مرة أخرى');
        failSection('images', 'تعذر رفع الصور، حاول مرة أخرى');
        return false;
      }
      setGalleryDraft(uploaded);
      images = galleryUrls(uploaded);
    }
    try {
      await patchProduct.mutateAsync(
        buildScalarsPayload(state.basic, detail, images),
      );
    } catch (saveError) {
      const body = productApiErrorBody(saveError);
      const message = productApiErrorMessage(saveError, 'تعذر حفظ بيانات المنتج');
      if (body?.code === 'IMAGE_URL_INVALID') {
        setInvalidImageUrls(body.details?.values ?? []);
        failSection('images', message);
      } else if (body?.code === 'SKU_TAKEN') {
        setSkuServerError(message);
        failSection('basic', message);
      } else {
        failSection('basic', message);
      }
      return false;
    }
    setBasicDraft(null);
    setGalleryDraft(null);
    return true;
  };

  const saveAttributes = async () => {
    try {
      await updateAttributes.mutateAsync({
        attributes: buildAttributesPayload(state.attributes),
      });
    } catch (saveError) {
      failSection(
        'attributes',
        productApiErrorMessage(saveError, 'تعذر حفظ الخصائص'),
      );
      return false;
    }
    setAttributesDraft(null);
    return true;
  };

  const saveVariants = async () => {
    const plan = buildVariantPlan(freshDetail(), variantEdits, newVariantRows);
    if (plan.payload.length === 0) {
      setVariantEdits({});
      setNewVariantRows([]);
      return true;
    }
    try {
      await upsertVariants.mutateAsync({ variants: plan.payload });
    } catch (saveError) {
      const body = productApiErrorBody(saveError);
      const message = productApiErrorMessage(saveError, 'تعذر حفظ المتغيرات');
      const rowErrors: Record<string, string> = {};
      const index = body?.details?.variantIndex;
      if (index !== undefined && plan.rows[index]) {
        rowErrors[plan.rows[index].key] = message;
      }
      const values = body?.details?.values ?? [];
      if (values.length > 0) {
        plan.payload.forEach((entry, entryIndex) => {
          if (
            (entry.sku && values.includes(entry.sku)) ||
            (entry.barcode && values.includes(entry.barcode))
          ) {
            rowErrors[plan.rows[entryIndex].key] = message;
          }
        });
      }
      setVariantServerErrors(rowErrors);
      failSection('variants', message);
      return false;
    }
    setVariantEdits({});
    setNewVariantRows([]);
    return true;
  };

  const saveSpecifications = async () => {
    try {
      await updateSpecifications.mutateAsync(buildSpecsPayload(state.specs));
    } catch (saveError) {
      failSection(
        'specifications',
        productApiErrorMessage(saveError, 'تعذر حفظ المواصفات'),
      );
      return false;
    }
    setSpecsDraft(null);
    return true;
  };

  const handleSave = async () => {
    if (!isDirty || isSaving) return;
    setShowErrors(true);
    setSectionErrors({});
    setSkuServerError(undefined);
    setInvalidImageUrls([]);
    setVariantServerErrors({});

    const invalid: SectionKey[] = [];
    if (state.basicDirty && Object.keys(state.basicErrors).length > 0) invalid.push('basic');
    if (state.attributesDirty && hasAttributeErrors(state.attributeErrors)) invalid.push('attributes');
    if (state.variantsDirty && Object.keys(state.variantErrors).length > 0) invalid.push('variants');
    if (state.specsDirty && hasSpecErrors(state.specErrors)) invalid.push('specifications');
    if (invalid.length > 0) {
      const errors: Partial<Record<SectionKey, string>> = {};
      invalid.forEach((key) => {
        errors[key] =
          key === 'attributes' && state.attributeErrors.section
            ? state.attributeErrors.section
            : 'راجع الحقول المحددة في هذا القسم';
      });
      setSectionErrors(errors);
      scrollToSection(invalid[0]);
      toast.error('راجع الحقول المحددة قبل الحفظ');
      return;
    }

    setIsSaving(true);
    try {
      if ((state.basicDirty || state.galleryDirty) && !(await saveProductScalars())) return;
      if (state.attributesDirty && !(await saveAttributes())) return;
      if (state.variantsDirty && !(await saveVariants())) return;
      if (state.specsDirty && !(await saveSpecifications())) return;
      setShowErrors(false);
      toast.success('تم حفظ التغييرات');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const storeLinked = target.deleteConfirmation === 'HAS_EXTERNAL_LINK';
    try {
      await deleteVariant.mutateAsync({
        variantId: target.id,
        confirmStoreLink: storeLinked,
      });
    } catch (deleteError) {
      if (
        productApiErrorBody(deleteError)?.code ===
        'VARIANT_STORE_LINK_CONFIRMATION_REQUIRED'
      ) {
        setDeleteTarget({ ...target, deleteConfirmation: 'HAS_EXTERNAL_LINK' });
        return;
      }
      setDeleteTarget(null);
      return;
    }
    setVariantEdits((current) => {
      const next = { ...current };
      delete next[target.id];
      return next;
    });
    setDeleteTarget(null);
    toast.success(
      storeLinked
        ? 'تم حذف المتغير، ولن تعيده مزامنة المتجر'
        : 'تم حذف المتغير',
    );
  };

  const productImage = detail.image ?? detail.images[0];

  return (
    <div className="p-4 pb-36 space-y-4">
      <Breadcrumb
        items={[
          { title: 'المنتجات', href: PRODUCTS_HREF },
          { title: 'تعديل المنتج' },
        ]}
      />

      <div className="flex items-center gap-3 min-w-0">
        {productImage && (
          <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border">
            <Image
              src={productImage}
              alt={detail.name}
              fill
              sizes="56px"
              className="object-cover"
              unoptimized
            />
          </span>
        )}
        <h1 className="min-w-0 break-words text-xl sm:text-2xl font-bold text-gray-900">
          {detail.name}
        </h1>
      </div>

      <CurationNotice detail={detail} />

      {!canUpdate && (
        <div
          role="status"
          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
        >
          ليس لديك صلاحية تعديل المنتجات، يمكنك الاطلاع فقط.
        </div>
      )}

      <EditorSection
        id={SECTION_IDS.basic}
        title="البيانات الأساسية"
        error={sectionErrors.basic}
        dirty={state.basicDirty}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CompactField
            label="اسم المنتج"
            className="sm:col-span-2"
            value={state.basic.name}
            disabled={fieldsDisabled}
            error={showErrors ? state.basicErrors.name : undefined}
            onChange={(event) =>
              setBasicDraft({ ...state.basic, name: event.target.value })
            }
          />
          <CompactField
            label="SKU"
            value={state.basic.sku}
            disabled={fieldsDisabled}
            error={skuServerError}
            onChange={(event) => {
              setSkuServerError(undefined);
              setBasicDraft({ ...state.basic, sku: event.target.value });
            }}
          />
          <CompactField
            label="السعر"
            type="number"
            inputMode="decimal"
            min={0}
            value={state.basic.price}
            disabled={fieldsDisabled}
            error={showErrors ? state.basicErrors.price : undefined}
            onChange={(event) =>
              setBasicDraft({ ...state.basic, price: event.target.value })
            }
          />
        </div>
      </EditorSection>

      <EditorSection
        id={SECTION_IDS.images}
        title="الصور"
        error={sectionErrors.images}
        dirty={state.galleryDirty}
      >
        <ProductImagesField
          items={state.gallery}
          onChange={(items) => {
            setInvalidImageUrls([]);
            setGalleryDraft(items);
          }}
          invalidUrls={invalidImageUrls}
          disabled={fieldsDisabled}
        />
      </EditorSection>

      <EditorSection
        id={SECTION_IDS.attributes}
        title="الخصائص والمتغيرات"
        description="الخصائص أولاً، ثم تفاصيل كل متغير"
        error={sectionErrors.attributes}
        dirty={state.attributesDirty || state.variantsDirty}
      >
        <div className="space-y-6">
          <AttributesEditor
            attributes={state.attributes}
            onChange={setAttributesDraft}
            errors={state.attributeErrors}
            showErrors={showErrors}
            displayNames={displayNames}
            disabled={fieldsDisabled}
          />
          <div id={SECTION_IDS.variants} className="scroll-mt-24 space-y-3 border-t border-gray-100 pt-4">
            <h3 className="text-base font-semibold text-gray-900">المتغيرات</h3>
            {sectionErrors.variants && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {sectionErrors.variants}
              </div>
            )}
            <VariantsEditor
              detail={detail}
              edits={variantEdits}
              onEdit={(variantId, edit) => {
                setVariantServerErrors((current) => {
                  const next = { ...current };
                  delete next[existingRowKey(variantId)];
                  return next;
                });
                setVariantEdits((current) => ({ ...current, [variantId]: edit }));
              }}
              newRows={newVariantRows}
              onNewRowsChange={setNewVariantRows}
              rowErrors={variantRowErrors}
              attributesDirty={state.attributesDirty}
              imageChoices={detail.images}
              onDelete={setDeleteTarget}
              deletingId={deleteVariant.isPending ? deleteVariant.variables?.variantId ?? null : null}
              disabled={fieldsDisabled}
            />
          </div>
        </div>
      </EditorSection>

      <EditorSection
        id={SECTION_IDS.specifications}
        title="المواصفات"
        description="معلومات ثابتة عن المنتج كله، مثل الخامة"
        error={sectionErrors.specifications}
        dirty={state.specsDirty}
      >
        <SpecificationsEditor
          rows={state.specs}
          onChange={setSpecsDraft}
          errors={state.specErrors}
          showErrors={showErrors}
          disabled={fieldsDisabled}
        />
      </EditorSection>

      <div
        className={`${FIXED_BOTTOM_BAR_CLASS} border-t border-gray-200 bg-white px-4 pt-3 shadow-lg`}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p
            className={`text-sm ${isDirty ? 'text-amber-700' : 'text-gray-500'}`}
            aria-live="polite"
          >
            {isSaving
              ? 'جارٍ الحفظ...'
              : isDirty
                ? 'لديك تغييرات غير محفوظة'
                : 'لا توجد تغييرات'}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-10"
              disabled={isSaving}
              onClick={() => guard.requestNavigation(PRODUCTS_HREF)}
            >
              رجوع
            </Button>
            <Button
              type="button"
              className="min-h-10 min-w-32"
              disabled={!isDirty || isSaving || !canUpdate}
              loading={isSaving}
              loadingText="جارٍ الحفظ..."
              onClick={() => void handleSave()}
            >
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </div>

      <DeleteVariantDialog
        variant={deleteTarget}
        storeLinked={deleteTarget?.deleteConfirmation === 'HAS_EXTERNAL_LINK'}
        label={deleteTarget ? variantLabelOf(deleteTarget) : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <UnsavedChangesDialog
        isOpen={guard.pendingHref !== null}
        onStay={guard.cancelLeave}
        onLeave={guard.confirmLeave}
      />
    </div>
  );
}
