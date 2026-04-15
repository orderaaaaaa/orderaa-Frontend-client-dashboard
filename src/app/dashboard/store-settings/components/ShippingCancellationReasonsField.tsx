'use client';

import { useState } from 'react';
import { LiaTimesSolid, LiaBanSolid } from 'react-icons/lia';
import {
  useShippingCancellationReasons,
  useCreateShippingCancellationReason,
  useDeleteShippingCancellationReason,
} from '@/services/logistics';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import PageLoading from '@/components/ui/page-loading';

export function ShippingCancellationReasonsField() {
  const [inputValue, setInputValue] = useState('');
  const { data: reasons, isLoading } = useShippingCancellationReasons();
  const { mutate: createReason, isPending: isCreating } =
    useCreateShippingCancellationReason();
  const { mutate: deleteReason } = useDeleteShippingCancellationReason();

  const handleAddReason = () => {
    const value = inputValue.trim();
    if (!value) return;

    const isDuplicate = reasons?.some((r) => r.reasonName === value);
    if (isDuplicate) return;

    createReason(value);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddReason();
    }
  };

  const handleRemoveReason = (reasonId: number) => {
    deleteReason(reasonId);
  };

  if (isLoading) {
    return <PageLoading size="sm" className="py-6 min-h-0" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <LiaBanSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            اسباب الغاء الشحن
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            أضف الأسباب التي تظهر عند إلغاء الشحنة
          </p>
        </div>
      </div>

      <div
        dir="rtl"
        className="relative w-full border-2 border-gray-200 rounded-xl bg-gray-50 focus-within:border-primary transition-all p-2 sm:p-3"
      >
        <Button
          type="button"
          size="sm"
          onClick={handleAddReason}
          disabled={!inputValue.trim() || isCreating}
          className="absolute left-2 bottom-2 w-16 sm:w-20 h-8 rounded-lg text-xs sm:text-sm font-semibold"
        >
          {isCreating ? '...' : 'إضافة'}
        </Button>

        <div className="flex flex-wrap items-center gap-2 pr-0 pl-20 sm:pl-24 min-h-[32px]">
          {(reasons ?? []).map((reason) => (
            <div
              key={reason.id}
              className="flex items-center gap-1.5 bg-primary text-white font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm"
            >
              <span>{reason.reasonName}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemoveReason(reason.id)}
                className="hover:text-red-500 transition-colors hover:bg-inherit"
              >
                <LiaTimesSolid />
              </Button>
            </div>
          ))}

          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب السبب"
            className="flex-1 min-w-[80px]"
            inputClassName="bg-transparent border-none shadow-none py-1 px-2 text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
