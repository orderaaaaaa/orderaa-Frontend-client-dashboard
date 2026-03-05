'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LiaShoppingCartSolid,
  LiaCopySolid,
  LiaCheckSolid,
  LiaCheckCircleSolid,
  LiaPlusSolid,
  LiaLinkSolid,
  LiaKeySolid,
} from 'react-icons/lia';
import { webhookApi, WebhookConfigResponse } from '@/lib/api/webhooks';
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
import { useGetWebhookConfig } from '../hooks/useGetWebhookConfig';
import { useIntegrations } from '../hooks/useIntegrations';
import { storeApi } from '../api/Integrations';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { integrationSteps, webhookSteps } from '../constants/steps';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';

const storeInfoSchema = z.object({
  storeName: z.string().min(1, 'اسم المتجر مطلوب'),
  description: z.string().optional(),
});

const webhookSchema = z.object({
  webhookUrl: z.string().url('رابط غير صالح').or(z.literal('')),
  webhookSecret: z.string().min(10, 'يجب أن يكون 10 أحرف على الأقل'),
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
  existingConfig?: WebhookConfigResponse;
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
  const queryClient = useQueryClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { user } = useAuthStore();
  const merchantId = user?.merchantId;

  const [copied, setCopied] = useState(false);
  const [existingIntegrationId, setExistingIntegrationId] = useState<
    number | null
  >(null);
  const [showStepper, setShowStepper] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const stepperRef = useRef<HTMLDivElement>(null);

  const { data: webhookData } = useGetWebhookConfig();
  const { integrations, createIntegration, updateIntegration } =
    useIntegrations();

  const getDefaultWebhookUrl = (merchantId?: string | number): string => {
    if (!API_URL || merchantId == null) return '';
    return `${API_URL}/webhooks/easy-orders/${merchantId}`;
  };

  const defaultWebhookUrl = getDefaultWebhookUrl(merchantId);

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

  useEffect(() => {
    if (webhookData) {
      webhookForm.setValue('webhookSecret', webhookData.webhookSecret || '');
      webhookForm.setValue('webhookUrl', webhookData.webhookUrl || '');
    } else if (defaultWebhookUrl) {
      webhookForm.setValue('webhookUrl', defaultWebhookUrl);
    }
  }, [webhookData, defaultWebhookUrl]);

  useEffect(() => {
    if (integrations) {
      const existing = integrations.find((c) => c.provider === 'EASY_ORDERS');
      if (existing) {
        apiKeyForm.setValue('apiKey', existing.apiKey);
        setExistingIntegrationId(existing.id);
      }
    }
  }, [integrations]);

  const onStoreInfoSubmit = storeInfoForm.handleSubmit(async (data) => {
    setError('');
    setIsLoading(true);
    try {
      const store = await storeApi.create({
        name: data.storeName.trim(),
        description: data.description?.trim() || undefined,
      });
      const webhookUrl = `${API_URL}/webhooks/easy-orders/${store.id}`;
      webhookForm.setValue('webhookUrl', webhookUrl);
      toast.success('تم إنشاء المتجر بنجاح');
      setCurrentStep(1);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'خطأ في إنشاء المتجر');
    } finally {
      setIsLoading(false);
    }
  });

  const handleCopyUrl = () => {
    const urlToCopy =
      webhookForm.getValues('webhookUrl')?.trim() || defaultWebhookUrl;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onWebhookSubmit = webhookForm.handleSubmit(async (data) => {
    setError('');
    setIsLoading(true);
    try {
      const finalUrl = data.webhookUrl.trim() || defaultWebhookUrl;
      if (webhookData) {
        await webhookApi.updateConfig({
          webhookUrl: finalUrl,
          webhookSecret: data.webhookSecret.trim(),
        });
        toast.success('تم تحديث اعدادات الـ Webhook بنجاح');
      } else {
        await webhookApi.createConfig({
          webhookUrl: finalUrl,
          webhookSecret: data.webhookSecret.trim(),
        });
        toast.success('تم حفظ اعدادات الـ Webhook بنجاح');
      }
      queryClient.invalidateQueries({ queryKey: ['webhook-config'] });
      setCurrentStep(2);
    } catch {
      setError('خطأ في حفظ الـ Webhook');
    } finally {
      setIsLoading(false);
    }
  });

  const onApiKeySubmit = apiKeyForm.handleSubmit(async (data) => {
    setError('');
    setIsLoading(true);
    try {
      if (existingIntegrationId) {
        await updateIntegration({
          provider: 'EASY_ORDERS',
          apiKey: data.apiKey.trim(),
        });
        toast.success('تم تحديث اعدادات ربط API بنجاح');
      } else {
        await createIntegration(data.apiKey.trim());
        toast.success('تم انشاء ربط API بنجاح');
      }
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] });
      setShowStepper(false);
      setCurrentStep(0);
    } catch {
      setError('خطأ في حفظ مفتاح API');
    } finally {
      setIsLoading(false);
    }
  });

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      setShowStepper(false);
      setCurrentStep(0);
      storeInfoForm.clearErrors();
      webhookForm.clearErrors();
      apiKeyForm.clearErrors();
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
      storeInfoForm.clearErrors();
      webhookForm.clearErrors();
      apiKeyForm.clearErrors();
      setTimeout(() => {
        stepperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const isWebhookConnected = !!webhookData?.webhookSecret;
  const existingIntegration = integrations?.find(
    (c) => c.provider === 'EASY_ORDERS'
  );
  const hasConnectedStore = isWebhookConnected || !!existingIntegration;

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
                        type="url"
                        inputClassName="text-sm"
                        placeholder="https://..."
                        error={
                          webhookForm.formState.errors.webhookUrl?.message
                        }
                      />
                    </div>

                    <Input
                      register={webhookForm.register}
                      name="webhookSecret"
                      label="Webhook Secret"
                      type="password"
                      placeholder="Secret key (10 أحرف على الأقل)"
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
                      placeholder="Enter your API key"
                      error={apiKeyForm.formState.errors.apiKey?.message}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-primary text-white h-10"
                    >
                      {isLoading
                        ? 'جاري الحفظ...'
                        : existingIntegrationId
                          ? 'تحديث API'
                          : 'حفظ'}
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
          <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem
                value="easyorder"
                className="bg-white rounded-xl border border-gray-200 px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-50 border border-[#2489E1]/20 rounded-lg">
                      <LiaShoppingCartSolid className="w-6 h-6 text-[#001A72]" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">Easy Order</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isWebhookConnected && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <LiaCheckCircleSolid className="w-3 h-3" />
                            Webhook
                          </span>
                        )}
                        {existingIntegration && (
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
                    {webhookData && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Webhook
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">URL</span>
                          <span className="text-sm text-gray-800 max-w-[300px] truncate">
                            {webhookData.webhookUrl}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Secret</span>
                          <span className="text-sm text-gray-800">
                            {'•'.repeat(12)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">الحالة</span>
                          <span
                            className={clsx(
                              'text-xs font-medium px-2 py-0.5 rounded-full',
                              webhookData.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {webhookData.isActive ? 'مفعّل' : 'معطّل'}
                          </span>
                        </div>
                      </div>
                    )}

                    {existingIntegration && (
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
                            {existingIntegration.apiKey.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">الحالة</span>
                          <span
                            className={clsx(
                              'text-xs font-medium px-2 py-0.5 rounded-full',
                              existingIntegration.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {existingIntegration.isActive ? 'مفعّل' : 'معطّل'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
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
