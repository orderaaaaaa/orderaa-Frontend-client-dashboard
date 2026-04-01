'use client';

import React, { useState, useMemo } from 'react';
import {
  LiaCopySolid,
  LiaCheckSolid,
  LiaPlusSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/base-modal';
import { Switch } from '@/components/ui/switch';
import { useIntegrations } from '../hooks/useIntegrations';
import {
  IntegrationConfigType,
  IntegrationResponse,
} from '../types/apiIntegration';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProviderModalConfig } from '../constants/providerConfig';

const URL_PATTERN = /^(https?:\/\/)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/;

const createEditSchema = (hasRequiredUrl: boolean, hasClientId: boolean) =>
  z.object({
    storeName: z.string().min(1, 'اسم المتجر مطلوب'),
    description: z.string().optional(),
    webhookApiKey: z.string().optional(),
    apiKeyValue: z.string().optional(),
    newWebhookSecret: z.string().optional(),
    newApiKey: z.string().optional(),
    shopDomain: hasRequiredUrl
      ? z.string().min(1, 'دومين المتجر مطلوب').regex(URL_PATTERN, 'يرجى إدخال رابط صحيح')
      : z.string().optional().refine((val) => !val || URL_PATTERN.test(val), { message: 'يرجى إدخال رابط صحيح' }),
    clientId: hasClientId
      ? z.string().min(1, 'Client ID مطلوب')
      : z.string().optional(),
  });

type EditFormData = z.infer<ReturnType<typeof createEditSchema>>;

interface EditIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: number;
  configs: IntegrationResponse[];
  providerConfig?: ProviderModalConfig;
}

