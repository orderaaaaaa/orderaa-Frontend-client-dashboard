'use client';

import { memo } from 'react';
import { LiaUserTieSolid, LiaTagSolid } from 'react-icons/lia';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { INVOICE_CREATORS, NICKNAMES } from '../constants';

interface InvoiceDropdownsProps {
  creator: string;
  nickname: string;
  onCreatorChange: (value: string) => void;
  onNicknameChange: (value: string) => void;
  errors?: { creator?: string; nickname?: string };
}

const InvoiceDropdowns = memo(
  ({
    creator,
    nickname,
    onCreatorChange,
    onNicknameChange,
    errors,
  }: InvoiceDropdownsProps) => {
    return (
      <div className="sm:px-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-base font-normal">
            <LiaUserTieSolid className="w-6 h-6 text-primary" />
            <span>منشئ الفاتورة</span>
          </label>
          <SearchableSelect
            value={creator}
            onChange={onCreatorChange}
            options={INVOICE_CREATORS}
            placeholder="اختر منشئ الفاتورة"
            error={errors?.creator}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-base font-normal">
            <LiaTagSolid className="w-6 h-6 text-primary" />
            <span>اللقب / nickname</span>
          </label>
          <SearchableSelect
            value={nickname}
            onChange={onNicknameChange}
            options={NICKNAMES}
            placeholder="اختر اللقب"
            error={errors?.nickname}
          />
        </div>
      </div>
    );
  },
);

InvoiceDropdowns.displayName = 'InvoiceDropdowns';

export default InvoiceDropdowns;
