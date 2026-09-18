'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Can } from '@/components/Can';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/generated/permission-codes';
import { useWarehouseOptions } from '@/services/warehouses';
import { getApiErrorMessage } from '@/utils/apiError';
import { useStockSync } from '../hooks/useIntegrations';
import {
  IntegrationProvider,
  type IntegrationResponse,
  type StockSyncRequest,
} from '../types/apiIntegration';
import { FailedPushList, PolicyLogList, UnlinkedVariantList } from './StockSyncLists';

const FALLBACK_ERROR = 'حدث خطأ أثناء التحديث';

export interface StockSyncFormState {
  enabled: boolean;
  warehouseId: string;
  locationId: string;
  stopSellingEnabled: boolean;
}

export function applyStockSyncEnabled(
  form: StockSyncFormState,
  enabled: boolean
): StockSyncFormState {
  return {
    ...form,
    enabled,
    stopSellingEnabled: enabled ? form.stopSellingEnabled : false,
  };
}

export function buildStockSyncRequest(
  form: StockSyncFormState,
  provider: IntegrationProvider
): StockSyncRequest {
  const request: StockSyncRequest = { enabled: form.enabled };
  if (form.warehouseId !== '') {
    request.warehouseId = Number(form.warehouseId);
  }
  if (provider === IntegrationProvider.SHOPIFY) {
    if (form.locationId !== '') {
      request.locationId = form.locationId;
    }
    request.stopSellingEnabled = form.stopSellingEnabled;
  }
  return request;
}

export function shouldRestorePolicy(
  savedStopSellingEnabled: boolean,
  submittedStopSellingEnabled: boolean
): boolean {
  return savedStopSellingEnabled && !submittedStopSellingEnabled;
}

export function seedForm(config: IntegrationResponse): StockSyncFormState {
  return {
    enabled: config.stockSyncEnabled,
    warehouseId:
      config.stockSyncWarehouseId !== null ? String(config.stockSyncWarehouseId) : '',
    locationId: config.stockSyncLocationId ?? '',
    stopSellingEnabled: config.stockSyncStopSellingEnabled,
  };
}

