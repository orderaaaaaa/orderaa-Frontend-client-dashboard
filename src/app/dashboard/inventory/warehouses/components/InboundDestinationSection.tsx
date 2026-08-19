'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { LiaSaveSolid, LiaTrashSolid } from 'react-icons/lia';
import { getApiErrorMessage } from '@/utils/apiError';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useI18n } from '@/i18n/I18nProvider';
import {
  useCreateStockWorkflowMutation,
  useDeleteStockWorkflowMutation,
  useUpdateStockWorkflowMutation,
  useWarehouseOptions,
} from '@/services/warehouses';
import type { StockWorkflowApiItem } from '@/lib/api/warehouses';
import type { ScopeSelection } from './StockRuleScopeSelector';

interface Props {
  /** The scope the page is editing — the panel has no scope UI of its own. */
  scope: ScopeSelection;
  /** Identity of that scope; changing it wipes the local pick. */
  scopeKey: string;
  /** This scope's INBOUND rule, if it has one. At most one can exist. */
  inboundRule: StockWorkflowApiItem | undefined;
}

/**
 * T30 — where supplier receiving lands, for ONE scope.
 *
 * Deliberately not a rule card: an inbound rule has no source warehouse, no
 * statuses, no selections and no insufficient-stock policy — it is a single
 * destination, and there may be at most one per scope. Rendering it as a card
 * would offer six controls the API rejects and a "+ add" affordance for a
 * second rule the backend refuses to create.
 *
 * The panel is also the successor to the warehouse's old default-warehouse
 * flag: receiving used to go to whichever warehouse carried that flag, which
 * said nothing about WHY and could not vary per product. This says it in one
 * place, per scope.
 */
export function InboundDestinationSection({
  scope,
  scopeKey,
  inboundRule,
}: Props) {
  const { t, dir } = useI18n();
  const { pickerOptions } = useWarehouseOptions();

  const createMutation = useCreateStockWorkflowMutation();
  const updateMutation = useUpdateStockWorkflowMutation();
  const deleteMutation = useDeleteStockWorkflowMutation();

  /**
   * null = "not touched, follow the server".
   *
   * The rule arrives asynchronously, so seeding a string on mount would show an
   * empty picker for a scope that has a destination. Keeping the untouched
   * state distinct from an empty pick also makes "differs from what is saved"
   * exact — an empty string is a real (invalid) pick, not the absence of one.
   */
  const [pick, setPick] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Switching scope discards the local pick for the same reason the rule cards
  // are wiped: it was chosen FOR the old scope, and silently re-parenting it
  // would set a destination on a scope nobody asked about.
  useEffect(() => {
    setPick(null);
  }, [scopeKey]);

  const savedValue = inboundRule ? String(inboundRule.toWarehouseId) : '';
  const value = pick ?? savedValue;
  const isDirty = value !== savedValue;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const save = async () => {
    if (!value || !isDirty) return;
    try {
      if (inboundRule) {
        // The only field an INBOUND rule can change. Scope and event type are
        // fixed at creation, and it carries nothing else to patch.
        const updated = await updateMutation.mutateAsync({
          id: inboundRule.id,
          body: { toWarehouseId: Number(value) },
        });
        setPick(String(updated.toWarehouseId));
      } else {
        const created = await createMutation.mutateAsync({
          eventType: 'INBOUND',
          toWarehouseId: Number(value),
          // No source warehouse, no statuses, no selections, no policy flags:
          // the API rejects every one of them on an INBOUND rule.
          ...(scope.scope === 'PRODUCT' ? { productId: scope.productId } : {}),
          ...(scope.scope === 'VARIANT' ? { variantId: scope.variantId } : {}),
        });
        setPick(String(created.toWarehouseId));
      }
      toast.success(t('stockRules.inbound.saved'));
    } catch (err: unknown) {
      // Covers the inactive-warehouse and duplicate-rule refusals alike — the
      // server owns both policies and its message is already localized.
      toast.error(getApiErrorMessage(err, t('stockRules.saveFailed')));
    }
  };

  const confirmDelete = async () => {
    if (!inboundRule) return;
    try {
      await deleteMutation.mutateAsync(inboundRule.id);
      // Back to following the server, which no longer has a rule — so the
      // empty state below renders instead of a stale destination.
      setPick(null);
      setConfirmingDelete(false);
      toast.success(t('stockRules.inbound.deleted'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t('stockRules.saveFailed')));
    }
  };

  return (
    <div
      className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
      dir={dir}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900">
          {t('stockRules.inbound.title')}
        </h3>
        <p className="text-[11px] leading-4 text-gray-500">
          {t('stockRules.inbound.hint')}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1 sm:max-w-sm">
          <SearchableSelect
            options={pickerOptions}
            value={value}
            onValueChange={(next) => setPick(next)}
            placeholder={t('stockRules.inbound.placeholder')}
          />
        </div>

        <Button
          size="sm"
          onClick={save}
          disabled={!value || !isDirty || isSaving}
          loading={isSaving}
        >
          <LiaSaveSolid className="me-1 size-4" />
          {t('common.save')}
        </Button>

        {inboundRule && (
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setConfirmingDelete(true)}
          >
            <LiaTrashSolid className="size-4" />
          </Button>
        )}
      </div>

      {/* A global scope with no destination is a real problem — receiving
          cannot complete at all. A scoped view with none is normal: it just
          follows the scope above it. Same absence, two different meanings. */}
      {!inboundRule &&
        (scope.scope === 'GLOBAL' ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] leading-4 text-amber-900">
            {t('stockRules.inbound.missingGlobal')}
          </p>
        ) : (
          <p className="text-[11px] leading-4 text-gray-500">
            {t('stockRules.inbound.inheritsHint')}
          </p>
        ))}

      <BaseModal
        isOpen={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title={t('stockRules.inbound.title')}
        confirmText={t('common.delete')}
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        maxWidth="md:max-w-[420px]"
      >
        {/* The two empty-state lines describe exactly the state deleting
            leaves behind — receiving blocked at global scope, inherited at a
            scoped one — so the confirmation says the consequence rather than
            a second phrasing of it. */}
        <p className="text-sm text-gray-600">
          {scope.scope === 'GLOBAL'
            ? t('stockRules.inbound.missingGlobal')
            : t('stockRules.inbound.inheritsHint')}
        </p>
      </BaseModal>
    </div>
  );
}
