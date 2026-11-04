'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { ScanInput } from '@/app/dashboard/orders/components/ScanInput';
import {
  UNRECOGNIZED_SCAN_MESSAGE,
  useBarcodeScanner,
} from '@/app/dashboard/orders/print-orders/hooks/useBarcodeScanner';
import { getOrderByCode } from '@/app/dashboard/orders/print-orders/services/printOrders';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import SearchableSelect from '@/components/ui/SearchableSelect';
import useShippingCompanies from '@/hooks/useShippingCompanies';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { shippingCompanyIdOf, shippingCompanySelectOptionsOf } from '@/lib/shippingCompanies';
import { useAuthStore } from '@/store/authStore';
import { CHANGE_COMPANY_TEXT } from '../constants/changeCompany';
import { useChangeCompanyRows } from '../hooks/useChangeCompanyRows';
import { applyClientChecks, needsClearConfirm } from '../utils/switchRows';
import { useChangeCompanyRun } from '../hooks/useChangeCompanyRun';
import { useChangeCompanyPrint } from '../hooks/useChangeCompanyPrint';
import { httpStatusOf, serverMessageOf } from '../services/bulkCompanySwitch';
import {
  CHANGE_COMPANY_CHOICE,
  CHANGE_COMPANY_PHASE,
  CHANGE_COMPANY_ROW_STATUS,
  type ChangeCompanyChoice,
} from '../types/bulkCompanySwitch';
import { ChangeCompanyTable } from './ChangeCompanyTable';
import { SaveChoiceModal } from './SaveChoiceModal';
import { SwitchPrintLayer } from './SwitchPrintLayer';
import { SwitchResultPanel } from './SwitchResultPanel';

