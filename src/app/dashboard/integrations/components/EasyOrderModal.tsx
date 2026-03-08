'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  LiaShoppingCartSolid,
  LiaCopySolid,
  LiaCheckSolid,
  LiaCheckCircleSolid,
  LiaPlusSolid,
  LiaLinkSolid,
  LiaKeySolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/base-modal';
import { Stepper, StepContent } from '@/components/ui/stepper';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { useIntegrations } from '../hooks/useIntegrations';
import { storeApi } from '../api/Integrations';
import {
  IntegrationProvider,
  IntegrationConfigType,
  IntegrationResponse,
} from '../types/apiIntegration';
import { useAuthStore } from '@/store/authStore';
import { integrationSteps, webhookSteps } from '../constants/steps';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';
import groupBy from 'lodash/groupBy';

const storeInfoSchema = z.object({
  storeName: z.string().min(1, 'اسم المتجر مطلوب'),
  description: z.string().optional(),
});

const webhookSchema = z.object({
  webhookUrl: z.string(),
  webhookSecret: z.string().min(1, 'مفتاح Webhook مطلوب'),
});

const apiKeySchema = z.object({
  apiKey: z.string().min(1, 'مفتاح API مطلوب'),
});

type StoreInfoFormData = z.infer<typeof storeInfoSchema>;
type WebhookFormData = z.infer<typeof webhookSchema>;
type ApiKeyFormData = z.infer<typeof apiKeySchema>;

interface EasyOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPPER_STEPS = [
  { label: 'اسم المتجر' },
  { label: 'إعدادات Webhook' },
  { label: 'مفتاح API' },
];

