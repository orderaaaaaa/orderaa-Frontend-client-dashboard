"use client";

import { useState, useEffect } from "react";
import { LiaWalletSolid } from "react-icons/lia";
import { useBillingInfo } from "@/services/wallet";
import { Button } from "@/components/ui/button";

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
        <h1 className="text-4xl font-semibold mb-8 text-gray-800">محفظتي</h1>
        <div className="flex justify-between w-full sm:w-2/3 md:w-1/2 xl:w-1/3 items-center bg-[#5d24e1] text-white px-10 py-7 rounded-lg">
          <div className="flex gap-2">
            <LiaWalletSolid className="w-7 h-7" />
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-2xl">الرصيد الحالي</h3>
              <div className="flex gap-3 items-center">
                <div className="h-[23px] w-24 bg-white/20 rounded animate-pulse" />
                <div className="h-[23px] w-20 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="bg-[#6a36e3] p-1 rounded-lg">
            <LiaWalletSolid className="w-8 h-8" />
          </div>
        </div>
      </header>
    );
  }

  if (isError) {
    return (
      <header>
        <h1 className="text-4xl font-semibold mb-8 text-gray-800">محفظتي</h1>
        <div className="flex justify-between w-full sm:w-2/3 md:w-1/2 xl:w-1/3 items-center bg-red-50 border border-red-200 text-red-700 px-10 py-7 rounded-lg">
          <div className="flex gap-2">
            <LiaWalletSolid className="w-7 h-7" />
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-2xl">الرصيد الحالي</h3>
              <p className="font-medium text-[23px]">خطأ في تحميل الرصيد</p>
              <button onClick={() => refetch()} className="text-sm underline hover:no-underline mt-1 text-right">
                إعادة المحاولة
              </button>
            </div>
          </div>
          <div className="bg-red-100 p-1 rounded-lg">
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
      <h1 className="text-4xl font-semibold mb-8 text-gray-800">محفظتي</h1>
      <div className="flex justify-between w-full sm:w-2/3 md:w-1/2 xl:w-1/3 items-center bg-[#5d24e1] text-white px-10 py-7 rounded-lg">
        <div className="flex gap-2">
          <LiaWalletSolid className="w-7 h-7" />
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-2xl">الرصيد الحالي</h3>
            <div className="flex gap-3 items-center">
              <p className="font-medium text-[23px]">
                {balance}
                <span className="ml-1">{currency}</span>
              </p>
              <p className="font-light">{capacityText}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={onOpenCharge}>
            <LiaWalletSolid className="w-4 h-4 ml-1" />
            اشحن المحفظة
          </Button>
          <div className="bg-[#6a36e3] p-1 rounded-lg">
            <LiaWalletSolid className="w-8 h-8" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default WalletHeader;