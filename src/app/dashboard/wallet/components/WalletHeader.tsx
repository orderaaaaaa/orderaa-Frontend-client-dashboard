import React from 'react';
import { LiaWalletSolid } from 'react-icons/lia';
import { IoIosTrendingUp } from 'react-icons/io';

function WalletHeader() {
  return (
    <header>
      <h1 className="text-3xl md:text-4xl font-semibold mb-8 text-gray-800">
        محفظتي
      </h1>
      {/* Changed to 1 column on mobile, 2 columns on medium screens and up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Wallet Card */}
        <div className="flex justify-between items-center bg-primary text-white px-5 md:px-10 py-7 rounded-lg">
          <div className="flex gap-2">
            <LiaWalletSolid className="w-7 h-7" />
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-xl md:text-2xl">
                الرصيد الحالي
              </h3>
              <div className="flex gap-3 items-center">
                <p className="font-medium text-[20px] md:text-[23px]">
                  1250
                  <span className="ml-1">EGP</span>
                </p>
                <p className="font-light text-sm md:text-base">(20 اوردر)</p>
              </div>
            </div>
          </div>
          <div className="bg-[#6a36e3] p-1 rounded-lg">
            <LiaWalletSolid className="w-8 h-8" />
          </div>
        </div>

        {/* Trending Card */}
        <div className="flex justify-between items-center bg-[#35AF00] text-white px-5 md:px-10 py-7 rounded-lg">
          <div className="flex gap-2">
            <IoIosTrendingUp className="w-7 h-7" />
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-xl md:text-2xl">
                الرصيد الحالي
              </h3>
              <div className="flex gap-3 items-center">
                <p className="font-medium text-[20px] md:text-[23px]">
                  1250
                  <span className="ml-1">EGP</span>
                </p>
                <p className="font-light text-sm md:text-base">(20 اوردر)</p>
              </div>
            </div>
          </div>
          <div className="bg-[#FFFFFF14] p-1 rounded-lg">
            <IoIosTrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default WalletHeader;
