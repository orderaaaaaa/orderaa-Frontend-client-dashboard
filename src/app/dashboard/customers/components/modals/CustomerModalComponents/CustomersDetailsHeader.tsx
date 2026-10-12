import React from 'react';
import { LiaBanSolid } from 'react-icons/lia';
import { CustomersDetailsHeaderProps } from '../../../types/CustomersDetailsModal';
import { CustomerBadgeChip } from '../../CustomerBadgeChip';

export const CustomersDetailsHeader = ({
  isBlocked,
  username,
  badge,
}: CustomersDetailsHeaderProps) => {
  return (
    <div className="mb-6 mt-4 md:mt-0">
      <div className="flex flex-wrap items-center gap-3">
        {isBlocked && (
          <LiaBanSolid
            className="text-red-500 w-5 h-5 md:w-6 md:h-6"
            aria-label="محظور"
          />
        )}
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words min-w-0">
          {username}
        </h1>
        <CustomerBadgeChip badge={badge} />
      </div>
    </div>
  );
};
