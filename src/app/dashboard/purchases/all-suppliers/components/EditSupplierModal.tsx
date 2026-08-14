'use client';

import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { LiaSaveSolid, LiaTimesSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  addSupplierSchema,
  AddSupplierFormData,
} from '../../add-supplier/schema';
import { useGovernoratesQuery } from '@/services/lookups';
import { useUpdateSupplierMutation } from '@/services/suppliers';
import { Supplier } from '../types';

interface EditSupplierModalProps {
  supplier: Supplier;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditSupplierModal({
  supplier,
  isOpen,
  onClose,
}: EditSupplierModalProps) {
  const { data: governorates = [], isLoading: loadingGovernorates } =
    useGovernoratesQuery();
  const updateSupplierMutation = useUpdateSupplierMutation(supplier.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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

  // Prefill from the row already in the list — no extra fetch. Keyed on the
  // supplier id as well as `isOpen` so reopening for a different supplier does
  // not show the previous one's data, and so an abandoned edit is discarded.
  useEffect(() => {
    if (!isOpen) return;
    reset({
      nickname: supplier.nickname ?? '',
      officialName: supplier.name ?? '',
      phone: supplier.phoneNumber ?? '',
      email: supplier.email ?? '',
      governorate: supplier.governorate ?? '',
    });
  }, [
    isOpen,
    supplier.id,
    supplier.nickname,
    supplier.name,
    supplier.phoneNumber,
    supplier.email,
    supplier.governorate,
    reset,
  ]);

  const onSubmit = useCallback(
    async (data: AddSupplierFormData) => {
      try {
        await updateSupplierMutation.mutateAsync({
          nickname: data.nickname,
          name: data.officialName,
          phoneNumber: data.phone,
          // Blank optionals go out as undefined, never '' — an empty string
          // would overwrite a real stored value.
          email: data.email || undefined,
          governorate: data.governorate || undefined,
        });
        toast.success('تم تحديث بيانات المورد بنجاح');
        onClose();
      } catch (err: any) {
        // Keep the modal open so the user does not lose their input.
        toast.error(
          err?.response?.data?.message || 'حدث خطأ أثناء تحديث بيانات المورد',
        );
      }
    },
    [updateSupplierMutation, onClose],
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل بيانات المورد"
      showFooter={false}
      maxWidth="md:max-w-[700px]"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-6"
      >
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
              placeholder={loadingGovernorates ? 'جاري التحميل...' : 'المحافظة'}
              disabled={loadingGovernorates}
              widthClass="w-full"
              error={errors.governorate?.message}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Button
            type="submit"
            variant="default"
            disabled={updateSupplierMutation.isPending}
            className="rounded-full font-semibold text-sm px-8 flex items-center gap-2"
          >
            حفظ
            <LiaSaveSolid className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full font-semibold text-sm px-8 flex items-center gap-2"
            onClick={onClose}
          >
            الغاء
            <LiaTimesSolid className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
