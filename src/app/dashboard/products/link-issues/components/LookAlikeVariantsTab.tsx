'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import {
  useDismissLinkIssue,
  useLookAlikeVariantPreview,
  useLookAlikeVariants,
  useMergeLookAlikeVariant,
} from '../hooks/useLinkIssues';
import type { LookAlikeVariantIssue, LookAlikeVariantPreviewParams } from '../types/linkIssues';
import { LINK_ISSUE_TYPE } from '../types/linkIssues';
import { linkIssueErrorMessage } from '../utils/linkIssueErrors';
import { IssuePreviewDialog } from './IssuePreviewDialog';
import { IssueRowShell, VariantRefCard } from './LinkIssueParts';
import { LinkIssueList, LINK_ISSUE_PAGE_LIMIT } from './LinkIssueList';

export function LookAlikeVariantsTab() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [previewParams, setPreviewParams] = useState<LookAlikeVariantPreviewParams | null>(null);
  const listQuery = useLookAlikeVariants({ page, limit: LINK_ISSUE_PAGE_LIMIT });
  const previewQuery = useLookAlikeVariantPreview(previewParams);
  const merge = useMergeLookAlikeVariant();
  const dismiss = useDismissLinkIssue();

  const handleMerge = async () => {
    if (!previewParams) return;
    try {
      await merge.mutateAsync({ ...previewParams, confirm: true });
      toast.success(t('linkIssues.lookAlike.merged'));
      setPreviewParams(null);
    } catch (error) {
      toast.error(linkIssueErrorMessage(error, t('linkIssues.common.actionFailed')));
    }
  };

  const handleDismiss = async (issue: LookAlikeVariantIssue) => {
    try {
      await dismiss.mutateAsync({
        issueType: LINK_ISSUE_TYPE.LOOK_ALIKE_VARIANTS,
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
                      productId: issue.source.productId,
                      sourceVariantId: issue.source.variantId,
                      targetVariantId: issue.target.variantId,
                    })
                  }
                >
                  {t('linkIssues.lookAlike.previewMerge')}
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
            <Badge variant="secondary">
              {t(issue.reason === 'SAME_LABEL' ? 'linkIssues.lookAlike.reason.SAME_LABEL' : 'linkIssues.lookAlike.reason.REPAIR_MERGE')}
            </Badge>
            <div className="flex flex-col gap-3 md:flex-row">
              <VariantRefCard heading={t('linkIssues.lookAlike.mergedAway')} variant={issue.source} />
              <VariantRefCard heading={t('linkIssues.lookAlike.kept')} variant={issue.target} />
            </div>
          </IssueRowShell>
        )}
      />

      <IssuePreviewDialog
        isOpen={previewParams !== null}
        onClose={() => setPreviewParams(null)}
        title={t('linkIssues.lookAlike.previewTitle')}
        isLoading={previewQuery.isLoading}
        isError={previewQuery.isError}
        error={previewQuery.error}
        onRetry={() => previewQuery.refetch()}
        onConfirm={handleMerge}
        confirmText={t('linkIssues.lookAlike.merge')}
        isSubmitting={merge.isPending}
      >
        {preview && (
          <div className="flex flex-col gap-3 md:flex-row">
            <VariantRefCard heading={t('linkIssues.lookAlike.mergedAway')} variant={preview.source} />
            <VariantRefCard heading={t('linkIssues.lookAlike.kept')} variant={preview.target} />
          </div>
        )}
      </IssuePreviewDialog>
    </>
  );
}
