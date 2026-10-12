'use client';

import { useEffect, useRef } from 'react';
import { useJobStore, ActiveJob } from '@/store/useJobStore';
import { useJobStatus } from '@/app/dashboard/products/hooks/useJobStatus';
import { formatCounts } from '@/app/dashboard/products/types/products';
import {
  describeMergeIssue,
  parseMergeJobError,
} from '@/app/dashboard/products/utils/mergePlan';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { productKeys } from '@/app/dashboard/products/hooks/queryKeys';
import { Loader2 } from 'lucide-react';

const ARABIC_PATTERN = /[؀-ۿ]/;
const MAX_LISTED_ISSUES = 5;

function failureFallback(job: ActiveJob) {
  return job.type === 'MERGE'
    ? 'تعذر دمج المنتجات، لم يتم تغيير أي شيء'
    : 'تعذرت مزامنة المنتجات';
}

function JobFailure({ job, error }: { job: ActiveJob; error?: string }) {
  const parsed = job.type === 'MERGE' ? parseMergeJobError(error) : null;
  if (!parsed) {
    return (
      <span>
        {error && !error.trimStart().startsWith('{') && ARABIC_PATTERN.test(error)
          ? error
          : failureFallback(job)}
      </span>
    );
  }
  const labelOf = (variantId: number) =>
    job.variantLabels?.[variantId] ?? `المتغير #${variantId}`;
  const listed = parsed.issues.slice(0, MAX_LISTED_ISSUES);
  const hidden = parsed.issues.length - listed.length;
  return (
    <div className="space-y-1 text-sm">
      <p className="font-semibold">{failureFallback(job)}</p>
      {listed.length > 0 && (
        <ul className="list-disc space-y-0.5 ps-4">
          {listed.map((issue, index) => (
            <li key={`${issue.code}-${issue.variantId ?? 'none'}-${index}`}>
              {issue.variantId !== null && (
                <span className="font-medium">{labelOf(issue.variantId)}: </span>
              )}
              {describeMergeIssue(issue, labelOf)}
            </li>
          ))}
        </ul>
      )}
      {hidden > 0 && <p>و{hidden} مشكلة أخرى</p>}
    </div>
  );
}

// JobWatcher: polls a single job and fires terminal toasts + cleanup
function JobWatcher({ job }: { job: ActiveJob }) {
  const queryClient = useQueryClient();
  const removeJob = useJobStore((s) => s.removeJob);
  const { data } = useJobStatus(job.jobId);
  const settledRef = useRef(false);
  const status = data?.status;

  useEffect(() => {
    if (!data || settledRef.current) return;
    if (data.status === 'DONE') {
      settledRef.current = true;
      // Fire toast based on job type (type comes from Zustand store, NOT from data.type)
      if (job.type === 'SYNC') {
        toast.success(formatCounts(data.result));
      } else if (job.type === 'MERGE') {
        toast.success('تم دمج المنتجات بنجاح');
      }
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      removeJob(job.jobId);
    } else if (data.status === 'FAILED') {
      settledRef.current = true;
      toast.error(<JobFailure job={job} error={data.error} />, {
        autoClose: parseMergeJobError(data.error) ? 12000 : 5000,
      });
      removeJob(job.jobId);
    }
  }, [status, data, job, queryClient, removeJob]);

  return null;
}

// ActiveJobIndicator: shows a pulsing badge when a job is active
export function ActiveJobIndicator() {
  const activeJobs = useJobStore((s) => s.activeJobs);

  return (
    <>
      {activeJobs.map((job) => (
        <JobWatcher key={job.jobId} job={job} />
      ))}
      {activeJobs.length > 0 && (
        <div className="flex-shrink-0 px-4 py-1">
          <div
            role="status"
            className="flex min-w-0 items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          >
            <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
            <span className="truncate">{activeJobs[0].label}</span>
            {activeJobs.length > 1 && (
              <span className="shrink-0">({activeJobs.length})</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
