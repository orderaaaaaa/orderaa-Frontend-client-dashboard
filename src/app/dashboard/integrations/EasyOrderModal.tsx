'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Copy,
  Check,
  Play,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { webhookApi, WebhookConfigResponse } from '@/lib/api/webhooks';
import { Button } from '@/components/ui/button';
import { useGetWebhookConfig } from './hooks/useGetWebhookConfig';
import { useIntegrations } from './hooks/useIntegrations';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { LiaEyeSolid, LiaEyeSlashSolid } from 'react-icons/lia';

interface EasyOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingConfig: WebhookConfigResponse | null;
}

const EasyOrderModal = ({
  isOpen,
  onClose,
  onSuccess,
  existingConfig,
}: EasyOrderModalProps) => {
  const { user } = useAuthStore();
  const merchantId = user?.merchantId;
  const queryClient = useQueryClient();

  // --- Webhook State ---
  const [webhookSecret, setWebhookSecret] = useState('');
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Integration API Key State ---
  const [apiKey, setApiKey] = useState('');
  const [existingIntegrationId, setExistingIntegrationId] = useState<
    number | null
  >(null);

  // --- UI Toggle States ---
  const [showApiDropdown, setShowApiDropdown] = useState(false);
  const [showWebhookDropdown, setShowWebhookDropdown] = useState(false);

  // --- General UI State ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { data: webhookData } = useGetWebhookConfig();
  const { integrations, createIntegration, updateIntegration } =
    useIntegrations();

  // --- URL Logic ---
  const getBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (
      envUrl &&
      (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))
    ) {
      return 'https://api.orderaa.com';
    }
    return envUrl || 'https://api.orderaa.com';
  };

  const defaultWebhookUrl = merchantId
    ? `${getBaseUrl()}/webhooks/easy-orders/${merchantId}`
    : `${getBaseUrl()}/webhooks/easy-orders/[MERCHANT_ID]`;

  useEffect(() => {
    if (webhookData) {
      setWebhookSecret(webhookData.webhookSecret || '');
      setCustomWebhookUrl(webhookData.webhookUrl || '');
    }
  }, [webhookData]);

  useEffect(() => {
    if (integrations) {
      const existing = integrations.find((c) => c.provider === 'EASY_ORDERS');
      if (existing) {
        setApiKey(existing.apiKey);
        setExistingIntegrationId(existing.id);
      }
    }
  }, [integrations]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    const urlToCopy = customWebhookUrl.trim() || defaultWebhookUrl;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const finalUrl = customWebhookUrl.trim() || defaultWebhookUrl;

      // 1. Webhook Logic (Patch if existingConfig exists)
      if (existingConfig) {
        await webhookApi.updateConfig({
          webhookUrl: finalUrl,
          webhookSecret: webhookSecret.trim(),
        });
      } else {
        await webhookApi.createConfig({
          webhookUrl: finalUrl,
          webhookSecret: webhookSecret.trim(),
        });
      }

      // 2. API Key Logic (Patch if existingIntegrationId exists)
      if (apiKey.trim()) {
        if (existingIntegrationId) {
          await updateIntegration({
            id: existingIntegrationId,
            apiKey: apiKey.trim(),
          });
        } else {
          await createIntegration(apiKey.trim());
        }
      }

      queryClient.invalidateQueries({ queryKey: ['integration-configs'] });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ الإعدادات.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      onClose();
    }
  };

  const webhookSteps = [
    'قم بتسجيل الدخول إلى حسابك في منصة Easy Orders.',
    'انتقل إلى الاعدادات (Settings) واختر Webhooks.',
    'اضغط على "Create Webhook" واختر الحدث: "Order Created".',
    'انسخ رابط الـ Webhook أدناه وألصقه في Easy Orders.',
    'قم بإنشاء مفتاح سرية (Secret) قوي وألصقه في الحقلين.',
  ];

  const integrationSteps = [
    'انتقل إلى قسم Public API في Easy Orders.',
    'اضغط على "إنشاء" واختر "الوصول للمنتجات".',
    'انسخ مفتاح الـ API Key وألصقه أدناه.',
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">ربط المتاجر</h2>
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <p className="text-gray-600 text-center">
              قم بربط متجرك لمراقبة الطلبات تلقائياً
            </p>

            {/* Platform Card */}
            <div className="bg-blue-50 rounded-xl flex items-center p-6 border border-[#2489E1]/20">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-white border border-[#2489E1] shadow-sm rounded-lg">
                  <ShoppingCart className="w-11 h-11 text-[#001A72]" />
                </div>
                <div className="flex flex-col items-start gap-1">
                  <p className="text-sm text-gray-600">
                    اتبع التعليمات ادناه للربط
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Easy Order
                  </h3>
                </div>
              </div>
            </div>

            {/* Static Video Section (No Dropdown) */}
            <h4 className="font-semibold text-gray-900">فيديو توضيحي</h4>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="aspect-video w-full md:h-[300px] bg-gray-900 rounded-lg flex flex-col items-center justify-center text-white text-sm">
                <Play className="w-12 h-12 mb-2 opacity-30" />
                <span className="opacity-75">سيتم إضافة الفيديو قريباً</span>
              </div>
            </div>

            {/* 1. API Key Dropdown */}
            <div className="bg-[#fbfdfe] rounded-xl border border-[#2489E1]/30 overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => setShowApiDropdown(!showApiDropdown)}
                className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-blue-100/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#2489E1] text-white p-2 rounded-lg">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      إعدادات الربط (API Key)
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      اختياري: لربط المخزون تلقائياً
                    </p>
                  </div>
                </div>
                {showApiDropdown ? (
                  <ChevronUp className="w-6 h-6 text-[#2489E1]" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-[#2489E1]" />
                )}
              </button>

              {showApiDropdown && (
                <div className="p-6 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-3 border-t border-blue-200/50 pt-4">
                    {integrationSteps.map((step, i) => (
                      <div
                        key={i}
                        className="flex flex-row items-center px-6 py-2.5 gap-2.5 bg-[rgba(36,137,225,0.02)] border border-[rgba(36,137,225,0.16)] rounded-lg"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                          {i + 1}
                        </span>
                        <p className="flex-1 text-md text-right text-black">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white p-4 rounded-lg border mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      API Key
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="أدخل مفتاح الـ API"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Webhook Dropdown */}
            <div className="bg-[#fbfdfe] rounded-xl border border-[#5D24E1]/30 overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => setShowWebhookDropdown(!showWebhookDropdown)}
                className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-purple-100/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#5D24E1] text-white p-2 rounded-lg">
                    <Play className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      إعدادات الـ Webhook
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      مطلوب: لمراقبة الطلبات الجديدة
                    </p>
                  </div>
                </div>
                {showWebhookDropdown ? (
                  <ChevronUp className="w-6 h-6 text-[#5D24E1]" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-[#5D24E1]" />
                )}
              </button>

              {showWebhookDropdown && (
                <div className="p-6 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-3 border-t border-purple-200/50 pt-4">
                    {webhookSteps.map((step, i) => (
                      <div
                        key={i}
                        className="flex flex-row items-center px-6 py-2.5 gap-2.5 bg-[rgba(93,36,225,0.02)] border border-[rgba(93,36,225,0.16)] rounded-lg"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                          {i + 1}
                        </span>
                        <p className="flex-1 text-md text-right text-black">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 mt-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Webhook URL
                        </label>
                        <button
                          type="button"
                          onClick={handleCopyUrl}
                          className="flex items-center gap-2 px-3 py-1 bg-[#5D24E1] text-white text-xs rounded-md hover:bg-[#4A1CB8]"
                        >
                          {copied ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          {copied ? 'تم النسخ' : 'نسخ'}
                        </button>
                      </div>
                      <input
                        type="url"
                        value={customWebhookUrl || defaultWebhookUrl}
                        onChange={(e) => setCustomWebhookUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left text-sm font-mono focus:ring-2 focus:ring-[#5D24E1] outline-none"
                        dir="ltr"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2 text-left"
                        dir="ltr"
                      >
                        Webhook Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={webhookSecret}
                          onChange={(e) => setWebhookSecret(e.target.value)}
                          placeholder="Secret key"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-[#5D24E1] pr-12 font-mono"
                          dir="ltr"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute inset-y-0 right-2 flex items-center"
                        >
                          <span className="text-white rounded-md cursor-pointer p-1.5 bg-[#5D24E1]">
                            {showSecret ? (
                              <LiaEyeSlashSolid className="w-4 h-4" />
                            ) : (
                              <LiaEyeSolid className="w-4 h-4" />
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit Actions */}
            <form onSubmit={handleSubmit} className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#5D24E1] text-white h-12 hover:bg-[#4A1CB8] font-bold text-lg"
              >
                {isLoading
                  ? 'جاري الحفظ...'
                  : existingConfig || existingIntegrationId
                  ? 'تحديث الربط'
                  : 'إنشاء الربط'}
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-white border border-gray-300 text-gray-700 h-12 hover:bg-gray-50"
              >
                إلغاء
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EasyOrderModal;
