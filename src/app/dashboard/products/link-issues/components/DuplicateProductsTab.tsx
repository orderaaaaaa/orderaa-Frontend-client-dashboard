'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useJobStore } from '@/store/useJobStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import { useMergeProductDetails } from '../../hooks/useMergeProducts';
import { variantDisplayLabel } from '../../utils/mergePlan';
import { useDismissLinkIssue, useDuplicateProductPreview, useDuplicateProducts, useMergeDuplicateProduct } from '../hooks/useLinkIssues';
import type { DuplicateProductPreviewParams, DuplicateProductIssue } from '../types/linkIssues';
import { LINK_ISSUE_TYPE } from '../types/linkIssues';
import { linkIssueErrorMessage } from '../utils/linkIssueErrors';
import { CountsInline, IssueRowShell, StoreLinkBadges } from './LinkIssueParts';
import { IssuePreviewDialog } from './IssuePreviewDialog';
import { LinkIssueList, LINK_ISSUE_PAGE_LIMIT } from './LinkIssueList';

export function DuplicateProductsTab() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [previewParams, setPreviewParams] = useState<DuplicateProductPreviewParams | null>(null);
  const listQuery = useDuplicateProducts({ page, limit: LINK_ISSUE_PAGE_LIMIT });
  const previewQuery = useDuplicateProductPreview(previewParams);
  const details = useMergeProductDetails(
    previewParams ? [previewParams.sourceProductId, previewParams.targetProductId] : [],
  );
  const merge = useMergeDuplicateProduct();
  const dismiss = useDismissLinkIssue();

  const labelById = useMemo(() => {
    const labels = new Map<number, string>();
    for (const detail of details.details) {
      for (const variant of detail.variants) {
        labels.set(variant.id, `${detail.name} / ${variantDisplayLabel(variant)}`);
      }
    }
    return labels;
  }, [details.details]);

  const labelOf = (variantId: number) => labelById.get(variantId) ?? `#${variantId}`;

  const handleMerge = async () => {
    const preview = previewQuery.data;
    if (!preview || !previewParams) return;
    try {
      const result = await merge.mutateAsync({
        sourceProductId: preview.source.productId,
        targetProductId: preview.target.productId,
        variantPlan: preview.variantPlan,
        confirm: true,
      });
      useJobStore.getState().addJob({
        jobId: result.jobId,
        type: 'MERGE',
        label: t('linkIssues.duplicates.jobLabel'),
        variantLabels: Object.fromEntries(labelById),
      });
      toast.success(t('linkIssues.duplicates.queued', { jobId: result.jobId }));
      setPreviewParams(null);
    } catch (error) {
      toast.error(linkIssueErrorMessage(error, t('linkIssues.common.actionFailed'), labelOf));
    }
  };

  const handleDismiss = async (issue: DuplicateProductIssue) => {
    try {
      await dismiss.mutateAsync({
        issueType: LINK_ISSUE_TYPE.DUPLICATE_PRODUCTS,
        issueKey: issue.issueKey,
        confirm: true,
      });
      toast.success(t('linkIssues.common.dismissed'));
    } catch (error) {
      toast.error(linkIssueErrorMessage(error, t('linkIssues.common.actionFailed')));
    }
  };

  const preview = previewQuery.data;

  return (
    <>
      <LinkIssueList
        query={listQuery}
        page={page}
        onPageChange={setPage}
        getKey={(issue) => issue.issueKey}
        renderItem={(issue) => (
          <IssueRowShell
            actions={
              <>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setPreviewParams({
                      sourceProductId: issue.source.productId,
                      targetProductId: issue.target.productId,
                    })
                  }
                >
                  {t('linkIssues.duplicates.previewMerge')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={dismiss.isPending}
                  onClick={() => handleDismiss(issue)}
                >
                  {t('linkIssues.common.dismiss')}
                </Button>
              </>
            }
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {t(issue.reason === 'SKU' ? 'linkIssues.duplicates.reason.SKU' : 'linkIssues.duplicates.reason.NAME')}
              </Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{t('linkIssues.duplicates.fromStore')}</p>
                <p className="font-semibold text-gray-900">{issue.source.name}</p>
                <p className="text-xs text-gray-500" dir="ltr">
                  SKU: {issue.source.sku ?? t('linkIssues.common.noSku')}
                </p>
                <StoreLinkBadges links={issue.source.storeLinks} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{t('linkIssues.duplicates.ourProduct')}</p>
                <p className="font-semibold text-gray-900">{issue.target.name}</p>
                <p className="text-xs text-gray-500" dir="ltr">
                  SKU: {issue.target.sku ?? t('linkIssues.common.noSku')}
                </p>
              </div>
            </div>
          </IssueRowShell>
        )}
      />

      <IssuePreviewDialog
        isOpen={previewParams !== null}
        onClose={() => setPreviewParams(null)}
        title={t('linkIssues.duplicates.previewTitle')}
        isLoading={previewQuery.isLoading || details.isPending}
        isError={previewQuery.isError}
        error={previewQuery.error}
        onRetry={() => previewQuery.refetch()}
        onConfirm={handleMerge}
        confirmText={t('linkIssues.duplicates.merge')}
        isSubmitting={merge.isPending}
        confirmDisabled={!preview}
      >
        {preview && (
          <>
            <p className="text-sm text-gray-700">
              {t('linkIssues.duplicates.previewSummary', {
                source: preview.source.name,
                target: preview.target.name,
              })}
            </p>
            <CountsInline counts={preview.counts} />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">{t('linkIssues.duplicates.variantPlan')}</p>
              <ul className="space-y-2">
                {preview.variantPlan.map((entry) => (
                  <li
                    key={entry.variantId}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{labelOf(entry.variantId)}</span>
                    <Badge variant="outline">{t(`linkIssues.plan.action.${entry.action}`)}</Badge>
                    {entry.intoVariantId !== undefined && entry.intoVariantId !== null && (
                      <span className="text-gray-600">{labelOf(entry.intoVariantId)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </IssuePreviewDialog>
    </>
  );
}
