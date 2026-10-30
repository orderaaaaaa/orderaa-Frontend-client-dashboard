'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import { useMergeProductDetails } from '../../hooks/useMergeProducts';
import { variantDisplayLabel } from '../../utils/mergePlan';
import {
  useDismissLinkIssue,
  useMoveRetiredLinks,
  useRetiredLinkPreview,
  useRetiredLinks,
} from '../hooks/useLinkIssues';
import { LINK_ISSUE_TYPE } from '../types/linkIssues';
import type { RetiredLinkIssue, RetiredLinkPreviewParams } from '../types/linkIssues';
import { linkIssueErrorMessage } from '../utils/linkIssueErrors';
import { ItemSelect } from './ItemSelect';
import { IssuePreviewDialog } from './IssuePreviewDialog';
import { IssueRowShell, StoreLinkBadges, VariantRefCard } from './LinkIssueParts';
import { LinkIssueList, LINK_ISSUE_PAGE_LIMIT } from './LinkIssueList';

function RetiredLinkRow({
  issue,
  onPreview,
}: {
  issue: RetiredLinkIssue;
  onPreview: (params: RetiredLinkPreviewParams) => void;
}) {
  const { t } = useI18n();
  const details = useMergeProductDetails([issue.variant.productId]);
  const dismiss = useDismissLinkIssue();
  const options = (details.details[0]?.variants ?? [])
    .filter((variant) => variant.id !== issue.variant.variantId)
    .map((variant) => ({ id: variant.id, label: variantDisplayLabel(variant) }));
  const [targetId, setTargetId] = useState<number | null>(issue.suggestedTarget?.variantId ?? null);

  const handleDismiss = async () => {
    try {
      await dismiss.mutateAsync({
        issueType: LINK_ISSUE_TYPE.RETIRED_WITH_LINKS,
        issueKey: issue.issueKey,
        confirm: true,
      });
      toast.success(t('linkIssues.common.dismissed'));
    } catch (error) {
      toast.error(linkIssueErrorMessage(error, t('linkIssues.common.actionFailed')));
    }
  };

  return (
    <IssueRowShell
      actions={
        <>
          <Button
            type="button"
            size="sm"
            disabled={targetId === null}
            onClick={() =>
              targetId !== null &&
              onPreview({ variantId: issue.variant.variantId, targetVariantId: targetId })
            }
          >
            {t('linkIssues.common.preview')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={dismiss.isPending}
            onClick={handleDismiss}
          >
            {t('linkIssues.common.dismiss')}
          </Button>
        </>
      }
    >
      <VariantRefCard heading={t('linkIssues.retired.retiredVariant')} variant={issue.variant} />
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500">{t('linkIssues.retired.target')}</p>
        <ItemSelect
          value={targetId}
          options={options}
          onChange={setTargetId}
          placeholder={
            issue.suggestedTarget ? issue.suggestedTarget.label : t('linkIssues.retired.noTarget')
          }
          disabled={details.isPending || options.length === 0}
          ariaLabel={t('linkIssues.retired.target')}
        />
      </div>
      {issue.suggestedTarget && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{t('linkIssues.retired.suggestedTarget')}</p>
          <StoreLinkBadges links={issue.suggestedTarget.storeLinks} />
        </div>
      )}
    </IssueRowShell>
  );
}

export function RetiredLinksTab() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [previewParams, setPreviewParams] = useState<RetiredLinkPreviewParams | null>(null);
  const listQuery = useRetiredLinks({ page, limit: LINK_ISSUE_PAGE_LIMIT });
  const previewQuery = useRetiredLinkPreview(previewParams);
  const move = useMoveRetiredLinks();

  const handleMove = async () => {
    if (!previewParams) return;
    try {
      await move.mutateAsync({ ...previewParams, confirm: true });
      toast.success(t('linkIssues.retired.moved'));
      setPreviewParams(null);
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
        renderItem={(issue) => <RetiredLinkRow issue={issue} onPreview={setPreviewParams} />}
      />

      <IssuePreviewDialog
        isOpen={previewParams !== null}
        onClose={() => setPreviewParams(null)}
        title={t('linkIssues.retired.previewTitle')}
        isLoading={previewQuery.isLoading}
        isError={previewQuery.isError}
        error={previewQuery.error}
        onRetry={() => previewQuery.refetch()}
        onConfirm={handleMove}
        confirmText={t('linkIssues.retired.move')}
        isSubmitting={move.isPending}
      >
        {preview && (
          <>
            <p className="text-sm text-gray-700">
              {t('linkIssues.retired.linksMoving', { count: preview.linksMoving })}
            </p>
            <div className="flex flex-col gap-3 md:flex-row">
              <VariantRefCard heading={t('linkIssues.retired.retiredVariant')} variant={preview.variant} />
              <VariantRefCard heading={t('linkIssues.retired.target')} variant={preview.target} />
            </div>
          </>
        )}
      </IssuePreviewDialog>
    </>
  );
}
