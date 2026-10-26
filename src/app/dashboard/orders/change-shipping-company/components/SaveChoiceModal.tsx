'use client';

import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { CHANGE_COMPANY_TEXT } from '../constants/changeCompany';
import { CHANGE_COMPANY_CHOICE, type ChangeCompanyChoice } from '../types/bulkCompanySwitch';

interface SaveChoiceModalProps {
  isOpen: boolean;
  sendableCount: number;
  skippedCount: number;
  onClose: () => void;
  onChoose: (choice: ChangeCompanyChoice) => void;
}

export function SaveChoiceModal({
  isOpen,
  sendableCount,
  skippedCount,
  onClose,
  onChoose,
}: SaveChoiceModalProps) {
  const canPrint = useHasPermission(PERMISSION_CODES.ORDERS_PRINT);
  const summary = CHANGE_COMPANY_TEXT.saveDialogBody
    .replace('{sendable}', String(sendableCount))
    .replace('{skipped}', String(skippedCount));

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={CHANGE_COMPANY_TEXT.saveDialogTitle}
      showFooter={false}
    >
      <div className="flex flex-col gap-4 p-1">
        <p className="text-sm text-gray-700">{summary}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            {CHANGE_COMPANY_TEXT.cancel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onChoose(CHANGE_COMPANY_CHOICE.SAVE_ONLY)}
          >
            {CHANGE_COMPANY_TEXT.saveOnly}
          </Button>
          <Button
            type="button"
            disabled={!canPrint}
            onClick={() => onChoose(CHANGE_COMPANY_CHOICE.SAVE_AND_PRINT)}
          >
            {CHANGE_COMPANY_TEXT.saveAndPrint}
          </Button>
        </div>
        {!canPrint && (
          <p className="text-xs text-amber-700">{CHANGE_COMPANY_TEXT.noPrintPermission}</p>
        )}
      </div>
    </BaseModal>
  );
}
