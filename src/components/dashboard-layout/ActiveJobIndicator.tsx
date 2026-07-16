'use client';

import { useJobStore, ActiveJob } from '@/store/useJobStore';
import { useJobStatus } from '@/app/dashboard/products/hooks/useJobStatus';
import { formatCounts } from '@/app/dashboard/products/types/products';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { productKeys } from '@/app/dashboard/products/hooks/queryKeys';
import { Loader2 } from 'lucide-react';

// JobWatcher: polls a single job and fires terminal toasts + cleanup
function JobWatcher({ job }: { job: ActiveJob }) {
  const queryClient = useQueryClient();
  const removeJob = useJobStore((s) => s.removeJob);
  const { data } = useJobStatus(job.jobId);

  if (!data) return null;

  if (data.status === 'DONE') {
    // Fire toast based on job type (type comes from Zustand store, NOT from data.type)
    if (job.type === 'SYNC') {
      toast.success(formatCounts(data.result));
    } else if (job.type === 'MERGE') {
      toast.success('تم دمج المنتجات بنجاح');
    }
    queryClient.invalidateQueries({ queryKey: productKeys.all });
    removeJob(job.jobId);
  } else if (data.status === 'FAILED') {
    toast.error(data.error || 'فشلت العملية');
    removeJob(job.jobId);
  }

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
        <div className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{activeJobs[0].label}</span>
          {activeJobs.length > 1 && <span>({activeJobs.length})</span>}
        </div>
      )}
    </>
  );
}
