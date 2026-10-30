'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import { productsApi } from '../../api/products';
import { productKeys } from '../../hooks/queryKeys';
import { variantDisplayLabel } from '../../utils/mergePlan';
import { useMoveRetiredLinks, useRetiredLinkPreview, useRetiredLinks } from '../hooks/useLinkIssues';
import type { RetiredLinkIssue, RetiredLinkPreviewParams } from '../types/linkIssues';
import { linkIssueErrorMessage } from '../utils/linkIssueErrors';
import { ItemSelect } from './ItemSelect';
import { IssuePreviewDialog } from './IssuePreviewDialog';
import { IssueRowShell, VariantRefCard } from './LinkIssueParts';
import { LinkIssueList, LINK_ISSUE_PAGE_LIMIT } from './LinkIssueList';
import { toast } from 'react-toastify';

interface RetiredLinksTabProps {
  storeNameOf: (storeId: number | null) => string | null;
}

function RetiredLinkRow({
  issue,
  storeNameOf,
  onPreview,
}: {
  issue: RetiredLinkIssue;
  storeNameOf: (storeId: number | null) => string | null;
  onPreview: (params: RetiredLinkPreviewParams) => void;
}) {
  const { t } = useI18n();
  const detailQuery = useQuery({
    queryKey: productKeys.detail(issue.variant.productId),
    queryFn: () => productsApi.getDetail(issue.variant.productId),
  });
  const options = (detailQuery.data?.variants ?? [])
    .filter((variant) => variant.id !== issue.variant.variantId)
    .map((variant) => ({ id: variant.id, label: variantDisplayLabel(variant) }));
  const [targetId, setTargetId] = useState<number | null>(issue.suggestedTarget?.variantId ?? null);

  return (
    <IssueRowShell
      actions={
        <Button
          type="button"
          size="sm"
          disabled={targetId === null}
          onClick={() => targetId !== null && onPreview({ variantId: issue.variant.variantId, targetVariantId: targetId })}
        >
          {t('linkIssues.common.preview')}
        </Button>
      }
    >
      <VariantRefCard heading={t('linkIssues.retired.retiredVariant')} variant={issue.variant} storeNameOf={storeNameOf} />
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500">{t('linkIssues.retired.target')}</p>
        <ItemSelect
          value={targetId}
          options={options}
          onChange={setTargetId}
          placeholder={issue.suggestedTarget ? issue.suggestedTarget.label : t('linkIssues.retired.noTarget')}
          disabled={detailQuery.isLoading || options.length === 0}
          ariaLabel={t('linkIssues.retired.target')}
        />
      </div>
    </IssueRowShell>
  );
}

export function RetiredLinksTab({ storeNameOf }: RetiredLinksTabProps) {
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
        renderItem={(issue) => (
          <RetiredLinkRow issue={issue} storeNameOf={storeNameOf} onPreview={setPreviewParams} />
        )}
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
              <VariantRefCard heading={t('linkIssues.retired.retiredVariant')} variant={preview.variant} storeNameOf={storeNameOf} />
              <VariantRefCard heading={t('linkIssues.retired.target')} variant={preview.target} storeNameOf={storeNameOf} />
            </div>
          </>
        )}
      </IssuePreviewDialog>
    </>
  );
}
