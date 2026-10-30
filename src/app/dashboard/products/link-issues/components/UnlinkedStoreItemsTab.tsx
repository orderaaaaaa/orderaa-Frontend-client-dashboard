'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/state-panels';
import { useIntegrations } from '@/app/dashboard/integrations/hooks/useIntegrations';
import { useI18n } from '@/i18n/I18nProvider';
import { useMergeProductDetails } from '../../hooks/useMergeProducts';
import { variantDisplayLabel } from '../../utils/mergePlan';
import {
  usePlanUnlinkedLinks,
  useSaveUnlinkedLinks,
  useUnlinkedStoreItems,
} from '../hooks/useLinkIssues';
import type {
  UnlinkedLinkEntry,
  UnlinkedLinkResult,
  UnlinkedStoreItem,
} from '../types/linkIssues';
import { UNLINKED_SUGGESTION_KIND } from '../types/linkIssues';
import { linkIssueErrorMessage, responseDataOf } from '../utils/linkIssueErrors';
import { StoreLinkMoveConfirmModal } from '@/components/storeLinks/StoreLinkMoveConfirmModal';
import { isStoreLinkMoveConfirmationBody, type StoreLinkMove } from '@/types/storeLinks';
import { IssuePreviewDialog } from './IssuePreviewDialog';
import { IssueRowShell, providerLabel } from './LinkIssueParts';
import { LinkIssueList, LINK_ISSUE_PAGE_LIMIT } from './LinkIssueList';
import { ItemSelect } from './ItemSelect';
import { ProductPicker } from './ProductPicker';

interface RowPick {
  productId: number;
  variantId: number | null;
}

interface PendingPick {
  item: UnlinkedStoreItem;
  pick: RowPick | null;
}

interface PlanState {
  configId: number;
  links: UnlinkedLinkEntry[];
  result: UnlinkedLinkResult;
}

const linkKeyOf = (link: { externalProductId: string; externalVariantId: string | null }) =>
  `${link.externalProductId}|${link.externalVariantId ?? ''}`;

const suggestedPick = (item: UnlinkedStoreItem): RowPick | null => {
  const { suggestion } = item;
  if (suggestion.kind !== UNLINKED_SUGGESTION_KIND.MATCHED || suggestion.productId === null) {
    return null;
  }
  return { productId: suggestion.productId, variantId: suggestion.variantId };
};

const entryOf = (item: UnlinkedStoreItem, pick: RowPick | null): UnlinkedLinkEntry | null => {
  if (!pick) return null;
  if (item.externalVariantId !== null && pick.variantId === null) return null;
  return {
    externalProductId: item.externalProductId,
    externalVariantId: item.externalVariantId,
    variantId: item.externalVariantId === null ? null : pick.variantId,
    productId: pick.productId,
  };
};

function UnlinkedItemRow({
  item,
  pick,
  suggested,
  onPickChange,
  canReadProducts,
  storeLabel,
}: {
  item: UnlinkedStoreItem;
  pick: RowPick | null;
  suggested: RowPick | null;
  onPickChange: (pick: RowPick | null) => void;
  canReadProducts: boolean;
  storeLabel: string;
}) {
  const { t } = useI18n();
  const pickedProduct = useMergeProductDetails(pick ? [pick.productId] : []);
  const variantOptions = (pickedProduct.details[0]?.variants ?? []).map((variant) => ({
    id: variant.id,
    label: variantDisplayLabel(variant),
  }));

  return (
    <IssueRowShell
      actions={
        !pick && suggested !== null ? (
          <Button type="button" size="sm" onClick={() => onPickChange(suggested)}>
            {t('linkIssues.unlinked.confirmSuggestion')}
          </Button>
        ) : null
      }
    >
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
        <Badge variant="outline">{providerLabel(item.provider)}</Badge>
        <span>{storeLabel}</span>
        <span className="font-semibold text-gray-900">
          {item.productName}
          {item.variantLabel ? ` / ${item.variantLabel}` : ''}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span dir="ltr" className="font-mono">
          {item.externalProductId}
          {item.externalVariantId ? ` / ${item.externalVariantId}` : ''}
        </span>
        <span dir="ltr">
          {t('linkIssues.common.sku')}: {item.externalSku ?? t('linkIssues.common.noSku')}
        </span>
        <span>{t(`linkIssues.unlinked.suggestion.${item.suggestion.kind}`)}</span>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <ProductPicker
          canRead={canReadProducts}
          selected={
            pick
              ? { id: pick.productId, label: pickedProduct.details[0]?.name ?? `#${pick.productId}` }
              : null
          }
          onSelect={(productId) => onPickChange({ productId, variantId: null })}
        />
        {item.externalVariantId !== null && (
          <ItemSelect
            value={pick?.variantId ?? null}
            options={variantOptions}
            placeholder={t('linkIssues.unlinked.pickVariant')}
            ariaLabel={t('linkIssues.unlinked.pickVariant')}
            disabled={!pick}
            onChange={(variantId) => pick && onPickChange({ productId: pick.productId, variantId })}
          />
        )}
      </div>
      {item.externalVariantId !== null && pick !== null && pick.variantId === null && (
        <p className="text-xs text-amber-700">{t('linkIssues.unlinked.variantRequired')}</p>
      )}
    </IssueRowShell>
  );
}