export default function StockSyncSection({ config }: { config: IntegrationResponse }) {
  const { hasPermission } = usePermissionCheck();
  const canManage = hasPermission(PERMISSION_CODES.INTEGRATION_CONFIG_MANAGE);
  const isShopify = config.provider === IntegrationProvider.SHOPIFY;

  const [form, setForm] = useState<StockSyncFormState>(() => seedForm(config));
  const [savedConfig, setSavedConfig] = useState<IntegrationResponse>(config);
  const [sectionError, setSectionError] = useState('');

  useEffect(() => {
    setForm(seedForm(config));
    setSavedConfig(config);
  }, [config]);

  const isDirty = useMemo(() => {
    const saved = seedForm(savedConfig);
    return (
      form.enabled !== saved.enabled ||
      form.warehouseId !== saved.warehouseId ||
      form.locationId !== saved.locationId ||
      form.stopSellingEnabled !== saved.stopSellingEnabled
    );
  }, [form, savedConfig]);

  const { pickerOptions: warehouseOptions, isLoading: warehousesLoading } =
    useWarehouseOptions();

  const {
    pushLogQuery,
    pushLogPage,
    setPushLogPage,
    unlinkedQuery,
    unlinkedPage,
    setUnlinkedPage,
    locationsQuery,
    policyLogQuery,
    policyLogPage,
    setPolicyLogPage,
    policySkippedCount,
    hasPendingPolicy,
    save,
    isSaving,
    retry,
    isRetrying,
    fullPush,
    isFullPushing,
    retryPolicy,
    isRetryingPolicy,
    startPolicyPollWindow,
  } = useStockSync(config.id, {
    provider: config.provider,
    stockSyncOn: form.enabled,
    canManage,
  });

  const locationOptions = useMemo(
    () =>
      (locationsQuery.data ?? []).map((location) => ({
        key: location.id,
        value: location.name,
      })),
    [locationsQuery.data]
  );

  const showManagedWarehouseValue =
    form.warehouseId !== '' &&
    !warehouseOptions.some((option) => option.key === form.warehouseId);

  const handleSave = async () => {
    setSectionError('');
    if (form.enabled && form.warehouseId === '') {
      setSectionError('اختر المخزن المصدر');
      return;
    }
    if (form.enabled && isShopify && form.locationId === '') {
      setSectionError('اختر موقع المخزون في Shopify');
      return;
    }
    const request = buildStockSyncRequest(form, config.provider);
    const willRestore = shouldRestorePolicy(
      savedConfig.stockSyncStopSellingEnabled,
      request.stopSellingEnabled ?? false
    );
    try {
      const saved = await save(request);
      setSavedConfig(saved);
      toast.success('تم حفظ إعدادات مزامنة المخزون');
      if (willRestore) {
        startPolicyPollWindow();
        toast.info('ستتم استعادة إعدادات البيع الأصلية في Shopify خلال دقيقة');
      }
    } catch (err) {
      setSectionError(getApiErrorMessage(err, FALLBACK_ERROR));
    }
  };

  const handleFullPush = async () => {
    try {
      const result = await fullPush();
      toast.success(`بدأ دفع ${result.queued} منتج إلى المتجر`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, FALLBACK_ERROR));
    }
  };

  const handleRetryAll = async () => {
    try {
      const result = await retry(undefined);
      toast.success(`بدأ دفع ${result.queued} منتج إلى المتجر`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, FALLBACK_ERROR));
    }
  };

  const handleRetryOne = async (variantId: number) => {
    try {
      const result = await retry([variantId]);
      toast.success(`بدأ دفع ${result.queued} منتج إلى المتجر`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, FALLBACK_ERROR));
    }
  };

  const handleRetryPolicy = async () => {
    try {
      const result = await retryPolicy();
      if (result.queued > 0) {
        toast.success('بدأت استعادة إعدادات البيع الأصلية في Shopify');
      } else {
        toast.info('لا توجد إعدادات بيع تحتاج استعادة');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, FALLBACK_ERROR));
    }
  };

  return (
    <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
      <h4 className="font-semibold text-gray-900 text-sm">مزامنة المخزون</h4>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="block text-sm font-medium text-gray-900">مزامنة المخزون</span>
          <p className="text-xs text-gray-500">
            عند التفعيل نرسل كمية المخزن المختار إلى المتجر بعد كل تغيير.
          </p>
          {!isShopify && (
            <p className="text-xs text-gray-500">
              عند وصول الكمية إلى صفر يتوقف المتجر عن قبول طلبات هذا المنتج.
            </p>
          )}
          {isShopify && (
            <>
              <p className="text-xs text-gray-500">
                في Shopify نفعّل تتبع المخزون لكل منتج مرتبط ونضيفه إلى الموقع المختار قبل
                إرسال الكمية. يتطلب ذلك صلاحيات write_inventory وread_locations.
              </p>
              <p className="text-xs text-gray-500">
                يظل المتجر يقبل الطلبات عند وصول الكمية إلى صفر إلا إذا فعّلت إيقاف البيع عند
                نفاد المخزون.
              </p>
            </>
          )}
        </div>
        <Switch
          checked={form.enabled}
          onCheckedChange={(checked) => setForm((prev) => applyStockSyncEnabled(prev, checked))}
          disabled={!canManage}
        />
      </div>

      <SearchableSelect
        options={warehouseOptions}
        value={form.warehouseId}
        onValueChange={(next) => setForm((prev) => ({ ...prev, warehouseId: next }))}
        placeholder="المخزن المصدر"
        disabled={!canManage}
        loading={warehousesLoading}
        {...(showManagedWarehouseValue ? { displayValue: 'مخزن مُدار' } : {})}
      />

      {isShopify && (
        <SearchableSelect
          options={locationOptions}
          value={form.locationId}
          onValueChange={(next) => setForm((prev) => ({ ...prev, locationId: next }))}
          placeholder="موقع المخزون في Shopify"
          disabled={!canManage}
          loading={locationsQuery.isLoading}
          error={
            locationsQuery.isError
              ? getApiErrorMessage(locationsQuery.error, FALLBACK_ERROR)
              : undefined
          }
        />
      )}

      {isShopify && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="block text-sm font-medium text-gray-900">
              إيقاف البيع عند نفاد المخزون
            </span>
            <p className="text-xs text-gray-500">
              نضبط كل منتج مرتبط في Shopify على إيقاف البيع عند نفاد المخزون، ونحفظ الإعداد
              الأصلي لكل منتج نغيّره. عند إيقاف هذا الخيار نعيد الإعداد الأصلي. يتطلب ذلك
              صلاحية write_products.
            </p>
            <p className="text-xs text-gray-500">
              يعمل هذا الخيار فقط مع المنتجات التي يتتبع Shopify كميتها.
            </p>
            {!form.enabled && (
              <p className="text-xs text-gray-400">فعّل مزامنة المخزون أولاً</p>
            )}
          </div>
          <Switch
            checked={form.stopSellingEnabled}
            onCheckedChange={(checked) =>
              setForm((prev) => ({ ...prev, stopSellingEnabled: checked }))
            }
            disabled={!canManage || !form.enabled}
          />
        </div>
      )}

      {sectionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
          {sectionError}
        </div>
      )}

      <div className="flex gap-3">
        <Can code={PERMISSION_CODES.INTEGRATION_CONFIG_MANAGE}>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canManage || !isDirty || isSaving}
            loading={isSaving}
          >
            حفظ إعدادات المزامنة
          </Button>
        </Can>
        <Can code={PERMISSION_CODES.INTEGRATION_CONFIG_MANAGE}>
          <Button
            type="button"
            variant="outline"
            onClick={handleFullPush}
            disabled={!savedConfig.stockSyncEnabled || !savedConfig.isActive || isFullPushing}
            loading={isFullPushing}
          >
            دفع كل الكميات الآن
          </Button>
        </Can>
      </div>

      <FailedPushList
        page={pushLogQuery.data}
        isLoading={pushLogQuery.isLoading}
        currentPage={pushLogPage}
        onPageChange={setPushLogPage}
        onRetryOne={handleRetryOne}
        onRetryAll={handleRetryAll}
        isRetrying={isRetrying}
        canPush={savedConfig.stockSyncEnabled && savedConfig.isActive}
      />

      <UnlinkedVariantList
        page={unlinkedQuery.data}
        isLoading={unlinkedQuery.isLoading}
        currentPage={unlinkedPage}
        onPageChange={setUnlinkedPage}
      />

      {isShopify && (
        <PolicyLogList
          page={policyLogQuery.data}
          isLoading={policyLogQuery.isLoading}
          currentPage={policyLogPage}
          onPageChange={setPolicyLogPage}
          hasPendingPolicy={hasPendingPolicy}
          skippedCount={policySkippedCount}
          onRetry={handleRetryPolicy}
          isRetrying={isRetryingPolicy}
          canRetry={!savedConfig.stockSyncStopSellingEnabled}
        />
      )}
    </div>
  );
}
