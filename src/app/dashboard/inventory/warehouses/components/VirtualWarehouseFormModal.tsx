'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { LiaPlusSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSwitch } from '@/components/ui/form-switch';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import {
  VIRTUAL_WAREHOUSE_ERROR_CODES,
  VIRTUAL_WAREHOUSE_TERM_KINDS,
  type PreviewVirtualWarehouseDto,
  type VirtualWarehouse,
  type VirtualWarehousePreset,
  type VirtualWarehouseTermInvalidReason,
} from '@/lib/api/virtualWarehouses';
import { useStockProducts } from '@/services/stock';
import {
  useCreateVirtualWarehouseMutation,
  useUpdateVirtualWarehouseMutation,
  useVirtualWarehousePresetsQuery,
  useVirtualWarehousePreviewQuery,
} from '@/services/virtualWarehouses';
import {
  useWarehouseOptions,
  type WarehouseOption,
} from '@/services/warehouses';
import { OrderStatus } from '@/types/orders';
import { getApiErrorMessage } from '@/utils/apiError';
import { useDebounce } from '@/utils/debounce';
import {
  MAX_VIRTUAL_WAREHOUSE_TERMS,
  emptyVirtualWarehouseForm,
  emptyWarehouseTerm,
  formTermToInput,
  presetToFormTerms,
  termToFormData,
  virtualWarehouseFormSchema,
  virtualWarehouseTermsSchema,
  type VirtualWarehouseFormData,
  type VirtualWarehouseTermFormData,
} from '../schemas/virtualWarehouse';
import { formatVirtualTerm } from '../utils/formatVirtualFormula';
import { expandRange } from '../utils/ruleMatching';
import { VirtualTermRow, type VirtualTermRowErrors } from './VirtualTermRow';

interface VirtualWarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: VirtualWarehouse | null;
}

interface ApiErrorBody {
  code?: string;
  position?: number | null;
  reason?: VirtualWarehouseTermInvalidReason;
}

interface ServerTermError {
  position: number | null;
  message: string;
}

const TERM_REASON_MESSAGES: Record<VirtualWarehouseTermInvalidReason, string> = {
  EMPTY_TERMS: 'أضف بندًا واحدًا على الأقل',
  TOO_MANY_TERMS: 'الحد الأقصى 20 بندًا',
  INVALID_SIGN: 'الإشارة يجب أن تكون + أو −',
  SHAPE: 'بيانات البند غير مكتملة',
  RANGE_REVERSED: 'بداية النطاق بعد نهايته',
  EXCLUSION_OUTSIDE_RANGE: 'الحالات المستثناة يجب أن تكون داخل النطاق',
  DUPLICATE_WAREHOUSE: 'هذا المخزن مستخدم في بند آخر',
};

const PREVIEW_DEBOUNCE_MS = 400;

const readErrorBody = (err: unknown): ApiErrorBody | undefined =>
  (err as { response?: { data?: ApiErrorBody } })?.response?.data;

const statusLabel = (status: OrderStatus) =>
  ORDER_STATUS_ARABIC_LABELS[status] ?? status;