interface UnlinkedStoreItemsContentProps {
  canReadProducts: boolean;
  canManage: boolean;
  onTotalChange: (total: number | undefined) => void;
}

function UnlinkedStoreItemsContent({
  canReadProducts,
  canManage,
  onTotalChange,
}: UnlinkedStoreItemsContentProps) {
  const { t } = useI18n();
  const { integrations = [] } = useIntegrations();
  const [configId, setConfigId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [picks, setPicks] = useState<Record<string, PendingPick>>({});
  const [planState, setPlanState] = useState<PlanState | null>(null);
  const [moveConfirm, setMoveConfirm] = useState<{
    configId: number;
    links: UnlinkedLinkEntry[];
    moves: StoreLinkMove[];
  } | null>(null);
  const listQuery = useUnlinkedStoreItems(
    configId !== null ? { configId, page, limit: LINK_ISSUE_PAGE_LIMIT } : null,
  );
  const plan = usePlanUnlinkedLinks();
  const save = useSaveUnlinkedLinks();

  useEffect(() => {
    onTotalChange(configId === null ? undefined : listQuery.data?.total);
  }, [configId, listQuery.data?.total, onTotalChange]);

  const items = useMemo(() => listQuery.data?.data ?? [], [listQuery.data]);

  const entries = useMemo(() => {
    const collected = new Map<string, UnlinkedLinkEntry>();
    for (const pending of Object.values(picks)) {
      const entry = entryOf(pending.item, pending.pick);
      if (entry) collected.set(linkKeyOf(entry), entry);
    }
    return [...collected.values()];
  }, [picks]);

  const itemsByKey = useMemo(() => {
    const byKey = new Map<string, UnlinkedStoreItem>();
    for (const item of items) byKey.set(linkKeyOf(item), item);
    for (const pending of Object.values(picks)) {
      byKey.set(linkKeyOf(pending.item), pending.item);
    }
    return byKey;
  }, [items, picks]);

  const detailIds = useMemo(() => {
    if (!planState) return [];
    const ids = new Set<number>();
    for (const create of planState.result.creates) ids.add(create.productId);
    for (const move of planState.result.moves) {
      ids.add(move.fromProductId);
      ids.add(move.toProductId);
    }
    return [...ids];
  }, [planState]);
  const details = useMergeProductDetails(detailIds);
  const detailById = new Map(details.details.map((detail) => [detail.id, detail]));

  const productNameOf = (productId: number) => detailById.get(productId)?.name ?? `#${productId}`;
  const ourLabelOf = (productId: number, variantId: number | null) => {
    if (variantId === null) return productNameOf(productId);
    const variant = detailById.get(productId)?.variants.find((candidate) => candidate.id === variantId);
    return `${productNameOf(productId)} / ${variant ? variantDisplayLabel(variant) : `#${variantId}`}`;
  };
  const storeLabelOf = (externalProductId: string, externalVariantId: string | null) => {
    const item = itemsByKey.get(`${externalProductId}|${externalVariantId ?? ''}`);
    if (!item) return externalProductId;
    return item.variantLabel ? `${item.productName} / ${item.variantLabel}` : item.productName;
  };

  const runPlan = async (selectedConfigId: number, links: UnlinkedLinkEntry[]) => {
    try {
      const result = await plan.mutateAsync({ configId: selectedConfigId, links });
      setPlanState({ configId: selectedConfigId, links, result });
    } catch (error) {
      toast.error(linkIssueErrorMessage(error, t('linkIssues.common.actionFailed')));
    }
  };

  const withMovesConfirmed = (links: UnlinkedLinkEntry[], moves: StoreLinkMove[]) =>
    links.map((link, index) =>
      moves.some((move) => move.sourceIndex === index) ? { ...link, confirmMove: true } : link,
    );

  const submitLinks = async (selectedConfigId: number, links: UnlinkedLinkEntry[]) => {
    try {
      const result = await save.mutateAsync({ configId: selectedConfigId, links });
      toast.success(t('linkIssues.unlinked.saved', { count: result.created + result.moved }));
      setPlanState(null);
      setMoveConfirm(null);
      setPicks({});
    } catch (error) {
      const data = responseDataOf(error);
      if (isStoreLinkMoveConfirmationBody(data)) {
        setPlanState(null);
        setMoveConfirm({ configId: selectedConfigId, links, moves: data.moves });
        return;
      }
      setMoveConfirm(null);
      toast.error(linkIssueErrorMessage(error, t('linkIssues.common.actionFailed')));
    }
  };

  const handleSave = async () => {
    if (!planState) return;
    await submitLinks(planState.configId, withMovesConfirmed(planState.links, planState.result.moves));
  };

  const storeOptions = integrations.map((config) => ({
    id: config.id,
    label: `${providerLabel(config.provider)} - ${config.store?.name ?? `#${config.storeId}`}`,
  }));

  return (
    <div className="space-y-4">
      <div className="max-w-md space-y-1">
        <p className="text-xs font-medium text-gray-500">{t('linkIssues.unlinked.store')}</p>
        <ItemSelect
          value={configId}
          options={storeOptions}
          placeholder={t('linkIssues.unlinked.selectStore')}
          ariaLabel={t('linkIssues.unlinked.store')}
          onChange={(selected) => {
            setConfigId(selected);
            setPage(1);
            setPicks({});
            setPlanState(null);
          }}
        />
      </div>

      {configId === null ? (
        <EmptyState title={t('linkIssues.unlinked.chooseStore')} />
      ) : (
        <>
          {!canManage && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {t('linkIssues.unlinked.readOnly')}
            </p>
          )}
          <LinkIssueList
            query={listQuery}
            page={page}
            onPageChange={setPage}
            getKey={(item) => item.issueKey}
            renderItem={(item) => (
              <UnlinkedItemRow
                item={item}
                pick={picks[item.issueKey]?.pick ?? null}
                suggested={suggestedPick(item)}
                canReadProducts={canReadProducts}
                storeLabel={item.storeName ?? t('linkIssues.common.storeId', { storeId: item.storeId })}
                onPickChange={(pick) =>
                  setPicks((previous) => ({ ...previous, [item.issueKey]: { item, pick } }))
                }
              />
            )}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-gray-600">
              {t('linkIssues.unlinked.selected', { count: entries.length })}
            </span>
            <Button
              type="button"
              disabled={!canManage || entries.length === 0 || plan.isPending}
              onClick={() => configId !== null && runPlan(configId, entries)}
            >
              {t('linkIssues.unlinked.save')}
            </Button>
          </div>
        </>
      )}

      <IssuePreviewDialog
        isOpen={planState !== null}
        onClose={() => setPlanState(null)}
        title={t('linkIssues.unlinked.previewTitle')}
        isLoading={details.isPending}
        isError={false}
        error={null}
        onConfirm={handleSave}
        confirmText={t('linkIssues.unlinked.confirmSave')}
        isSubmitting={save.isPending}
      >
        {planState && (
          <>
            <p className="text-sm text-gray-700">
              {t('linkIssues.unlinked.summary', {
                creates: planState.result.creates.length,
                moves: planState.result.moves.length,
              })}
            </p>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">{t('linkIssues.unlinked.creates')}</p>
              <ul className="space-y-2">
                {planState.result.creates.map((create) => (
                  <li
                    key={linkKeyOf(create)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                  >
                    {storeLabelOf(create.externalProductId, create.externalVariantId)}
                    {' ← '}
                    {ourLabelOf(create.productId, create.variantId)}
                  </li>
                ))}
              </ul>
            </div>
            {planState.result.moves.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">{t('linkIssues.unlinked.moves')}</p>
                <ul className="space-y-2">
                  {planState.result.moves.map((move) => (
                    <li
                      key={linkKeyOf(move)}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                    >
                      {t('linkIssues.unlinked.moveLine', {
                        store: storeLabelOf(move.externalProductId, move.externalVariantId),
                        from: ourLabelOf(move.fromProductId, move.fromVariantId),
                        to: ourLabelOf(move.toProductId, move.toVariantId),
                      })}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </IssuePreviewDialog>

      {moveConfirm !== null && (
        <StoreLinkMoveConfirmModal
          moves={moveConfirm.moves}
          onConfirm={() =>
            submitLinks(moveConfirm.configId, withMovesConfirmed(moveConfirm.links, moveConfirm.moves))
          }
          onClose={() => setMoveConfirm(null)}
          isLoading={save.isPending}
        />
      )}
    </div>
  );
}

interface UnlinkedStoreItemsTabProps {
  canRead: boolean;
  canReadProducts: boolean;
  canManage: boolean;
  onTotalChange: (total: number | undefined) => void;
}

export function UnlinkedStoreItemsTab({
  canRead,
  canReadProducts,
  canManage,
  onTotalChange,
}: UnlinkedStoreItemsTabProps) {
  const { t } = useI18n();

  if (!canRead) {
    return <EmptyState title={t('linkIssues.unlinked.noPermission')} />;
  }

  return (
    <UnlinkedStoreItemsContent
      canReadProducts={canReadProducts}
      canManage={canManage}
      onTotalChange={onTotalChange}
    />
  );
}
