import React, { useState, useMemo, useEffect } from 'react';
import {
  LiaTruckSolid,
  LiaPlaySolid,
  LiaExclamationCircleSolid,
} from 'react-icons/lia';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useShippingQuery } from '../hooks/useShippingQuery';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/base-modal';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { getStepsByProvider } from '../constants/steps';
import { ShippingConfig } from '../types/shipping';

const createShippingSchema = (showClientCode: boolean) =>
  z.object({
    authKey: z.string().min(1, 'يرجى إدخال Authentication Key'),
    clientCode: showClientCode
      ? z.string().min(1, 'يرجى إدخال Client Code')
      : z.string().optional(),
  });

type ShippingFormData = z.infer<ReturnType<typeof createShippingSchema>>;

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

  const [error, setError] = useState<string>('');

  const providerLower = providerId.toLowerCase();
  const isRedOrHashtag = providerLower === 'red' || providerLower === 'hashtag' || providerLower === 'jt_express';
  const requiresClientCode = providerLower === 'turbo';
  const steps = getStepsByProvider(providerId);

  const isEditing = !!config?.authKey;
  const showClientCode = isRedOrHashtag || requiresClientCode || isEditing;

  const schema = useMemo(
    () => createShippingSchema(showClientCode),
    [showClientCode]
  );

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(schema),
    defaultValues: { authKey: '', clientCode: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!isOpen) return;
    if (config) {
      form.reset({
        authKey: config.authKey || '',
        clientCode: config.clientCode || '',
      });
    } else {
      form.reset({ authKey: '', clientCode: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const getProviderDisplayName = () => {
    const provider = providerId.toLowerCase();
    switch (provider) {
      case 'turbo':
        return 'Turbo Shipping';
      case 'bosta':
        return 'Bosta';
      case 'aramex':
        return 'Aramex';
      case 'shipblu':
        return 'ShipBlu';
      case 'mylerz':
        return 'Mylerz';
      case 'jt_express':
        return 'J&T Express';
      case 'red':
        return 'Red';
      case 'hashtag':
        return 'Hashtag';
      default:
        return providerId;
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      form.reset();
      setError('');
      onClose();
    }
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setError('');

    try {
      const basePayload: Record<string, unknown> = {
        authKey: data.authKey.trim(),
        isActive: true,
      };

      if (showClientCode && data.clientCode?.trim()) {
        basePayload.clientCode = data.clientCode.trim();
      }

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

      toast.success(`تم ربط ${getProviderDisplayName()} بنجاح!`);
      form.reset();
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || 'حدث خطأ أثناء الحفظ';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  });

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`إعدادات الربط مع ${getProviderDisplayName()}`}
      showFooter={false}
      isLoading={isSaving}
      maxWidth="md:max-w-4xl"
    >
      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          <p className="text-gray-600 text-center">
            قم بربط متجرك لتفعيل خدمات الشحن تلقائياً
          </p>

          <div className="bg-blue-50 rounded-xl flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-white border border-[#2489E1] shadow-sm rounded-lg">
                <LiaTruckSolid className="w-8 h-8 text-[#001A72]" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getProviderDisplayName()}
                </h3>
                <p className="text-sm text-gray-600">
                  اتبع التعليمات أدناه للربط
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">فيديو توضيحي</h4>
            <Accordion type="single" collapsible>
              <AccordionItem
                value="video"
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
              >
                <AccordionTrigger className="p-4 hover:no-underline hover:bg-gray-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-white p-2 rounded-lg flex-shrink-0">
                      <LiaPlaySolid className="w-5 h-5" />
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
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0 border-t border-gray-200">
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <LiaPlaySolid className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">
                        سيتم إضافة الفيديو قريباً
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
              <LiaExclamationCircleSolid className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isRedOrHashtag ? (
              <>
                <Input
                  register={form.register}
                  name="clientCode"
                  label="اسم المستخدم"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  error={form.formState.errors.clientCode?.message}
                  disabled={isSaving}
                />
                <Input
                  register={form.register}
                  name="authKey"
                  label="كلمة المرور"
                  type="text"
                  placeholder="أدخل كلمة المرور"
                  error={form.formState.errors.authKey?.message}
                  disabled={isSaving}
                />
              </>
            ) : (
              <>
                {showClientCode && (
                  <Input
                    register={form.register}
                    name="clientCode"
                    label="Client Code"
                    type="text"
                    placeholder="أدخل Client Code"
                    error={form.formState.errors.clientCode?.message}
                    disabled={isSaving}
                  />
                )}

                <Input
                  register={form.register}
                  name="authKey"
                  label="Authentication Key"
                  type="text"
                  placeholder="أدخل Authentication Key"
                  error={form.formState.errors.authKey?.message}
                  disabled={isSaving}
                />
              </>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-12 text-lg"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isValid}
                className="flex-1 bg-primary hover:bg-[#4A1CB8] h-12 text-lg"
              >
                {isSaving ? 'جاري الحفظ...' : isEditing ? 'تحديث الربط' : 'تفعيل الربط'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};