const EasyOrderModal = ({
  isOpen,
  onClose,
}: EasyOrderModalProps) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { user } = useAuthStore();
  const merchantId = user?.merchantId;

  const [copied, setCopied] = useState(false);
  const [createdStoreId, setCreatedStoreId] = useState<number | null>(null);
  const [showStepper, setShowStepper] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const stepperRef = useRef<HTMLDivElement>(null);

  const { integrations, createIntegration } = useIntegrations();

  const easyOrderIntegrations = useMemo(() => {
    if (!integrations) return [];
    return integrations.filter(
      (c) => c.provider === IntegrationProvider.EASY_ORDERS
    );
  }, [integrations]);

  const storeGroups = useMemo(() => {
    return groupBy(easyOrderIntegrations, 'storeId');
  }, [easyOrderIntegrations]);

  const hasConnectedStore = easyOrderIntegrations.length > 0;

  const getWebhookUrl = (storeId: number): string => {
    if (!API_URL) return '';
    return `${API_URL}/webhook/orders/${IntegrationProvider.EASY_ORDERS}/${storeId}`;
  };

  const storeInfoForm = useForm<StoreInfoFormData>({
    resolver: zodResolver(storeInfoSchema),
    defaultValues: { storeName: '', description: '' },
  });

  const webhookForm = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: { webhookUrl: '', webhookSecret: '' },
  });

  const apiKeyForm = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { apiKey: '' },
  });

  const onStoreInfoSubmit = storeInfoForm.handleSubmit(async (data) => {
    setError('');
    setIsLoading(true);
    try {
      const store = await storeApi.create({
        name: data.storeName.trim(),
        description: data.description?.trim() || undefined,
      });
      setCreatedStoreId(store.id);
      webhookForm.setValue('webhookUrl', getWebhookUrl(store.id));
      toast.success('تم إنشاء المتجر بنجاح');
      setCurrentStep(1);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'خطأ في إنشاء المتجر');
    } finally {
      setIsLoading(false);
    }
  });

  const handleCopyUrl = () => {
    const urlToCopy = webhookForm.getValues('webhookUrl')?.trim();
    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const onWebhookSubmit = webhookForm.handleSubmit(async (data) => {
    setError('');
    setIsLoading(true);
    try {
      if (!createdStoreId) {
        setError('لم يتم تحديد المتجر');
        setIsLoading(false);
        return;
      }

      await createIntegration({
        storeId: createdStoreId,
        provider: IntegrationProvider.EASY_ORDERS,
        configType: IntegrationConfigType.WEBHOOK,
        apiKey: data.webhookSecret.trim(),
      });

      toast.success('تم حفظ اعدادات الـ Webhook بنجاح');
      setCurrentStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'خطأ في حفظ الـ Webhook');
    } finally {
      setIsLoading(false);
    }
  });

  const onApiKeySubmit = apiKeyForm.handleSubmit(async (data) => {
    setError('');
    setIsLoading(true);
    try {
      if (!createdStoreId) {
        setError('لم يتم تحديد المتجر');
        setIsLoading(false);
        return;
      }

      await createIntegration({
        storeId: createdStoreId,
        provider: IntegrationProvider.EASY_ORDERS,
        configType: IntegrationConfigType.API,
        apiKey: data.apiKey.trim(),
      });

      toast.success('تم انشاء ربط API بنجاح');
      setShowStepper(false);
      setCurrentStep(0);
      resetForms();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'خطأ في حفظ مفتاح API');
    } finally {
      setIsLoading(false);
    }
  });

  const resetForms = () => {
    storeInfoForm.reset();
    webhookForm.reset();
    apiKeyForm.reset();
    setCreatedStoreId(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      setShowStepper(false);
      setCurrentStep(0);
      resetForms();
      onClose();
    }
  };

  const handleToggleStepper = () => {
    if (showStepper) {
      setShowStepper(false);
    } else {
      setShowStepper(true);
      setCurrentStep(0);
      setError('');
      resetForms();
      setTimeout(() => {
        stepperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const getStoreConfigs = (configs: IntegrationResponse[]) => {
    const webhookConfig = configs.find(
      (c) => c.configType === IntegrationConfigType.WEBHOOK
    );
    const apiConfig = configs.find(
      (c) => c.configType === IntegrationConfigType.API
    );
    return { webhookConfig, apiConfig };
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="ربط المتاجر"
      showFooter={false}
      isLoading={isLoading}
      maxWidth="md:max-w-5xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            قم بربط متجرك لمراقبة الطلبات تلقائياً
          </p>
          <Button
            onClick={handleToggleStepper}
            className="bg-primary text-white gap-2"
          >
            <LiaPlusSolid className="w-4 h-4" />
            ربط متجر جديد
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LiaLinkSolid className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-gray-900">
                خطوات ربط الـ Webhook
              </h4>
            </div>
            <div className="relative">
              <div className="absolute right-[11px] top-3 bottom-3" />
              {webhookSteps.map((step, i) => (
                <div
                  key={i}
                  className="relative flex items-start gap-3 pb-4 last:pb-0"
                >
                  <span className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <LiaKeySolid className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-gray-900">
                خطوات ربط الـ API
              </h4>
            </div>
            <div className="relative">
              <div className="absolute right-[11px] top-3 bottom-3" />
              {integrationSteps.map((step, i) => (
                <div
                  key={i}
                  className="relative flex items-start gap-3 pb-4 last:pb-0"
                >
                  <span className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">فيديو توضيحي</h4>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <iframe
              src="https://drive.google.com/file/d/1aoWTPTEbKQg3fWBwI3VL0gIf82Lsdnf-/preview"
              className="aspect-video w-full md:h-[300px] rounded-lg"
              allow="autoplay"
              allowFullScreen
            />
          </div>
        </div>

        {showStepper && (
          <div ref={stepperRef} className="bg-gray-50/80 rounded-xl border border-primary/20 p-6">
            <Stepper steps={STEPPER_STEPS} currentStep={currentStep}>
              <StepContent>
                <form
                  onSubmit={onStoreInfoSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-100">
                    <Input
                      register={storeInfoForm.register}
                      name="storeName"
                      label="اسم المتجر"
                      placeholder="أدخل اسم المتجر..."
                      error={storeInfoForm.formState.errors.storeName?.message}
                    />
                    <Input
                      register={storeInfoForm.register}
                      name="description"
                      label="الوصف"
                      placeholder="أدخل وصف المتجر (اختياري)..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-primary text-white h-10"
                    >
                      {isLoading ? 'جاري الإنشاء...' : 'التالي'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowStepper(false)}
                      disabled={isLoading}
                      className="h-10 px-6"
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </StepContent>

              <StepContent>
                <form onSubmit={onWebhookSubmit} className="space-y-4">
                  <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-100">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="block font-medium text-base">
                          Webhook URL
                        </span>
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
                        register={webhookForm.register}
                        name="webhookUrl"
                        inputClassName="text-sm bg-gray-50"
                        placeholder="https://..."
                        disabled
                      />
                    </div>

                    <Input
                      register={webhookForm.register}
                      name="webhookSecret"
                      label="Webhook Secret"
                      type="password"
                      placeholder="أدخل مفتاح Webhook..."
                      error={
                        webhookForm.formState.errors.webhookSecret?.message
                      }
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-primary text-white h-10"
                    >
                      {isLoading ? 'جاري الحفظ...' : 'التالي'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(0)}
                      disabled={isLoading}
                      className="h-10 px-6"
                    >
                      رجوع
                    </Button>
                  </div>
                </form>
              </StepContent>

              <StepContent>
                <form onSubmit={onApiKeySubmit} className="space-y-4">
                  <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-100">
                    <Input
                      register={apiKeyForm.register}
                      name="apiKey"
                      label="API Key"
                      type="password"
                      placeholder="أدخل مفتاح API..."
                      error={apiKeyForm.formState.errors.apiKey?.message}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-primary text-white h-10"
                    >
                      {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      disabled={isLoading}
                      className="h-10 px-6"
                    >
                      رجوع
                    </Button>
                  </div>
                </form>
              </StepContent>
            </Stepper>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center mt-4">
                {error}
              </div>
            )}
          </div>
        )}

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            المتاجر المربوطة
          </h4>
          {hasConnectedStore ? (
            <Accordion type="single" collapsible className="space-y-3 pb-5">
              {Object.entries(storeGroups).map(([storeId, configs]) => {
                const { webhookConfig, apiConfig } = getStoreConfigs(configs);
                return (
                  <AccordionItem
                    key={storeId}
                    value={`store-${storeId}`}
                    className="bg-white rounded-xl border border-gray-200 px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 border border-[#2489E1]/20 rounded-lg">
                          <LiaShoppingCartSolid className="w-6 h-6 text-[#001A72]" />
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            متجر #{storeId}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {webhookConfig && (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                <LiaCheckCircleSolid className="w-3 h-3" />
                                Webhook
                              </span>
                            )}
                            {apiConfig && (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                <LiaCheckCircleSolid className="w-3 h-3" />
                                API
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {webhookConfig && (
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Webhook
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Secret</span>
                              <span className="text-sm text-gray-800">
                                {'•'.repeat(8)}
                                {webhookConfig.apiKey.slice(-4)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">الحالة</span>
                              <span
                                className={clsx(
                                  'text-xs font-medium px-2 py-0.5 rounded-full',
                                  webhookConfig.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                )}
                              >
                                {webhookConfig.isActive ? 'مفعّل' : 'معطّل'}
                              </span>
                            </div>
                          </div>
                        )}

                        {apiConfig && (
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              API Key
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                المفتاح
                              </span>
                              <span className="text-sm text-gray-800">
                                {'•'.repeat(8)}
                                {apiConfig.apiKey.slice(-4)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">الحالة</span>
                              <span
                                className={clsx(
                                  'text-xs font-medium px-2 py-0.5 rounded-full',
                                  apiConfig.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                )}
                              >
                                {apiConfig.isActive ? 'مفعّل' : 'معطّل'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <LiaLinkSolid className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-1">لا توجد متاجر مربوطة</p>
              <p className="text-gray-400 text-sm">
                اضغط على &quot;ربط متجر جديد&quot; لبدء ربط متجرك
              </p>
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default EasyOrderModal;
