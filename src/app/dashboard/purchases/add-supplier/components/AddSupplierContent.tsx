'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { LiaTimesSolid, LiaSaveSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import BaseModal from '@/components/ui/base-modal';
import AddSupplierHeader from './AddSupplierHeader';
import { addSupplierSchema, AddSupplierFormData } from '../schema';
import { useGovernoratesQuery } from '@/services/lookups';
import { useCreateSupplierMutation } from '@/services/suppliers';

export function AddSupplierContent() {
  const router = useRouter();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: governorates = [], isLoading: loadingGovernorates } =
    useGovernoratesQuery();
  const createSupplierMutation = useCreateSupplierMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddSupplierFormData>({
    resolver: zodResolver(addSupplierSchema),
    defaultValues: {
      nickname: '',
      officialName: '',
      phone: '',
      email: '',
      governorate: '',
    },
  });

  const governorate = watch('governorate');

  const onSubmit = useCallback(
    async (data: AddSupplierFormData) => {
      setSubmitError(null);
      try {
        await createSupplierMutation.mutateAsync({
          nickname: data.nickname,
          name: data.officialName,
          phoneNumber: data.phone,
          email: data.email || undefined,
          governorate: data.governorate || undefined,
        });
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          router.push('/dashboard/purchases/all-suppliers');
        }, 2000);
      } catch (err: any) {
        setSubmitError(err?.response?.data?.message || 'حدث خطأ أثناء إضافة المورد');
      }
    },
    [router, createSupplierMutation],
  );

  return (
    <div className="w-full max-w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-8 pb-8"
      >
        <AddSupplierHeader />

        <div className="sm:px-8 flex flex-col gap-6">
          <h2 className="text-base font-semibold text-gray-800">
            معلومات المورد
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                اللقب / Nickname
              </label>
              <Input
                name="nickname"
                register={register}
                placeholder="المورد الذهبي"
                inputClassName="bg-white"
                error={errors.nickname?.message}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                الاسم الرسمي
              </label>
              <Input
                name="officialName"
                register={register}
                placeholder="احمد محمد"
                inputClassName="bg-white"
                error={errors.officialName?.message}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                رقم التواصل
              </label>
              <Input
                name="phone"
                register={register}
                placeholder="01200345678"
                inputClassName="bg-white"
                error={errors.phone?.message}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                البريد الالكتروني (اختياري)
              </label>
              <Input
                name="email"
                type="email"
                register={register}
                placeholder="ahmed@gmail.com"
                inputClassName="bg-white"
                error={errors.email?.message}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                المحافظة
              </label>
              <SearchableSelect
                value={governorate}
                onChange={(v) =>
                  setValue('governorate', v, { shouldValidate: true })
                }
                options={governorates}
                placeholder={
                  loadingGovernorates ? 'جاري التحميل...' : 'المحافظة'
                }
                disabled={loadingGovernorates}
                widthClass="w-full"
                error={errors.governorate?.message}
              />
            </div>
          </div>
        </div>

        {submitError && (
          <p className="sm:px-8 text-red-500 text-sm -mt-4">{submitError}</p>
        )}

        <div className="flex items-center gap-3 sm:px-8 justify-end">
          <Button
            type="submit"
            variant="default"
            disabled={createSupplierMutation.isPending}
            className="rounded-full font-semibold text-sm px-8 flex items-center gap-2"
          >
            حفظ
            <LiaSaveSolid className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full font-semibold text-sm px-8 flex items-center gap-2"
            onClick={() =>
              router.push('/dashboard/purchases/all-suppliers')
            }
          >
            الغاء
            <LiaTimesSolid className="w-4 h-4" />
          </Button>
        </div>
      </form>

      <BaseModal
        isOpen={isSuccessModalOpen}
        onClose={() => router.push('/dashboard/purchases/all-suppliers')}
        title=""
        showFooter={false}
      >
        <div className="flex flex-col items-center gap-6 py-4">
          <svg
            className="w-24 h-24"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="48"
              cy="48"
              r="46"
              stroke="#bbf7d0"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-[draw-circle_0.6s_ease-out_forwards]"
              style={{
                strokeDasharray: 289,
                strokeDashoffset: 289,
              }}
            />
            <path
              d="M28 50 L42 64 L68 34"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-[draw-check_0.4s_ease-out_0.5s_forwards]"
              style={{
                strokeDasharray: 80,
                strokeDashoffset: 80,
              }}
            />
          </svg>
          <p className="text-lg font-bold text-gray-800">
            تم إضافة مورد جديد بنجاح
          </p>
        </div>
      </BaseModal>
    </div>
  );
}
