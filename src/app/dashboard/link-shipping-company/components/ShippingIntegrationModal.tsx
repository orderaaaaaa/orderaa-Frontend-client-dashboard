import React, { useEffect, useState } from 'react';
import { useShippingQuery } from '../hooks/useShippingQuery';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';

interface Props {
  providerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShippingIntegrationModal: React.FC<Props> = ({
  providerId,
  isOpen,
  onClose,
}) => {
  const { config, isLoading, saveConfig, isSaving } =
    useShippingQuery(providerId);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    if (config) setWebhookUrl(config.webhookUrl);
  }, [config]);

  const handleSave = async () => {
    await saveConfig({ providerId: providerId as any, webhookUrl });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6" dir="rtl">
        <h2 className="text-xl font-bold mb-4">
          إعدادات الربط مع {providerId}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              رابط الـ Webhook
            </label>
            <Input
              name=""
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-api.com/webhook"
            />
          </div>
          {/* Add more fields dynamically based on providerId if needed */}
        </div>

        <div className="flex gap-3 mt-8">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
};
