'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LiaCheckSolid, LiaCopySolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  useLightfunnelsConnections,
  useLightfunnelsRedirectUri,
} from '../hooks/useLightfunnelsConnections';
import {
  type LightfunnelsConnection,
  type LightfunnelsWebhookMode,
} from '../types/apiIntegration';

const CONNECT_FALLBACK_ERROR = 'تعذر بدء الربط مع Lightfunnels';
const CLIENT_SECRET_REQUIRED = 'أدخل Client Secret الخاص بتطبيقك في Lightfunnels';

export function isLightfunnelsSecretRequired(
  connection: LightfunnelsConnection | undefined,
  clientId: string
): boolean {
  if (!connection?.hasClientSecret) return true;
  return clientId.trim() !== (connection.clientId ?? '');
}

const createConnectSchema = (connection: LightfunnelsConnection | undefined) =>
  z
    .object({
      clientId: z.string().trim().min(1, 'Client ID مطلوب'),
      clientSecret: z.string(),
    })
    .superRefine((data, ctx) => {
      if (
        isLightfunnelsSecretRequired(connection, data.clientId) &&
        data.clientSecret.trim() === ''
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['clientSecret'],
          message: CLIENT_SECRET_REQUIRED,
        });
      }
    });

type ConnectFormData = z.infer<ReturnType<typeof createConnectSchema>>;

interface LightfunnelsConnectFormProps {
  storeId: number;
  connection?: LightfunnelsConnection;
  submitLabel: string;
  onCancel?: () => void;
  cancelLabel?: string;
  disabled?: boolean;
  webhookMode?: LightfunnelsWebhookMode;
}

export default function LightfunnelsConnectForm({
  storeId,
  connection,
  submitLabel,
  onCancel,
  cancelLabel,
  disabled = false,
  webhookMode,
}: LightfunnelsConnectFormProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { connect, isConnecting } = useLightfunnelsConnections({ enabled: false });
  const redirect = useLightfunnelsRedirectUri(true);

  const schema = useMemo(() => createConnectSchema(connection), [connection]);

  const form = useForm<ConnectFormData>({
    resolver: zodResolver(schema),
    defaultValues: { clientId: connection?.clientId ?? '', clientSecret: '' },
  });

  const watchedClientId = form.watch('clientId');
  const secretRequired = isLightfunnelsSecretRequired(connection, watchedClientId ?? '');
  const isBusy = disabled || isConnecting || isRedirecting;
  const requiredScopes = redirect.scopes;

  const handleCopy = () => {
    if (!redirect.redirectUri) return;
    navigator.clipboard.writeText(redirect.redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = form.handleSubmit(async (data) => {
    setError('');
    const clientSecret = data.clientSecret.trim();
    try {
      const { authorizeUrl } = await connect({
        storeId,
        clientId: data.clientId.trim(),
        ...(clientSecret !== '' && { clientSecret }),
        ...(webhookMode && { webhookMode }),
      });
      setIsRedirecting(true);
      window.location.assign(authorizeUrl);
    } catch (err) {
      setError(getApiErrorMessage(err, CONNECT_FALLBACK_ERROR));
    }
  });

  const handleEnterKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!isBusy) submit();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-100">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="block font-medium text-sm">Redirect URI</span>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleCopy}
              disabled={!redirect.redirectUri}
              className="gap-1.5 h-7 text-xs"
            >
              {copied ? (
                <LiaCheckSolid className="w-3 h-3" />
              ) : (
                <LiaCopySolid className="w-3 h-3" />
              )}
              {copied ? 'تم النسخ' : 'نسخ'}
            </Button>
          </div>
          <Input
            value={redirect.redirectUri}
            inputClassName="text-sm bg-gray-50"
            placeholder={redirect.isLoading ? 'جاري التحميل...' : 'https://...'}
            error={
              redirect.isError
                ? getApiErrorMessage(redirect.error, 'تعذر تحميل رابط إعادة التوجيه')
                : undefined
            }
            disabled
          />
          {requiredScopes && (
            <p className="text-xs text-gray-500 mt-2">
              الصلاحيات المطلوبة: <span className="font-mono">{requiredScopes}</span>
            </p>
          )}
        </div>

        <Input
          register={form.register}
          name="clientId"
          label="Client ID *"
          placeholder="أدخل Client ID..."
          error={form.formState.errors.clientId?.message}
          disabled={isBusy}
          onKeyDown={handleEnterKey}
        />
        <Input
          register={form.register}
          name="clientSecret"
          type="password"
          label={
            secretRequired
              ? 'Client Secret *'
              : 'Client Secret (اتركه فارغاً إن لم ترد تغييره)'
          }
          placeholder="أدخل Client Secret..."
          error={form.formState.errors.clientSecret?.message}
          disabled={isBusy}
          onKeyDown={handleEnterKey}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={() => submit()}
          disabled={isBusy}
          loading={isConnecting || isRedirecting}
          className="flex-1 bg-primary text-white h-10"
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isBusy}
            className="h-10 px-6"
          >
            {cancelLabel ?? 'إلغاء'}
          </Button>
        )}
      </div>
    </div>
  );
}
