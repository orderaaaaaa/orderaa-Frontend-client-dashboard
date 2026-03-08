import React from 'react';
import { LiaBanSolid } from 'react-icons/lia';
import { If, Then } from 'react-if';
import { CustomersDetailsHeaderProps } from '../../../types/CustomersDetailsModal';

export const CustomersDetailsHeader = ({
  isBlocked,
  username,
}: CustomersDetailsHeaderProps) => {
  return (
    <div className="mb-6 mt-4 md:mt-0">
      <div className="flex items-center gap-3">
        <If condition={isBlocked}>
          <Then>
            <LiaBanSolid className="text-red-500 w-5 h-5 md:w-6 md:h-6" />
          </Then>
        </If>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {username}
        </h1>
      </div>
    </div>
  );
};
