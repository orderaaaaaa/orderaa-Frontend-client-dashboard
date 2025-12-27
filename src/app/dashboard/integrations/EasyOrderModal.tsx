'use client';

import React, { useState } from 'react';
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
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

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
  const [webhookSecret, setWebhookSecret] = useState('');
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { user } = useAuthStore();

  if (!isOpen) return null;

  const merchantId = user?.merchantId;

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

  const baseUrl = getBaseUrl();
  const defaultWebhookUrl = merchantId
    ? `${baseUrl}/webhooks/easy-orders/${merchantId}`
    : `${baseUrl}/webhooks/easy-orders/[MERCHANT_ID]`;

  const handleCopyUrl = () => {
    if (!merchantId) {
      setError('لا يمكن الحصول على معرف التاجر. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }
    const urlToCopy = customWebhookUrl.trim() || defaultWebhookUrl;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!merchantId) {
      setError('لا يمكن العثور على معرف التاجر. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    if (!webhookSecret.trim()) {
      setError('يرجى إدخال مفتاح السرية (Secret)');
      return;
    }

    if (webhookSecret.length < 10) {
      setError('مفتاح السرية يجب أن يكون 10 أحرف على الأقل');
      return;
    }

    setIsLoading(true);

    try {
      const fullWebhookUrl = customWebhookUrl.trim() || defaultWebhookUrl;

      if (existingConfig) {
        await webhookApi.updateConfig({
          webhookUrl: fullWebhookUrl,
          webhookSecret: webhookSecret.trim(),
        });
      } else {
        await webhookApi.createConfig({
          webhookUrl: fullWebhookUrl,
          webhookSecret: webhookSecret.trim(),
        });
      }

      onSuccess();
      onClose();
      setWebhookSecret('');
      setCustomWebhookUrl('');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'حدث خطأ أثناء حفظ الربط. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setWebhookSecret('');
      setCustomWebhookUrl('');
      setError('');
      setShowVideo(false);
      onClose();
    }
  };

  const steps = [
    'قم بتسجيل الدخول إلى حسابك في منصة Easy Orders من خلال موقعهم الرسمي.',
    'انتقل إلى الاعدادات (Settings).',
    'اختر قسم Webhooks.',
    'اضغط على "Create Webhook" أو "إنشاء ربط جديد".',
    'اختر الحدث: "Order Created" (عند إنشاء طلب جديد).',
    'انسخ رابط الـ Webhook من الحقل أدناه وألصقه في حقل Webhook URL في Easy Orders.',
    'قم بإنشاء مفتاح سرية (Secret) قوي (10 أحرف على الأقل) وألصقه في Easy Orders وفي حقل Webhook Secret أدناه.',
    'احفظ الإعدادات في Easy Orders، ثم اضغط "إنشاء الربط" أو "تحديث الربط" في هذه الصفحة.',
  ];

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>

      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">ربط المتاجر</h2>
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <p className="text-gray-600 text-center">
              قم بربط متجرك لمراقبة الطلبات تلقائياً
            </p>

            <div className="bg-blue-50 rounded-xl flex items-center p-6">
              <div className="flex items-center gap-4 ">
                <div className="flex items-center justify-center w-16 h-16 bg-white border border-[#2489E1] shadow-[0px_4px_22px_rgba(0,0,0,0.08)] rounded-lg">
                  <ShoppingCart
                    className="w-11 h-11 text-[#001A72]"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex flex-col items-start gap-4 order-1">
                  <p className="text-sm text-gray-600 order-2">
                    اتبع التعليمات ادناه للربط
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Easy Order
                  </h3>
                </div>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900">فيديو توضيحي</h4>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-[#5D24E1] text-white p-2 rounded-lg flex-shrink-0">
                    <Play className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-gray-900 mb-1">
                      فيديو تعليمي
                    </p>
                    <p className="text-sm text-gray-600">
                      شاهد هذا الفيديو لمعرفة كيفية إعداد الربط
                    </p>
                  </div>
                </div>
                {showVideo ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>

              {showVideo && (
                <div className="p-4 pt-0 border-t border-gray-200">
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">
                        سيتم إضافة الفيديو قريباً
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                خطوات إعداد Webhook
              </h4>

              <div className="space-y-3">
                {steps.map((step, index) => (
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    رابط الـ Webhook (Webhook URL)
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#5D24E1] hover:bg-[#4A1CB8] text-white text-sm rounded-md transition-colors"
                    disabled={isLoading}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        نسخ
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="url"
                  value={customWebhookUrl || defaultWebhookUrl}
                  onChange={(e) => setCustomWebhookUrl(e.target.value)}
                  placeholder="أدخل رابط الـ Webhook"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D24E1] focus:border-[#5D24E1] outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
                  dir="ltr"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  للتطوير: استخدم رابط ngrok. للإنتاج: سيتم استخدام الرابط
                  تلقائياً
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2 text-left"
                  dir="ltr"
                >
                  <span className="text-red-500 ml-1">*</span>
                  Webhook Secret
                </label>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Enter your Webhook Secret from Easy Orders"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D24E1] focus:border-[#5D24E1] outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-left"
                  dir="ltr"
                  disabled={isLoading}
                  required
                  minLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  مفتاح السرية يستخدم للتحقق من صحة الطلبات الواردة من Easy
                  Orders
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#5D24E1] hover:bg-[#4A1CB8] text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      جاري الحفظ...
                    </>
                  ) : existingConfig ? (
                    'تحديث الربط'
                  ) : (
                    'إنشاء الربط'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
