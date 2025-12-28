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
  // Webhook State
  const [webhookSecret, setWebhookSecret] = useState('');
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  // Integration API Key State
  const [apiKey, setApiKey] = useState('');
  const [existingIntegrationId, setExistingIntegrationId] = useState<
    number | null
  >(null);
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);

  // General UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showVideo, setShowVideo] = useState(false);

  const queryClient = useQueryClient();
  const { data: webhookData } = useGetWebhookConfig();
  const { integrations, createIntegration, updateIntegration } =
    useIntegrations();

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
    if (!customWebhookUrl) {
      setError('لا يوجد رابط Webhook لنسخه');
      return;
    }
    navigator.clipboard.writeText(customWebhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Webhook Logic
      if (existingConfig) {
        await webhookApi.updateConfig({
          webhookUrl: customWebhookUrl.trim(),
          webhookSecret: webhookSecret.trim(),
        });
      } else {
        await webhookApi.createConfig({
          webhookUrl: customWebhookUrl.trim(),
          webhookSecret: webhookSecret.trim(),
        });
      }

      // 2. API Key Logic (Patch if exists, Create if new)
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
      setShowVideo(false);
      onClose();
    }
  };

  const webhookSteps = [
    'قم بتسجيل الدخول إلى حسابك في منصة Easy Orders من خلال موقعهم الرسمي.',
    'انتقل إلى الاعدادات (Settings).',
    'اختر قسم Webhooks.',
    'اضغط على "Create Webhook" أو "إنشاء ربط جديد".',
    'اختر الحدث: "Order Created" (عند إنشاء طلب جديد).',
    'انسخ رابط الـ Webhook من الحقل أدناه وألصقه في حقل Webhook URL في Easy Orders.',
    'قم بإنشاء مفتاح سرية (Secret) قوي (10 أحرف على الأقل) وألصقه في Easy Orders وفي حقل Webhook Secret أدناه.',
    'احفظ الإعدادات في Easy Orders، ثم اضغط "تحديث الربط" أو "إنشاء الربط" في هذه الصفحة.',
  ];

  const integrationSteps = [
    'اختار قسم public api',
    'اضغط على "Create" أو "إنشاء',
    'اختر الحدث: "Product Accessed" (الوصول الي المنتجات)',
    'انسخ المفتاح السري API Key',
    'أدخل مفتاح الـ API في الحقل أدناه لإتمام الربط التلقائي للمخزون والطلبات.',
    'الصق المفتاح السري ادناه في المكان المخصص له.',
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

            {/* Top Platform Card */}
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

            {/* Video Section */}
            <h4 className="font-semibold text-gray-900">فيديو توضيحي</h4>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-[#5D24E1] text-white p-2 rounded-lg">
                    <Play className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-gray-900 mb-1">
                      فيديو تعليمي
                    </p>
                    <p className="text-sm text-gray-600">
                      شاهد كيفية إعداد الربط
                    </p>
                  </div>
                </div>
                {showVideo ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {showVideo && (
                <div className="p-4 pt-0 border-t border-gray-200">
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white text-sm opacity-75">
                    سيتم إضافة الفيديو قريباً
                  </div>
                </div>
              )}
            </div>

            <h4 className="font-semibold text-gray-900">
              {' '}
              إعدادات الربط (API Key)
            </h4>

            {/* API Key Dropdown (Under Video) */}
            <div className="bg-[#fbfdfe] rounded-xl border border-[#2489E1]/30 overflow-hidden transition-all duration-300">
              <button
                onClick={() => setShowConfigDropdown(!showConfigDropdown)}
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
                {showConfigDropdown ? (
                  <ChevronUp className="w-6 h-6 text-[#2489E1]" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-[#2489E1]" />
                )}
              </button>

              {showConfigDropdown && (
                <div className="p-6 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-3 border-t border-blue-200/50 pt-4">
                    {integrationSteps.map((step, i) => (
                      <div
                        key={i}
                        className="flex flex-row items-center px-8 py-2.5 gap-2.5 min-h-[65px] bg-[rgba(36,137,225,0.02)] border border-[rgba(36,137,225,0.16)] rounded-lg"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                          {i + 1}
                        </span>
                        <p className="flex-1 text-lg leading-[33px] text-right text-black">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-4 rounded-lg border mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="أدخل مفتاح الـ API"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2489E1] text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Webhook Steps */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                خطوات إعداد Webhook
              </h4>
              <div className="space-y-3">
                {webhookSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-row items-center px-8 py-2.5 gap-2.5 min-h-[65px] bg-[rgba(36,137,225,0.02)] border border-[rgba(36,137,225,0.16)] rounded-lg"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-lg leading-[33px] text-right text-black">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Webhook Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Webhook URL
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#5D24E1] text-white text-sm rounded-md transition-colors hover:bg-[#4A1CB8]"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}{' '}
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </button>
                </div>
                <input
                  type="url"
                  value={customWebhookUrl}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-left"
                  dir="ltr"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-[#5D24E1] pr-12"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute inset-y-0 right-3 flex items-center"
                  >
                    <span className="text-white rounded-sm cursor-pointer py-2 px-3 bg-[#5D24E1] text-xs">
                      {showSecret ? (
                        <LiaEyeSlashSolid className="w-4 h-4" />
                      ) : (
                        <LiaEyeSolid className="w-4 h-4" />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#5D24E1] text-white h-12 hover:bg-[#4A1CB8]"
                >
                  {existingConfig || existingIntegrationId
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
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EasyOrderModal;
