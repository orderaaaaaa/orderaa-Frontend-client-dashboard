'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/state-panels';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';
import {
  useUpdateWhatsAppTemplates,
  useWhatsAppTemplatesQuery,
} from '@/services/whatsappTemplates';
import type {
  WhatsAppTemplate,
  WhatsAppTemplateKind,
  WhatsAppTemplatesResponse,
} from '@/types/whatsappTemplates';
import {
  whatsappTemplatesSchema,
  type WhatsAppTemplatesFormData,
} from '../schemas/whatsappTemplates';
import WhatsAppTemplateField from './WhatsAppTemplateField';
import { GroupSection } from './SectionHeader';

const DIRTY_KEY = 'whatsapp-templates';

const KINDS: WhatsAppTemplateKind[] = ['SHIPMENT_CUSTOMER', 'SHIPMENT_COURIER'];

const FIELD_TITLES: Record<WhatsAppTemplateKind, string> = {
  SHIPMENT_CUSTOMER: 'رسالة العميل',
  SHIPMENT_COURIER: 'رسالة المندوب',
};

const toFormValues = (
  templates: WhatsAppTemplate[]
): WhatsAppTemplatesFormData =>
  Object.fromEntries(
    templates.map((template) => [template.kind, template.body ?? template.defaultBody])
  ) as WhatsAppTemplatesFormData;

interface WhatsAppTemplatesSectionProps {
  onDirtyChange?: (key: string, isDirty: boolean) => void;
}

export default function WhatsAppTemplatesSection({
  onDirtyChange,
}: WhatsAppTemplatesSectionProps = {}) {
  const { hasPermission } = usePermissionCheck();
  const canRead = hasPermission(PERMISSIONS.MERCHANT_SETTINGS_READ);
  const canEdit = hasPermission(PERMISSIONS.MERCHANT_SETTINGS_UPDATE);
  const { data, isLoading, isError, error, refetch } = useWhatsAppTemplatesQuery({
    enabled: canRead,
  });
  const updateMutation = useUpdateWhatsAppTemplates();

  const {
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<WhatsAppTemplatesFormData>({
    resolver: zodResolver(whatsappTemplatesSchema),
    mode: 'onChange',
    defaultValues: { SHIPMENT_CUSTOMER: '', SHIPMENT_COURIER: '' },
  });

  useEffect(() => {
    if (data) reset(toFormValues(data.templates));
  }, [data, reset]);

  useEffect(() => {
    if (!onDirtyChange) return;
    onDirtyChange(DIRTY_KEY, isDirty);
    return () => onDirtyChange(DIRTY_KEY, false);
  }, [isDirty, onDirtyChange]);

  if (!canRead) return null;

  const defaultBodyOf = (kind: WhatsAppTemplateKind) =>
    data?.templates.find((template) => template.kind === kind)?.defaultBody ?? '';

  const handleSave = handleSubmit((values) => {
    updateMutation.mutate({
      templates: KINDS.map((kind) => {
        const trimmed = values[kind].trim();
        return {
          kind,
          body: trimmed === '' || trimmed === defaultBodyOf(kind) ? null : trimmed,
        };
      }),
    });
  });

  return (
    <Card className="mt-6">
      <CardContent className="p-4 sm:p-6 lg:p-10">
        <GroupSection
          title="رسائل واتساب لشركات الشحن"
          description="تُستخدم في أزرار واتساب بصفحة متابعة شركة الشحن"
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3" aria-busy="true">
              {KINDS.map((kind) => (
                <div key={kind} className="h-64 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : isError || !data ? (
            <ErrorState
              error={error}
              fallback="تعذّر تحميل رسائل واتساب"
              onRetry={() => refetch()}
            />
          ) : (
            <div className="space-y-6">
              {!canEdit && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  لا تملك صلاحية تعديل إعدادات المتجر، لذلك تظهر الرسائل للعرض فقط.
                </p>
              )}

              {KINDS.map((kind) => (
                <WhatsAppTemplateField
                  key={kind}
                  id={`whatsapp-template-${kind}`}
                  title={FIELD_TITLES[kind]}
                  value={watch(kind)}
                  defaultBody={defaultBodyOf(kind)}
                  error={errors[kind]?.message}
                  readOnly={!canEdit}
                  onChange={(next) =>
                    setValue(kind, next, { shouldDirty: true, shouldValidate: true })
                  }
                />
              ))}

              {canEdit && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    className="h-10 rounded-full px-8 font-bold"
                    disabled={!isDirty || updateMutation.isPending}
                    loading={updateMutation.isPending}
                    loadingText="جاري الحفظ..."
                    onClick={handleSave}
                  >
                    حفظ الرسائل
                  </Button>
                </div>
              )}
            </div>
          )}
        </GroupSection>
      </CardContent>
    </Card>
  );
}
