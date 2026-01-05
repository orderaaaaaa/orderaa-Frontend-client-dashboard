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
import { LanguageSelectionField } from './LanguageSelectionField';
import { CancellationReasonsField } from './CancellationReasonsField';
import { AutoCancelField } from './AutoCancelField';
import { ShippingSection } from './ShippingSection';
import { SectionHeader } from './SectionHeader';

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
    <div className="px-4 md:px-10 py-6 md:py-[34px]" dir="rtl">
      <div className="flex lg:w-[37%] flex-col gap-8">
        <LogoUploadField watch={watch} setValue={setValue} errors={errors} />

        <LanguageSelectionField register={register} />

        <CancellationReasonsField
          watch={watch}
          setValue={setValue}
          errors={errors}
        />

        <AutoCancelField register={register} errors={errors} />

        <SectionHeader />

        <If condition={!isApiConnected}>
          <Then>
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
