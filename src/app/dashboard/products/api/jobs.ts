import http from '@/lib/api/http';
import { JobPollResponse } from '../types/products';

export const jobsApi = {
  getStatus: async (jobId: string): Promise<JobPollResponse> => {
    const response = await http.get<JobPollResponse>(`/jobs/${jobId}`);
    return response.data;
  },
};
