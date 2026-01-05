import { useState, useEffect, useMemo } from 'react';
import Input from '@/components/ui/Input';
import {
  Phone,
  PackageOpen,
  Edit3,
  FilePenLine,
  RotateCcw,
  CopyX,
  Image as ImageIcon,
  Upload,
  X,
  Hash,
} from 'lucide-react';

import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import { useIntegrations } from '../../integrations/hooks/useIntegrations';
import { If, Then } from 'react-if';

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
  const canEditOrderValue = watch('employeeCanEditContent');
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const reasons = watch('cancellationReasons') || [];
  const [inputValue, setInputValue] = useState('');
  const logoFile = watch('logo');

  useEffect(() => {
    if (logoFile && logoFile[0] instanceof File) {
      const objectUrl = URL.createObjectURL(logoFile[0]);
      setPreview(objectUrl);
      setSelectedFile(logoFile[0]);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [logoFile]);

  const { integrations } = useIntegrations();

  const isApiConnected = useMemo(() => {
    return integrations?.some((item) => item.isActive);
  }, [integrations]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileChange(file);
      }
    }
  };

  const handleFileChange = (file: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    setValue('logo', dataTransfer.files);
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setValue('logo', undefined);
    setPreview(null);
    setSelectedFile(null);
  };

  const addReason = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // Prevent duplicates
      if (!reasons.includes(inputValue.trim())) {
        setValue('cancellationReasons', [...reasons, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeReason = (indexToRemove: number) => {
    const updatedreasons = reasons.filter(
      (_, index) => index !== indexToRemove
    );
    setValue('cancellationReasons', updatedreasons);
  };

  const ToggleSwitch = ({
    name,
    checked,
  }: {
    name: keyof OrderSettingsFormData;
    checked: boolean;
  }) => (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        {...register(name)}
      />
      <div
        className="relative w-[66px] h-[30px] bg-gray-200 peer-focus:outline-none rounded-full 
                  peer peer-checked:after:translate-x-full peer-checked:after:border-white 
                  after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white 
                  after:border-gray-300 after:border after:rounded-full after:h-[30px] after:w-[30px] 
                  after:transition-all peer-checked:bg-primary 
                  rtl:peer-checked:after:-translate-x-full rtl:after:left-auto rtl:after:right-0
                  scale-75 md:scale-100 origin-right"
      />
    </label>
  );

  return (
    <div className="px-4 md:px-10 py-6 md:py-[34px]" dir="rtl">
      <div className="flex lg:w-[37%] flex-col gap-8">
        <div className="w-full md:w-2/3 xl:w-1/2 flex flex-col gap-4 border-b border-gray-100 pb-6">
          <div className="w-full flex items-start gap-2">
            <ImageIcon className="w-6 h-6 text-primary mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                شعار المتجر
              </h3>
              <p className="text-sm text-gray-500">
                قم برفع شعار المتجر الخاص بك
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-4">
            <div
              className={`flex-1 w-full min-h-[120px] border-2 border-dashed rounded-lg transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 bg-gray-50 hover:border-primary'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-6">
                {preview ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-32 object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveImage();
                      }}
                      className="absolute top-0 right-0 cursor-pointer bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      اسحب الصورة وأفلتها هنا
                    </p>
                    <p className="text-xs text-gray-400">أو</p>
                    <span className="text-sm text-primary font-medium mt-1">
                      تصفح الملفات
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </label>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            يرجى اختيار صورة بصيغة PNG أو JPG (الحد الأقصى: 5MB)
          </div>

          {errors.logo && (
            <p className="text-red-500 text-xs">
              {errors.logo.message as string}
            </p>
          )}
        </div>
        {/* Language Selection */}
        <div className="w-full flex flex-col gap-4 border-b border-gray-100 pb-6">
          <div className="w-full flex items-start gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <span className="text-primary font-bold">A/ع</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                لغة بوليصة الشحن
              </h3>
              <p className="text-sm text-gray-500">
                اختار اللغة التي تريد طباعه بوليصة الشحن بها{' '}
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  value="ar"
                  {...register('language')}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-primary transition-all"
                />
                <div className="absolute w-2.5 h-2.5 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-gray-700 font-medium group-hover:text-primary transition-colors">
                العربية
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  value="en"
                  {...register('language')}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-primary transition-all"
                />
                <div className="absolute w-2.5 h-2.5 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-gray-700 font-medium group-hover:text-primary transition-colors">
                English
              </span>
            </label>
          </div>
        </div>

        {/* Cancellation Reasons Field */}
        <div className="w-full flex flex-col gap-4 border-b border-gray-100 pb-6">
          <div className="w-full flex items-start gap-2">
            <Hash className="w-6 h-6 text-primary mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                اسباب الغاء الطلب
              </h3>
              <p className="text-sm text-gray-500">
                أضف الأسباب التي تظهر عند إلغاء الطلب
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 p-2 border-2 border-gray-200 rounded-xl bg-gray-50 focus-within:border-primary transition-all">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-primary text-white font-semibold px-3 py-1.5 rounded-full text-sm"
              >
                <span>{reason}</span>
                <button
                  type="button"
                  onClick={() => removeReason(index)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={addReason}
              placeholder="اكتب السبب واضغط Enter"
              className="flex-1 bg-transparent outline-none py-1 px-2 text-sm min-w-[120px]"
            />
          </div>
          {errors.cancellationReasons && (
            <p className="text-red-500 text-xs">
              {errors.cancellationReasons.message}
            </p>
          )}
        </div>

        {/* Auto Cancel */}
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex items-start gap-2">
            <CopyX className="w-6 h-6 text-primary mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                الالغاء التلقائي للطلب
              </h3>
              <p className="text-sm text-gray-500">
                الغاء الطلب تلقائي بعد كام محاوله؟
              </p>
            </div>
          </div>
          <Input
            name="autoCancelAttempts"
            register={register}
            registerOptions={{
              valueAsNumber: true,
              setValueAs: (v: any) => (v === '' ? undefined : parseInt(v, 10)),
            }}
            type="number"
            placeholder="مثال: 3"
            error={errors.autoCancelAttempts?.message}
            className="!h-[46px] bg-[#EAEAEA40] text-right w-full !px-5"
          />
        </div>
        <div className="flex items-center gap-3 mb-3 mt-5">
          <div className="w-1 h-8 bg-primary rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-900">قسم الشحن</h2>
        </div>
        <If condition={!isApiConnected}>
          <Then>
            {/* Phone Number */}
            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex items-start gap-2">
                <Phone className="w-6 h-6 text-primary mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold leading-tight">
                    رقم الهاتف
                  </h3>
                  <p className="text-sm text-gray-500">
                    اضف رقم للمتابعه مع شركه الشحن
                  </p>
                </div>
              </div>
              <Input
                name="shippingPhoneNumber"
                className="!px-5"
                register={register}
                registerOptions={{
                  setValueAs: (v: string) => (v === '' ? undefined : v),
                }}
                placeholder="01xxxxxxxxx"
                error={errors.shippingPhoneNumber?.message}
              />
            </div>

            {/* Open Order */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-6">
              <div className="flex items-start gap-3">
                <PackageOpen className="w-6 h-6 text-primary mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold leading-tight">
                    فتح الشحنة
                  </h3>
                  <p className="text-sm text-gray-500">
                    هل تريد معاينه الشحنه من قبل العميل؟
                  </p>
                </div>
              </div>
              <ToggleSwitch
                name="canOpenShipment"
                checked={!!watch('canOpenShipment')}
              />
            </div>

            {/* Edit Order */}
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Edit3 className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold leading-tight">
                      تعديل محتوي الشحنة
                    </h3>
                    <p className="text-sm text-gray-500">
                      امكانيه تعديل محتوي الشحنه من قبل الموظف
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  name="employeeCanEditContent"
                  checked={!!watch('employeeCanEditContent')}
                />
              </div>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  canEditOrderValue
                    ? 'max-h-40 opacity-100 mt-2'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FilePenLine className="w-5 h-5 text-primary" />
                  <span className="text-base">اسم المنتج</span>
                </div>
                <Input
                  name="defaultShipmentContent"
                  register={register}
                  placeholder="أدخل اسم المنتج"
                  error={errors.defaultShipmentContent?.message}
                  className="!h-[46px] bg-[#EAEAEA40] text-right w-full !px-5"
                />
              </div>
            </div>

            {/* Return Cost */}
            <div className="w-full flex flex-col gap-4 border-b border-gray-100 pb-6">
              <div className="w-full flex items-start gap-2">
                <RotateCcw className="w-6 h-6 text-primary mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold leading-tight">
                    تكلفة مرتجع الشحن
                  </h3>
                  <p className="text-sm text-gray-500">
                    في حاله رفض العميل استلام الشحنة يتم دفع مبلغ.
                  </p>
                </div>
              </div>
              <Input
                name="defaultReturnShippingCost"
                register={register}
                type="text"
                placeholder="0.00"
                className="!h-[46px] bg-[#EAEAEA40] text-right w-full !px-5"
              />
            </div>
          </Then>
        </If>
      </div>
    </div>
  );
}
