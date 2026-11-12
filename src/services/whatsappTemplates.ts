import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';
import { KEY as SHIPPING_PROVIDERS_QUERY_KEY } from '@/services/shippingProviders';
import type {
  UpdateWhatsAppTemplatesPayload,
  WhatsAppTemplatesResponse,
} from '@/types/whatsappTemplates';

export const WHATSAPP_TEMPLATES_QUERY_KEY = ['whatsapp-templates'] as const;

const WHATSAPP_TEMPLATES_URL = '/whatsapp-templates';

const ARABIC_PATTERN = /[؀-ۿ]/;

const toArabicWhatsAppTemplatesError = (error: unknown) => {
  const raw = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  const parts = (Array.isArray(raw) ? raw : [raw]).filter(
    (part): part is string => typeof part === 'string' && ARABIC_PATTERN.test(part)
  );
  return parts.length > 0
    ? Array.from(new Set(parts)).join('\n')
    : 'تعذّر حفظ رسائل واتساب';
};

export const useWhatsAppTemplatesQuery = (options: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: WHATSAPP_TEMPLATES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await http.get<WhatsAppTemplatesResponse>(
        WHATSAPP_TEMPLATES_URL
      );
      return data;
    },
    enabled: options.enabled ?? true,
  });

export const useUpdateWhatsAppTemplates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateWhatsAppTemplatesPayload) => {
      const { data } = await http.put<WhatsAppTemplatesResponse>(
        WHATSAPP_TEMPLATES_URL,
        payload
      );
      return data;
    },
    onSuccess: (response) => {
      queryClient.setQueryData(WHATSAPP_TEMPLATES_QUERY_KEY, response);
      queryClient.invalidateQueries({ queryKey: [SHIPPING_PROVIDERS_QUERY_KEY] });
      toast.success('تم حفظ رسائل واتساب');
    },
    onError: (error) => {
      toast.error(toArabicWhatsAppTemplatesError(error));
    },
  });
};
