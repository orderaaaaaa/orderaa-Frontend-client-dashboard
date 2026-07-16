import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs';

export const useJobStatus = (jobId: string | null) =>
  useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.getStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === 'DONE' || s === 'FAILED' ? false : 3000;
    },
  });
