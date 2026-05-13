'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import {
  LiaPlaySolid,
  LiaExclamationCircleSolid,
  LiaTrashAltSolid,
  LiaBoltSolid,
} from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  autoConfirmationConfigSchema,
  AutoConfirmationFormData,
} from '../schema';
import { autoConfirmationSetupSteps } from '../constants/providers';
import {
  AutoConfirmationProvider,
  AutoConfirmationConfig,
} from '../types/autoConfirmation';
import { useAutoConfirmationProviders } from '../hooks/useAutoConfirmationProviders';

interface AutoConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: AutoConfirmationProvider | null;
  existingConfig?: AutoConfirmationConfig;
}

export const AutoConfirmationModal: React.FC<AutoConfirmationModalProps> = ({
  isOpen,
  onClose,
  provider,
  existingConfig,
}) => {
  const { saveConfig, deleteConfig } = useAutoConfirmationProviders();
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditing = !!existingConfig;
  const steps = provider ? autoConfirmationSetupSteps[provider.id] : [];

  const form = useForm<AutoConfirmationFormData>({
    resolver: zodResolver(autoConfirmationConfigSchema),
    defaultValues: {
      apiKey: '',
      accountId: '',
      isActive: true,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setConfirmDelete(false);
    if (existingConfig) {
      form.reset({
        apiKey: existingConfig.apiKey,
        accountId: existingConfig.accountId ?? '',
        isActive: existingConfig.isActive,
      });
    } else {
      form.reset({ apiKey: '', accountId: '', isActive: true });
    }
  }, [isOpen, existingConfig, form]);

  const handleClose = () => {
    if (isSaving || isDeleting) return;
    setError('');
    setConfirmDelete(false);
    form.reset();
    onClose();
  };

  const onSubmit = form.handleSubmit(async (data) => {
    if (!provider) return;
    setError('');
    setIsSaving(true);
    try {
      await saveConfig({
        provider: provider.id,
        apiKey: data.apiKey.trim(),
        accountId: data.accountId?.trim() || undefined,
        isActive: data.isActive,
      });
      toast.success(
        isEditing
          ? `تم تحديث ربط ${provider.name} بنجاح`
          : `تم ربط ${provider.name} بنجاح`
      );
      handleClose();
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || 'حدث خطأ أثناء الحفظ';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  });

  const handleDelete = async () => {
    if (!provider) return;
    setIsDeleting(true);
    try {
      await deleteConfig(provider.id);
      toast.success(`تم إلغاء ربط ${provider.name}`);
      handleClose();
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || 'حدث خطأ أثناء الحذف';
      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!provider) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`إعدادات الربط مع ${provider.name}`}
      showFooter={false}
      isLoading={isSaving || isDeleting}
      maxWidth="md:max-w-4xl"
    >
      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          <p className="text-gray-600 text-center">
            قم بربط متجرك مع {provider.name} لتأكيد الطلبات تلقائياً
          </p>

          <div className="rounded-xl flex items-center p-6 bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-4 w-full">
              <div className="flex items-center justify-center w-16 h-16 bg-white border border-primary/30 shadow-sm rounded-lg overflow-hidden">
                <Image
                  src={provider.logo}
                  alt={provider.name}
                  width={56}
                  height={56}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="flex flex-col items-start gap-1 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {provider.name}
                </h3>
                <p className="text-sm text-gray-600">
                  اتبع التعليمات أدناه لإكمال الربط
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-primary bg-white px-3 py-1.5 rounded-full border border-primary/20">
                <LiaBoltSolid className="w-3.5 h-3.5" />
                تأكيد آلي
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
                        شاهد كيفية استخراج بيانات الربط من {provider.name}
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

          {steps.length > 0 && (
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
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
              <LiaExclamationCircleSolid className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              register={form.register}
              name="apiKey"
              label="مفتاح API"
              required
              type="text"
              placeholder={`أدخل مفتاح API الخاص بـ ${provider.name}`}
              error={form.formState.errors.apiKey?.message}
              disabled={isSaving}
            />

            <Input
              register={form.register}
              name="accountId"
              label="معرف الحساب"
              type="text"
              placeholder="اختياري"
              error={form.formState.errors.accountId?.message}
              disabled={isSaving}
            />

            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      تفعيل الربط
                    </span>
                    <span className="text-xs text-gray-500">
                      عند التفعيل سيتم البدء في تأكيد الطلبات الجديدة آلياً
                    </span>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSaving}
                  />
                </div>
              )}
            />

            {isEditing && !confirmDelete && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmDelete(true)}
                disabled={isSaving || isDeleting}
                className="w-full h-11 text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg flex items-center justify-center gap-2"
              >
                <LiaTrashAltSolid className="w-4 h-4" />
                إلغاء الربط
              </Button>
            )}

            {isEditing && confirmDelete && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                <p className="text-sm text-red-800 font-medium">
                  هل أنت متأكد من إلغاء الربط مع {provider.name}؟ لن يتم تأكيد
                  الطلبات الجديدة آلياً بعد ذلك.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                    className="flex-1 h-10"
                  >
                    تراجع
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? 'جاري الحذف...' : 'تأكيد الإلغاء'}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSaving || isDeleting}
                className="flex-1 h-12 text-lg"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isDeleting || !form.formState.isValid}
                className="flex-1 bg-primary hover:bg-[#4A1CB8] h-12 text-lg"
              >
                {isSaving
                  ? 'جاري الحفظ...'
                  : isEditing
                    ? 'تحديث الربط'
                    : 'تفعيل الربط'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};
