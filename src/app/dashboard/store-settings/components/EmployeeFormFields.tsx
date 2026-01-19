import { useMemo } from 'react';
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import { useIntegrations } from '../../integrations/hooks/useIntegrations';
import { If, Then } from 'react-if';
import { LogoUploadField } from './LogoUploadField';
import { URLField } from './URLField';
import { LanguageSelectionField } from './LanguageSelectionField';
import { CancellationReasonsField } from './CancellationReasonsField';
import { AutoCancelField } from './AutoCancelField';
import { ShippingSection } from './ShippingSection';
import { SectionHeader } from './SectionHeader';
import { Separator } from '@/components/ui/separator';

interface Props {
  register: UseFormRegister<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
  watch: UseFormWatch<OrderSettingsFormData>;
  setValue: UseFormSetValue<OrderSettingsFormData>;
}

export default function OrderSettingsFields({
  register,
  errors,
  watch,
  setValue,
}: Props) {
  const { integrations } = useIntegrations();
  const isApiConnected = useMemo(() => {
    return integrations?.some((item) => item.isActive);
  }, [integrations]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 w-full" dir="rtl">
      <div className="space-y-6 sm:space-y-8">
        <LogoUploadField watch={watch} setValue={setValue} errors={errors} />

        <Separator />

        <URLField register={register} errors={errors} />

        <Separator />

        <LanguageSelectionField register={register} />

        <Separator />

        <CancellationReasonsField
          watch={watch}
          setValue={setValue}
          errors={errors}
        />

        <Separator />

        <AutoCancelField register={register} errors={errors} />

        <If condition={isApiConnected}>
          <Then>
            <SectionHeader />
            <ShippingSection
              register={register}
              errors={errors}
              watch={watch}
            />
          </Then>
        </If>
      </div>
    </div>
  );
}
