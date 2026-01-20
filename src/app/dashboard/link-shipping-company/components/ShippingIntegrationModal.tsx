import React, { useState, useEffect } from 'react';
import { X, Truck, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { useShippingQuery } from '../hooks/useShippingQuery';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { steps } from '../constants/steps';
import { If, Then } from 'react-if';
import { ShippingConfig } from '../types/shipping';
import { LiaEyeSlashSolid, LiaEyeSolid } from 'react-icons/lia';

interface Props {
  providerId: string;
  isOpen: boolean;
  onClose: () => void;
  initialData?: ShippingConfig;
}

export const ShippingIntegrationModal: React.FC<Props> = ({
  providerId,
  isOpen,
  onClose,
}) => {
  const { config, saveConfig, updateConfig, isSaving } =
    useShippingQuery(providerId);

  const [authKey, setAuthKey] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [showAuthKey, setShowAuthKey] = useState(false);
  const [showClientCode, setShowClientCode] = useState(false);
  const [error, setError] = useState<string>('');
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAuthKey('');
      setClientCode('');
      setError('');
    }
  }, [isOpen]);

  const handleSave = async () => {
    setError('');

    // Validation
    if (!authKey.trim()) {
      setError('يرجى إدخال مفتاح المصادقة (Authentication Key)');
      return;
    }

    if (!clientCode.trim()) {
      setError('يرجى إدخال رمز العميل (Client Code)');
      return;
    }

    try {
      const basePayload = {
        authKey: authKey.trim(),
        clientCode: clientCode.trim(),
        isActive: true,
      };

      if (!config?.authKey) {
        await saveConfig({
          shippingCompany: providerId.toUpperCase(),
          ...basePayload,
        });
      } else {
        await updateConfig({
          data: basePayload,
          shippingCompany: providerId.toUpperCase(),
        });
      }

      setAuthKey('');
      setClientCode('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSaving && authKey.trim() && clientCode.trim()) {
      handleSave();
    }
  };

  if (!isOpen) return null;

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
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">
              إعدادات الربط مع {providerId === 'turbo' ? 'Turbo' : providerId}
            </h2>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <p className="text-gray-600 text-center">
              قم بربط متجرك لتفعيل خدمات الشحن تلقائياً
            </p>

            {/* Info Card */}
            <div className="bg-blue-50 rounded-xl flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-white border border-[#2489E1] shadow-sm rounded-lg">
                  <Truck className="w-8 h-8 text-[#001A72]" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col items-start gap-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Turbo Shipping
                  </h3>
                  <p className="text-sm text-gray-600">
                    اتبع التعليمات أدناه للربط
                  </p>
                </div>
              </div>
            </div>

            {/* Video Accordion */}
            <h4 className="font-semibold text-gray-900">فيديو توضيحي</h4>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                type="button"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-white p-2 rounded-lg flex-shrink-0">
                    <Play className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-gray-900 mb-1">
                      فيديو تعليمي
                    </p>
                    <p className="text-sm text-gray-600">
                      شاهد كيفية استخراج بيانات الربط
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

            {/* Steps */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">خطوات التفعيل</h4>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center px-4 py-3 gap-3 bg-gray-50 border border-gray-100 rounded-lg"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-gray-700 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Display existing config values */}
            <If condition={!!config?.isActive}>
              <Then>
                <div className="flex flex-col gap-2">
                  <div className="relative bg-gray-100 py-2 px-2 rounded-sm flex items-center justify-between">
                    <div>
                      <span className="font-bold">ال api الخاص بك : </span>
                      <span className="font-mono">
                        {showAuthKey ? config?.authKey : '************'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowAuthKey((prev) => !prev)}
                    >
                      {showAuthKey ? (
                        <LiaEyeSlashSolid
                          size={18}
                          className="text-primary cursor-pointer"
                        />
                      ) : (
                        <LiaEyeSolid
                          size={18}
                          className="text-primary cursor-pointer"
                        />
                      )}
                    </button>
                  </div>

                  <div className="relative bg-gray-100 py-2 px-2 rounded-sm flex items-center justify-between">
                    <div>
                      <span className="font-bold">
                        ال clientCode الخاص بك :
                      </span>
                      <span className="font-mono">
                        {showClientCode ? config?.clientCode : '************'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowClientCode((prev) => !prev)}
                    >
                      {showClientCode ? (
                        <LiaEyeSlashSolid
                          size={18}
                          className="text-primary cursor-pointer"
                        />
                      ) : (
                        <LiaEyeSolid
                          size={18}
                          className="text-primary cursor-pointer"
                        />
                      )}
                    </button>
                  </div>
                </div>
              </Then>
            </If>

            {/* Input fields */}
            <div className="space-y-4">
              <Input
                label="مفتاح المصادقة (Authentication Key)"
                type="text"
                placeholder="أدخل مفتاح المصادقة"
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                clearable
                onClear={() => setAuthKey('')}
              />

              <Input
                label="رمز العميل (Client Code)"
                type="text"
                placeholder="أدخل رمز العميل"
                value={clientCode}
                onChange={(e) => setClientCode(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                clearable
                onClear={() => setClientCode('')}
              />

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !authKey.trim() || !clientCode.trim()}
                  className="flex-1 bg-primary hover:bg-[#4A1CB8] h-12 text-lg"
                >
                  {isSaving ? 'جاري التفعيل...' : 'تفعيل الربط'}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 text-lg"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