export function ChangeCompanyContent() {
  const {
    shippingCompanies,
    error: companiesError,
    isLoading: companiesLoading,
  } = useShippingCompanies();
  const {
    rows,
    targetId,
    setTarget,
    addScannedOrder,
    hasCode,
    patchRow,
    pickGovernorate,
    pickCity,
    clearAll,
  } = useChangeCompanyRows();
  const run = useChangeCompanyRun(patchRow);
  const print = useChangeCompanyPrint();
  const callerEmployeeId = useAuthStore((state) => state.user?.employeeId ?? null);
  const canBypassLock = useHasPermission(PERMISSION_CODES.ORDERS_BYPASS_LOCK);
  const [isScanning, setIsScanning] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const targetName = shippingCompanies.find((company) => company.id === targetId)?.name ?? '';
  const targetActive = targetId !== null && shippingCompanies.some((company) => company.id === targetId);
  const checkedRows = useMemo(
    () =>
      applyClientChecks(rows, {
        targetId,
        targetActive,
        callerEmployeeId,
        canBypassLock,
      }),
    [rows, targetId, targetActive, callerEmployeeId, canBypassLock]
  );
  const readyRows = checkedRows.filter((row) => row.status === CHANGE_COMPANY_ROW_STATUS.READY);
  const skippedCount = checkedRows.filter(
    (row) => row.status === CHANGE_COMPANY_ROW_STATUS.SKIPPED_LOCAL
  ).length;
  const isRunning = run.phase === CHANGE_COMPANY_PHASE.RUNNING;
  const canSave = targetId !== null && readyRows.length > 0 && !isRunning;
  const anyModalOpen = saveOpen || clearConfirmOpen || print.job !== null;

  const handleScan = useCallback(
    async (barcode: string) => {
      if (hasCode(barcode)) {
        toast.warning(CHANGE_COMPANY_TEXT.duplicateScan);
        return;
      }
      setIsScanning(true);
      try {
        const order = await getOrderByCode(barcode);
        addScannedOrder(order);
      } catch (error: unknown) {
        const message =
          httpStatusOf(error) === 404
            ? CHANGE_COMPANY_TEXT.notFound
            : serverMessageOf(error) ?? CHANGE_COMPANY_TEXT.scanFailed;
        toast.error(message);
      } finally {
        setIsScanning(false);
      }
    },
    [hasCode, addScannedOrder]
  );

  const handleUnrecognized = useCallback(() => {
    toast.error(UNRECOGNIZED_SCAN_MESSAGE);
  }, []);

  useBarcodeScanner({
    onScan: handleScan,
    onUnrecognized: handleUnrecognized,
    enabled: !anyModalOpen && !isRunning,
    minCharLength: 1,
    maxCharLength: 1000,
  });

  const handleChoose = async (choice: ChangeCompanyChoice) => {
    setSaveOpen(false);
    if (targetId === null) return;
    const printableIds = await run.run(readyRows, targetId);
    if (choice === CHANGE_COMPANY_CHOICE.SAVE_AND_PRINT && printableIds.length > 0) {
      await print.printSwitched(printableIds);
    }
  };

  const handleClear = () => {
    if (needsClearConfirm(rows)) {
      setClearConfirmOpen(true);
      return;
    }
    clearAll();
    run.reset();
  };

  const confirmClear = () => {
    setClearConfirmOpen(false);
    clearAll();
    run.reset();
  };

  return (
    <div className="flex w-full max-w-full flex-col gap-6 overflow-x-hidden">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard/orders/print-orders"
          className="w-fit text-sm text-primary-text hover:underline"
        >
          {CHANGE_COMPANY_TEXT.backToPackaging}
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">{CHANGE_COMPANY_TEXT.title}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">{CHANGE_COMPANY_TEXT.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="min-w-0 flex-1">
          <ScanInput
            onSubmit={handleScan}
            isBusy={isScanning}
            disabled={anyModalOpen || isRunning}
          />
        </div>
        <div className="flex flex-col gap-1.5 md:w-64">
          <span className="text-sm font-medium text-foreground">
            {CHANGE_COMPANY_TEXT.targetLabel}
          </span>
          <SearchableSelect
            aria-label={CHANGE_COMPANY_TEXT.targetLabel}
            options={shippingCompanySelectOptionsOf(shippingCompanies)}
            value={targetId !== null ? String(targetId) : ''}
            placeholder={CHANGE_COMPANY_TEXT.targetLabel}
            disabled={isRunning || companiesLoading}
            portal
            onValueChange={(key) => setTarget(shippingCompanyIdOf(key))}
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" className="max-sm:h-10" disabled={!canSave} onClick={() => setSaveOpen(true)}>
            {CHANGE_COMPANY_TEXT.save}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="max-sm:h-10"
            disabled={isRunning || rows.length === 0}
            onClick={handleClear}
          >
            {CHANGE_COMPANY_TEXT.clear}
          </Button>
        </div>
      </div>

      {companiesError && (
        <p className="text-sm text-destructive">{CHANGE_COMPANY_TEXT.companiesFailed}</p>
      )}

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{CHANGE_COMPANY_TEXT.emptyRows}</p>
      ) : (
        <ChangeCompanyTable
          rows={checkedRows}
          targetId={targetId}
          targetName={targetName}
          disabled={isRunning}
          onPatch={patchRow}
          onPickGovernorate={pickGovernorate}
          onPickCity={pickCity}
        />
      )}

      {run.phase === CHANGE_COMPANY_PHASE.DONE && (
        <SwitchResultPanel rows={checkedRows} targetName={targetName} />
      )}

      <SaveChoiceModal
        isOpen={saveOpen}
        sendableCount={readyRows.length}
        skippedCount={skippedCount}
        onClose={() => setSaveOpen(false)}
        onChoose={handleChoose}
      />

      <BaseModal
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        title={CHANGE_COMPANY_TEXT.clear}
        onConfirm={confirmClear}
        confirmText={CHANGE_COMPANY_TEXT.clearConfirmYes}
        cancelText={CHANGE_COMPANY_TEXT.clearConfirmNo}
      >
        <p className="text-sm text-foreground">{CHANGE_COMPANY_TEXT.clearConfirmBody}</p>
      </BaseModal>

      <SwitchPrintLayer
        job={print.job}
        printer={print.printer}
        printablesRef={print.printablesRef}
        storeInfo={print.storeInfo}
        language={print.language}
        onClose={print.closeJob}
      />
    </div>
  );
}