const EditIntegrationModal = ({
  isOpen,
  onClose,
  storeId,
  configs,
  providerConfig,
}: EditIntegrationModalProps) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { updateIntegration, updateStore, createIntegration } = useIntegrations();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [showAddApi, setShowAddApi] = useState(false);

  const webhookConfig = useMemo(
    () => configs.find((c) => c.configType === IntegrationConfigType.WEBHOOK),
    [configs]
  );

  const apiConfig = useMemo(
    () => configs.find((c) => c.configType === IntegrationConfigType.API),
    [configs]
  );

  const provider = configs[0]?.provider;
  const storeName = configs[0]?.store?.name || '';
  const storeDescription = (configs[0]?.store?.description as string) || '';

  const hasRequiredUrl = providerConfig?.metadataFields?.some((f) => f.required && f.type === 'url') ?? false;
  const hasClientId = providerConfig?.metadataFields?.some((f) => f.key === 'clientId' && f.required) ?? false;

  const editSchema = useMemo(() => createEditSchema(hasRequiredUrl, hasClientId), [hasRequiredUrl, hasClientId]);

  const [webhookIsActive, setWebhookIsActive] = useState(webhookConfig?.isActive ?? true);
  const [apiIsActive, setApiIsActive] = useState(apiConfig?.isActive ?? true);

  const initialShopDomain = useMemo(() => {
    const existing = configs.find((c) => c.metadata)?.metadata;
    return (existing?.shopDomain as string) || (existing?.shopUrl as string) || '';
  }, [configs]);

  const initialClientId = useMemo(() => {
    const existing = configs.find((c) => c.metadata)?.metadata;
    return (existing?.clientId as string) || '';
  }, [configs]);

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      storeName,
      description: storeDescription,
      webhookApiKey: '',
      apiKeyValue: '',
      newWebhookSecret: '',
      newApiKey: '',
      shopDomain: initialShopDomain,
      clientId: initialClientId,
    },
  });

  const webhookUrl = useMemo(() => {
    if (!API_URL || !provider) return '';
    return `${API_URL}/webhook/orders/${provider}/${storeId}`;
  }, [API_URL, provider, storeId]);

  const watchedFields = form.watch();

  const hasChanges = useMemo(() => {
    const storeChanged =
      watchedFields.storeName !== storeName ||
      (watchedFields.description || '') !== storeDescription;

    const webhookKeyChanged = !!watchedFields.webhookApiKey;
    const webhookActiveChanged = webhookConfig
      ? webhookIsActive !== webhookConfig.isActive
      : false;

    const apiKeyChanged = !!watchedFields.apiKeyValue;
    const apiActiveChanged = apiConfig
      ? apiIsActive !== apiConfig.isActive
      : false;

    const metadataChanged =
      (watchedFields.shopDomain || '') !== initialShopDomain ||
      (watchedFields.clientId || '') !== initialClientId;

    const addingNewWebhook = showAddWebhook && !!watchedFields.newWebhookSecret?.trim();
    const addingNewApi = showAddApi && !!watchedFields.newApiKey?.trim();

    return (
      storeChanged ||
      webhookKeyChanged ||
      webhookActiveChanged ||
      apiKeyChanged ||
      apiActiveChanged ||
      metadataChanged ||
      addingNewWebhook ||
      addingNewApi
    );
  }, [
    watchedFields,
    storeName,
    storeDescription,
    webhookConfig,
    webhookIsActive,
    apiConfig,
    apiIsActive,
    initialShopDomain,
    initialClientId,
    showAddWebhook,
    showAddApi,
  ]);

  const handleCopyUrl = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const buildMetadata = (shopDomain?: string, clientId?: string) => {
    const meta: Record<string, unknown> = {};
    if (shopDomain?.trim()) meta.shopDomain = shopDomain.trim();
    if (clientId?.trim()) meta.clientId = clientId.trim();
    return Object.keys(meta).length > 0 ? meta : undefined;
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setError('');
    setIsLoading(true);
    try {
      const promises: Promise<unknown>[] = [];

      if (data.storeName !== storeName || data.description !== storeDescription) {
        promises.push(
          updateStore({
            id: storeId,
            data: {
              name: data.storeName.trim(),
              description: data.description?.trim() || undefined,
            },
          })
        );
      }

      if (webhookConfig) {
        const webhookUpdates: Record<string, unknown> = {};
        if (data.webhookApiKey) webhookUpdates.apiKey = data.webhookApiKey.trim();
        if (webhookIsActive !== webhookConfig.isActive) webhookUpdates.isActive = webhookIsActive;

        if (Object.keys(webhookUpdates).length > 0) {
          promises.push(
            updateIntegration({ configId: webhookConfig.id, data: webhookUpdates })
          );
        }
      }

      if (apiConfig) {
        const apiUpdates: Record<string, unknown> = {};
        if (data.apiKeyValue) apiUpdates.apiKey = data.apiKeyValue.trim();
        if (apiIsActive !== apiConfig.isActive) apiUpdates.isActive = apiIsActive;

        if ((data.shopDomain || '') !== initialShopDomain || (data.clientId || '') !== initialClientId) {
          apiUpdates.metadata = buildMetadata(data.shopDomain, data.clientId);
        }

        if (Object.keys(apiUpdates).length > 0) {
          promises.push(
            updateIntegration({ configId: apiConfig.id, data: apiUpdates })
          );
        }
      }

      if (!webhookConfig && showAddWebhook && data.newWebhookSecret?.trim()) {
        promises.push(
          createIntegration({
            storeId,
            provider,
            configType: IntegrationConfigType.WEBHOOK,
            apiKey: data.newWebhookSecret.trim(),
          })
        );
      }

      if (!apiConfig && showAddApi && data.newApiKey?.trim()) {
        promises.push(
          createIntegration({
            storeId,
            provider,
            configType: IntegrationConfigType.API,
            apiKey: data.newApiKey.trim(),
            ...(buildMetadata(data.shopDomain, data.clientId) && { metadata: buildMetadata(data.shopDomain, data.clientId) }),
          })
        );
      }

      if (promises.length === 0) {
        onClose();
        return;
      }

      await Promise.all(promises);
      toast.success('تم تحديث الربط بنجاح');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setIsLoading(false);
    }
  });

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      form.reset();
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="تعديل الربط"
      showFooter={false}
      isLoading={isLoading}
      maxWidth="md:max-w-2xl"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h4 className="font-semibold text-gray-900 text-sm">معلومات المتجر</h4>
          <Input
            register={form.register}
            name="storeName"
            label="اسم المتجر"
            placeholder="أدخل اسم المتجر..."
            error={form.formState.errors.storeName?.message}
          />
          <Input
            register={form.register}
            name="description"
            label="الوصف"
            placeholder="أدخل وصف المتجر (اختياري)..."
          />
        </div>

        {webhookConfig ? (
          <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm">إعدادات Webhook</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {webhookIsActive ? 'نشط' : 'معطّل'}
                </span>
                <Switch
                  checked={webhookIsActive}
                  onCheckedChange={setWebhookIsActive}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="block font-medium text-sm">Webhook URL</span>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="gap-1.5 h-7 text-xs"
                >
                  {copied ? (
                    <LiaCheckSolid className="w-3 h-3" />
                  ) : (
                    <LiaCopySolid className="w-3 h-3" />
                  )}
                  {copied ? 'تم النسخ' : 'نسخ'}
                </Button>
              </div>
              <Input
                value={webhookUrl}
                inputClassName="text-sm bg-white"
                disabled
              />
            </div>

            <Input
              register={form.register}
              name="webhookApiKey"
              label="Webhook Secret (اتركه فارغاً إن لم ترد تغييره)"
              placeholder="أدخل مفتاح Webhook الجديد..."
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">المفتاح الحالي</span>
              <span className="text-gray-800 font-mono text-xs">
                {webhookConfig.apiKey}
              </span>
            </div>
          </div>
        ) : showAddWebhook ? (
          <div className="space-y-4 bg-blue-50/50 p-5 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm">إضافة Webhook</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddWebhook(false)}
                className="text-xs text-gray-500 h-7"
              >
                إلغاء
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="block font-medium text-sm">Webhook URL</span>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="gap-1.5 h-7 text-xs"
                >
                  {copied ? (
                    <LiaCheckSolid className="w-3 h-3" />
                  ) : (
                    <LiaCopySolid className="w-3 h-3" />
                  )}
                  {copied ? 'تم النسخ' : 'نسخ'}
                </Button>
              </div>
              <Input
                value={webhookUrl}
                inputClassName="text-sm bg-white"
                disabled
              />
            </div>

            <Input
              register={form.register}
              name="newWebhookSecret"
              label="Webhook Secret"
              placeholder="أدخل مفتاح Webhook..."
            />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddWebhook(true)}
            className="w-full h-10 border-dashed border-gray-300 text-gray-500 hover:text-primary hover:border-primary gap-2"
          >
            <LiaPlusSolid className="w-4 h-4" />
            إضافة ربط Webhook
          </Button>
        )}

        {apiConfig ? (
          <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm">إعدادات API</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {apiIsActive ? 'نشط' : 'معطّل'}
                </span>
                <Switch
                  checked={apiIsActive}
                  onCheckedChange={setApiIsActive}
                />
              </div>
            </div>

            {providerConfig?.metadataFields?.map((field) => (
              <Input
                key={field.key}
                register={form.register}
                name={field.key}
                label={`${field.label}${field.required ? ' *' : ''}`}
                placeholder={field.placeholder}
                error={(form.formState.errors as Record<string, { message?: string }>)[field.key]?.message}
              />
            ))}

            <Input
              register={form.register}
              name="apiKeyValue"
              label="Client Secret (اتركه فارغاً إن لم ترد تغييره)"
              placeholder="أدخل Client Secret الجديد..."
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Client Secret الحالي</span>
              <span className="text-gray-800 font-mono text-xs">
                {apiConfig.apiKey}
              </span>
            </div>
          </div>
        ) : showAddApi ? (
          <div className="space-y-4 bg-blue-50/50 p-5 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm">إضافة Client Secret</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddApi(false)}
                className="text-xs text-gray-500 h-7"
              >
                إلغاء
              </Button>
            </div>

            {providerConfig?.metadataFields?.map((field) => (
              <Input
                key={field.key}
                register={form.register}
                name={field.key}
                label={`${field.label}${field.required ? ' *' : ''}`}
                placeholder={field.placeholder}
                error={(form.formState.errors as Record<string, { message?: string }>)[field.key]?.message}
              />
            ))}

            <Input
              register={form.register}
              name="newApiKey"
              label="Client Secret"
              placeholder="أدخل Client Secret..."
            />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddApi(true)}
            className="w-full h-10 border-dashed border-gray-300 text-gray-500 hover:text-primary hover:border-primary gap-2"
          >
            <LiaPlusSolid className="w-4 h-4" />
            إضافة Client Secret
          </Button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading || !hasChanges}
            className="flex-1 bg-primary text-white h-10"
          >
            {isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="h-10 px-6"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditIntegrationModal;