export function VirtualWarehouseFormModal({
  isOpen,
  onClose,
  warehouse,
}: VirtualWarehouseFormModalProps) {
  const isEdit = warehouse !== null;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm<VirtualWarehouseFormData>({
    resolver: zodResolver(virtualWarehouseFormSchema),
    defaultValues: emptyVirtualWarehouseForm(),
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'terms',
  });

  const terms = useWatch({ control, name: 'terms' });
  const isActive = useWatch({ control, name: 'isActive' });

  const { options: warehouseOptions } = useWarehouseOptions();
  const { data: presets } = useVirtualWarehousePresetsQuery({
    enabled: isOpen,
  });
  const createMutation = useCreateVirtualWarehouseMutation();
  const updateMutation = useUpdateVirtualWarehouseMutation();

  const [activePreset, setActivePreset] =
    useState<VirtualWarehousePreset | null>(null);
  const [serverTermError, setServerTermError] =
    useState<ServerTermError | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActivePreset(null);
    setServerTermError(null);
    reset(
      warehouse
        ? {
            name: warehouse.name,
            isActive: warehouse.isActive,
            terms: [...warehouse.terms]
              .sort((a, b) => a.position - b.position)
              .map(termToFormData),
          }
        : emptyVirtualWarehouseForm()
    );
  }, [isOpen, warehouse, reset]);

  const presetOptions = useMemo(
    () => (presets ?? []).map((preset) => ({ key: preset.key, value: preset.name })),
    [presets]
  );

  const patchTerm = (
    index: number,
    patch: Partial<VirtualWarehouseTermFormData>
  ) => {
    const current = terms[index];
    if (!current) return;
    setValue(`terms.${index}`, { ...current, ...patch }, {
      shouldDirty: true,
      shouldValidate: isSubmitted,
    });
    setServerTermError(null);
    if (isSubmitted) void trigger('terms');
  };

  const applyPreset = (key: string) => {
    const preset = (presets ?? []).find((item) => item.key === key);
    if (!preset) return;
    replace(presetToFormTerms(preset));
    setActivePreset(preset);
    setServerTermError(null);
  };

  const rangeTermIndexFor = (status: OrderStatus) =>
    terms.findIndex(
      (term) =>
        term.kind === VIRTUAL_WAREHOUSE_TERM_KINDS.STATUS_RANGE &&
        term.rangeStart &&
        term.rangeEnd &&
        expandRange(term.rangeStart, term.rangeEnd).includes(status)
    );

  const toggleOptionalExclusion = (status: OrderStatus, checked: boolean) => {
    const index = rangeTermIndexFor(status);
    if (index < 0) return;
    const current = terms[index].excludedStatuses;
    const next = checked
      ? Array.from(new Set([...current, status]))
      : current.filter((item) => item !== status);
    patchTerm(index, { excludedStatuses: next });
  };

  const termErrors = (index: number): VirtualTermRowErrors => {
    const fieldErrors = errors.terms?.[index];
    return {
      warehouseId: fieldErrors?.warehouseId?.message,
      rangeStart: fieldErrors?.rangeStart?.message,
      excludedStatuses: fieldErrors?.excludedStatuses?.message,
      server:
        serverTermError?.position === index
          ? serverTermError.message
          : undefined,
    };
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerTermError(null);
    const body = {
      name: values.name.trim(),
      isActive: values.isActive,
      terms: values.terms.map(formTermToInput),
    };

    try {
      if (warehouse) {
        await updateMutation.mutateAsync({ id: warehouse.id, body });
        toast.success('تم تحديث المخزن الافتراضي');
      } else {
        await createMutation.mutateAsync(body);
        toast.success('تم إنشاء المخزن الافتراضي');
      }
      onClose();
    } catch (err: unknown) {
      const data = readErrorBody(err);
      const message = getApiErrorMessage(err, 'تعذر حفظ المخزن الافتراضي');

      if (data?.code === VIRTUAL_WAREHOUSE_ERROR_CODES.TERMS_INVALID) {
        setServerTermError({
          position: data.position ?? null,
          message: data.reason ? TERM_REASON_MESSAGES[data.reason] : message,
        });
        return;
      }

      if (data?.code === VIRTUAL_WAREHOUSE_ERROR_CODES.NAME_TAKEN) {
        setError('name', { type: 'server', message });
        return;
      }

      toast.error(message);
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const termsRootError =
    errors.terms?.root?.message ?? errors.terms?.message ?? undefined;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'تعديل المخزن الافتراضي' : 'إضافة مخزن افتراضي'}
      confirmText="حفظ"
      onConfirm={onSubmit}
      isLoading={isSaving}
      maxWidth="md:max-w-[900px]"
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="اسم المخزن الافتراضي"
              required
              name="name"
              register={register}
              error={errors.name?.message}
              placeholder="مثال: متاح للكول سنتر"
            />
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
            <span className="text-sm font-medium text-gray-700">نشط</span>
            <FormSwitch
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('isActive', checked, { shouldDirty: true })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">بنود المعادلة</p>
            <div className="w-56">
              <SearchableSelect
                options={presetOptions}
                value={activePreset?.key ?? ''}
                onValueChange={applyPreset}
                placeholder="استخدام قالب"
                emptyMessage="لا توجد قوالب"
                searchThreshold={10}
              />
            </div>
          </div>

          {activePreset && activePreset.optionalExclusions.length > 0 && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="mb-2 text-xs font-medium text-blue-700">
                استثناءات اختيارية
              </p>
              <div className="flex flex-wrap gap-4">
                {activePreset.optionalExclusions.map((status) => {
                  const index = rangeTermIndexFor(status);
                  const checked =
                    index >= 0 && terms[index].excludedStatuses.includes(status);
                  return (
                    <label
                      key={status}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Checkbox
                        checked={checked}
                        disabled={index < 0}
                        onCheckedChange={(next) =>
                          toggleOptionalExclusion(status, next === true)
                        }
                      />
                      {statusLabel(status)}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {fields.map((field, index) =>
              terms[index] ? (
                <VirtualTermRow
                  key={field.id}
                  index={index}
                  term={terms[index]}
                  warehouseOptions={warehouseOptions}
                  errors={termErrors(index)}
                  canRemove={fields.length > 1}
                  onChange={(patch) => patchTerm(index, patch)}
                  onRemove={() => {
                    remove(index);
                    setServerTermError(null);
                  }}
                />
              ) : null
            )}
          </div>

          {(termsRootError ||
            (serverTermError && serverTermError.position === null)) && (
            <p className="text-xs text-red-600">
              {termsRootError ?? serverTermError?.message}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={fields.length >= MAX_VIRTUAL_WAREHOUSE_TERMS}
            onClick={() => append(emptyWarehouseTerm())}
          >
            <LiaPlusSolid className="ml-1 size-4" />
            إضافة بند
          </Button>
        </div>

        <VirtualWarehousePreviewPanel
          terms={terms}
          isOpen={isOpen}
          warehouseOptions={warehouseOptions}
        />
      </div>
    </BaseModal>
  );
}

interface PreviewPanelProps {
  terms: VirtualWarehouseTermFormData[];
  isOpen: boolean;
  warehouseOptions: WarehouseOption[];
}

function VirtualWarehousePreviewPanel({
  terms,
  isOpen,
  warehouseOptions,
}: PreviewPanelProps) {
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState<number | null>(null);
  const [variantId, setVariantId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setProductId(null);
      setVariantId(null);
      setSearch('');
    }
  }, [isOpen]);

  const { data: productsPage, isLoading: productsLoading } = useStockProducts({
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
  });
  const products = useMemo(() => productsPage?.data ?? [], [productsPage]);

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        key: String(product.id),
        value: product.name,
      })),
    [products]
  );

  const variantOptions = useMemo(() => {
    const product = products.find((item) => item.id === productId);
    if (!product) return [];
    return product.variants.map((variant) => ({
      key: String(variant.id),
      value:
        variant.options.map((pair) => pair.option.name).join(' / ') ||
        variant.combinationKey,
    }));
  }, [products, productId]);

  const previewBody = useMemo<PreviewVirtualWarehouseDto | null>(() => {
    if (variantId === null) return null;
    const parsed = virtualWarehouseTermsSchema.safeParse(terms);
    if (!parsed.success) return null;
    return { variantId, terms: parsed.data.map(formTermToInput) };
  }, [terms, variantId]);

  const debouncedBody = useDebounce(previewBody, PREVIEW_DEBOUNCE_MS);
  const preview = useVirtualWarehousePreviewQuery(
    isOpen ? debouncedBody : null
  );

  const breakdown = useMemo(() => {
    if (!preview.data) return [];
    return preview.data.terms
      .filter((entry) => terms[entry.position])
      .map((entry) => ({
        position: entry.position,
        label: formatVirtualTerm(
          {
            ...terms[entry.position],
            warehouseId: terms[entry.position].warehouseId
              ? Number(terms[entry.position].warehouseId)
              : null,
            warehouseName:
              terms[entry.position].warehouseName ??
              warehouseOptions.find(
                (option) => option.key === terms[entry.position].warehouseId
              )?.value,
            rangeStart: terms[entry.position].rangeStart ?? null,
            rangeEnd: terms[entry.position].rangeEnd ?? null,
          },
          statusLabel
        ),
        value: entry.value,
      }));
  }, [preview.data, terms, warehouseOptions]);

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="mb-2 text-sm font-semibold text-gray-800">معاينة</p>
      <div className="flex flex-wrap gap-2">
        <div className="min-w-[200px] flex-1">
          <SearchableSelect
            options={productOptions}
            value={productId === null ? '' : String(productId)}
            onValueChange={(next) => {
              setProductId(next ? Number(next) : null);
              setVariantId(null);
            }}
            onSearch={setSearch}
            placeholder={productsLoading ? 'جاري التحميل...' : 'اختر المنتج'}
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <SearchableSelect
            options={variantOptions}
            value={variantId === null ? '' : String(variantId)}
            onValueChange={(next) => setVariantId(next ? Number(next) : null)}
            placeholder={productId === null ? 'اختر المنتج أولًا' : 'اختر المتغير'}
            disabled={productId === null}
          />
        </div>
      </div>

      <div className="mt-3 text-sm">
        {variantId === null ? (
          <p className="text-xs text-gray-400">
            اختر منتجًا ومتغيرًا لمعاينة الكمية المحسوبة
          </p>
        ) : previewBody === null ? (
          <p className="text-xs text-gray-400">أكمل بنود المعادلة لعرض المعاينة</p>
        ) : preview.isError ? (
          <p className="text-xs text-red-600">
            {getApiErrorMessage(preview.error, 'تعذر حساب المعاينة')}
          </p>
        ) : preview.isFetching || !preview.data ? (
          <p className="text-xs text-gray-400">جاري الحساب...</p>
        ) : (
          <div className="space-y-2">
            <p
              className={`font-semibold ${
                preview.data.quantity < 0 ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              الكمية المحسوبة: {preview.data.quantity}
            </p>
            <ul className="space-y-1">
              {breakdown.map((entry) => (
                <li
                  key={entry.position}
                  className="flex items-center justify-between gap-3 rounded bg-gray-50 px-2 py-1 text-xs text-gray-600"
                >
                  <span>{entry.label}</span>
                  <span
                    className={`font-semibold ${
                      entry.value < 0 ? 'text-red-600' : 'text-gray-800'
                    }`}
                  >
                    {entry.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
