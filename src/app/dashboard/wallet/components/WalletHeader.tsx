import React from 'react';
import { LiaWalletSolid } from 'react-icons/lia';

function WalletHeader() {
  return (
    <header>
      <h1 className="text-4xl font-semibold mb-8 text-gray-800">محفظتي</h1>
      <div className="flex justify-between items-center bg-[#5d24e1] text-white px-10 py-5 rounded-lg">
        <div className="flex gap-2">
          <LiaWalletSolid className="w-7 h-7" />
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-xl">الرصيد الحالي</h3>
            <div className="flex gap-3">
              <p className="font-medium text-[18px]">
                1250
                <span className="ml-1">EGP</span>
              </p>
              <p className="font-light">(20 اوردر)</p>
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

export default WalletHeader;
