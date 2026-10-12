"use client";

import { useState, useEffect } from "react";
import { LiaWalletSolid } from "react-icons/lia";
import { useBillingInfo } from "@/services/wallet";
import { Button } from "@/components/ui/button";
import { formatWalletAmount } from "../utils/formatWalletAmount";

interface WalletHeaderProps {
  onOpenCharge: () => void;
}

function WalletHeader({ onOpenCharge }: WalletHeaderProps) {
  const { data: billingInfo, isLoading, isError, refetch } = useBillingInfo();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header>
        <h1 className="text-3xl sm:text-4xl font-semibold mb-6 sm:mb-8 text-gray-800">محفظتي</h1>
        <div className="flex flex-wrap justify-between gap-4 w-full sm:w-2/3 md:w-1/2 xl:w-1/3 items-center bg-[#5d24e1] text-white px-5 sm:px-10 py-5 sm:py-7 rounded-lg">
          <div className="flex gap-2">
            <LiaWalletSolid className="w-7 h-7" />
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-xl sm:text-2xl">الرصيد الحالي</h3>
              <div className="flex gap-3 items-center">
                <div className="h-[23px] w-24 bg-white/20 rounded animate-pulse" />
                <div className="h-[23px] w-20 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="hidden sm:block bg-[#6a36e3] p-1 rounded-lg" aria-hidden="true">
            <LiaWalletSolid className="w-8 h-8" />
          </div>
        </div>
      </header>
    );
  }

  if (isError) {
    return (
      <header>
        <h1 className="text-3xl sm:text-4xl font-semibold mb-6 sm:mb-8 text-gray-800">محفظتي</h1>
        <div className="flex flex-wrap justify-between gap-4 w-full sm:w-2/3 md:w-1/2 xl:w-1/3 items-center bg-red-50 border border-red-200 text-red-700 px-5 sm:px-10 py-5 sm:py-7 rounded-lg">
          <div className="flex gap-2">
            <LiaWalletSolid className="w-7 h-7" />
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-xl sm:text-2xl">الرصيد الحالي</h3>
              <p className="font-medium text-[23px]">خطأ في تحميل الرصيد</p>
              <button type="button" onClick={() => refetch()} className="min-h-10 text-sm underline hover:no-underline text-start">
                إعادة المحاولة
              </button>
            </div>
          </div>
          <div className="hidden sm:block bg-red-100 p-1 rounded-lg" aria-hidden="true">
            <LiaWalletSolid className="w-8 h-8" />
          </div>
        </div>
      </header>
    );
  }

  const balance = billingInfo?.wallet?.balance ?? "0";
  const currency = billingInfo?.wallet?.currency ?? "EGP";
  const availableOrderCapacity = billingInfo?.availableOrderCapacity ?? 0;

  const capacityText =
    availableOrderCapacity === "unlimited"
      ? "(غير محدود)"
      : `(${availableOrderCapacity} اوردر)`;

  return (
    <header>
      <h1 className="text-3xl sm:text-4xl font-semibold mb-6 sm:mb-8 text-gray-800">محفظتي</h1>
      <div className="flex flex-wrap justify-between gap-4 w-full sm:w-2/3 md:w-1/2 xl:w-1/3 items-center bg-[#5d24e1] text-white px-5 sm:px-10 py-5 sm:py-7 rounded-lg">
        <div className="flex gap-2">
          <LiaWalletSolid className="w-7 h-7" />
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-xl sm:text-2xl">الرصيد الحالي</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
              <p className="font-medium text-xl sm:text-[23px]">
                {formatWalletAmount(balance, currency)}
              </p>
              <p className="font-light">{capacityText}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <Button variant="outline" className="h-10 w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={onOpenCharge}>
            <LiaWalletSolid className="w-4 h-4 me-1" />
            اشحن المحفظة
          </Button>
          <div className="hidden sm:block bg-[#6a36e3] p-1 rounded-lg" aria-hidden="true">
            <LiaWalletSolid className="w-8 h-8" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default WalletHeader;