import React from 'react';
import { LiaBoxSolid, LiaPlusSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import { PERMISSION_CODES } from '@/lib/permissions';

/**
 * Props for PackagingNotesSection component
 */
export interface PackagingNotesSectionProps {
  packagingNotes?: string | null;
  onAddClick: () => void;
  className?: string;
}

/**
 * PackagingNotesSection Component
 *
 * Displays packaging notes with an add button
 *
 * @param props - Component props
 */
export function PackagingNotesSection({
  packagingNotes,
  onAddClick,
  className = '',
}: PackagingNotesSectionProps) {
  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]";

  return (
    <div className={`flex flex-col gap-2 mt-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-primary font-bold text-lg">ملاحظات التغليف</h2>
        <Can code={PERMISSION_CODES.ORDERS_UPDATE}>
          <Button
            variant="ghost"
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg hover:bg-purple-50 transition-colors font-bold"
          >
            <LiaPlusSolid className="w-4 h-4" />
            إضافة ملاحظة
          </Button>
        </Can>
      </div>
      {packagingNotes && (
        <div className={`${tagStyle} min-h-[60px]`}>
          <LiaBoxSolid size={18} />
          <p className="flex-1 whitespace-pre-wrap">{packagingNotes}</p>
        </div>
      )}
    </div>
  );
}
