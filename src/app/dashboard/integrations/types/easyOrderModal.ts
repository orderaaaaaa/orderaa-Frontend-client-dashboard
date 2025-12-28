import { WebhookConfigResponse } from '@/lib/api/webhooks';

export interface EasyOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingConfig: WebhookConfigResponse | null;
}
