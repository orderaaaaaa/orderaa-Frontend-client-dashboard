import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ActiveJob {
  jobId: string;
  type: 'SYNC' | 'MERGE';
  label: string;
}

interface JobStore {
  activeJobs: ActiveJob[];
  addJob: (job: ActiveJob) => void;
  removeJob: (jobId: string) => void;
}

export const useJobStore = create<JobStore>()(
  persist(
    (set) => ({
      activeJobs: [],
      addJob: (job) =>
        set((state) => ({
          activeJobs: [...state.activeJobs.filter((j) => j.jobId !== job.jobId), job],
        })),
      removeJob: (jobId) =>
        set((state) => ({
          activeJobs: state.activeJobs.filter((j) => j.jobId !== jobId),
        })),
    }),
    {
      name: 'orderaa-active-jobs',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
