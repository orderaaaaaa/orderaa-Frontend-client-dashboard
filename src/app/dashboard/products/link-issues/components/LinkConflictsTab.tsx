'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import {
  useLinkConflictPreview,
  useLinkConflicts,
  useResolveLinkConflict,
} from '../hooks/useLinkIssues';
import type { LinkConflictIssue, LinkConflictResolution } from '../types/linkIssues';
import { LINK_CONFLICT_RESOLUTION } from '../types/linkIssues';
import { linkIssueErrorMessage } from '../utils/linkIssueErrors';
import { IssuePreviewDialog } from './IssuePreviewDialog';
import { IssueRowShell, VariantRefCard, providerLabel } from './LinkIssueParts';
import { LinkIssueList, LINK_ISSUE_PAGE_LIMIT } from './LinkIssueList';

export function LinkConflictsTab() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [conflictId, setConflictId] = useState<number | null>(null);
  const listQuery = useLinkConflicts({ page, limit: LINK_ISSUE_PAGE_LIMIT });
  const previewQuery = useLinkConflictPreview(conflictId);
  const resolve = useResolveLinkConflict();

  const handleResolve = async (action: LinkConflictResolution) => {
    if (conflictId === null) return;
    try {
      await resolve.mutateAsync({ id: conflictId, body: { action, confirm: true } });
      toast.success(
        t(action === LINK_CONFLICT_RESOLUTION.MOVE ? 'linkIssues.conflicts.moved' : 'linkIssues.conflicts.kept'),
      );
      setConflictId(null);
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
        getKey={(issue: LinkConflictIssue) => String(issue.id)}
        renderItem={(issue) => (
          <IssueRowShell
            actions={
              <Button type="button" size="sm" onClick={() => setConflictId(issue.id)}>
                {t('linkIssues.common.preview')}
              </Button>
            }
          >
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
              <Badge variant="outline">{providerLabel(issue.provider)}</Badge>
              <span>
                {issue.storeName ??
                  (issue.storeId === null
                    ? t('linkIssues.common.storeUnknown')
                    : t('linkIssues.common.storeId', { storeId: issue.storeId }))}
              </span>
              <span dir="ltr" className="font-mono text-xs">{issue.externalId}</span>
              <span className="text-xs text-gray-500" dir="ltr">
                {t('linkIssues.common.sku')}: {issue.externalSku ?? t('linkIssues.common.noSku')}
              </span>
              <Badge variant="secondary">
                {t(`linkIssues.conflicts.source.${issue.source}`)}
              </Badge>
              <span className="text-xs text-gray-500">
                {t('linkIssues.conflicts.occurrences', { count: issue.occurrences })}
              </span>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <VariantRefCard heading={t('linkIssues.conflicts.current')} variant={issue.existing} />
              <VariantRefCard heading={t('linkIssues.conflicts.attempted')} variant={issue.attempted} />
            </div>
          </IssueRowShell>
        )}
      />

      <IssuePreviewDialog
        isOpen={conflictId !== null}
        onClose={() => setConflictId(null)}
        title={t('linkIssues.conflicts.previewTitle')}
        isLoading={previewQuery.isLoading}
        isError={previewQuery.isError}
        error={previewQuery.error}
        onRetry={() => previewQuery.refetch()}
        onConfirm={() => handleResolve(LINK_CONFLICT_RESOLUTION.MOVE)}
        confirmText={t('linkIssues.conflicts.move')}
        isSubmitting={resolve.isPending}
      >
        {preview && (
          <>
            {!preview.linkIsCurrent && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {t('linkIssues.conflicts.stale')}
              </p>
            )}
            <div className="flex flex-col gap-3 md:flex-row">
              <VariantRefCard heading={t('linkIssues.conflicts.moveFrom')} variant={preview.moveFrom} />
              <VariantRefCard heading={t('linkIssues.conflicts.moveTo')} variant={preview.moveTo} />
            </div>
            <div className="flex justify-start">
              <Button
                type="button"
                variant="outline"
                disabled={resolve.isPending}
                onClick={() => handleResolve(LINK_CONFLICT_RESOLUTION.KEEP)}
              >
                {t('linkIssues.conflicts.keep')}
              </Button>
            </div>
          </>
        )}
      </IssuePreviewDialog>
    </>
  );
}
