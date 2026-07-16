# Draft — frontend job-status (sync/merge)

status: awaiting-approval
pending_action: write .omo/plans/frontend-job-status-sync-merge.md
approach: Spike-free, repo-native plan: add job types + GET /jobs/:jobId API fn + useJobStatus polling hook + Zustand activeJobs store (with sessionStorage hydration) + wire sync/merge to fire-and-forget 202 + toast on accepted/done/failed. One global active-job indicator (jobs are serialized backend-side). Use react-toastify for all job toasts (repo default in products module).

intent: clear
review_required: true

## Decisions
- Toast library: react-toastify (DEFAULT — already used in products module; FE-RULES: follow existing structure). Owner-decision surfaced to user.
- Reload survival: Zustand `persist` (sessionStorage) of activeJobs; on mount hydrate → for each non-terminal job, resume polling.
- Polling: useJobStatus via React Query refetchInterval 3000ms, returns false on DONE/FAILED.
- Coalescing: single active-job indicator in dashboard layout (globally serialized).
- Failure: error toast + retry re-enqueues (call the same hook again).
- No new notification-center page (overkill); toasts + indicator suffice.

## Open forks (user)
- Toast library: toastify (default) vs sonner.

## Components ledger
1. Types — job types (JobAcceptedResponse, JobStatus, JobPollResponse) in types/products.ts
2. API — jobsApi.getStatus(jobId) in api/products.ts (or new api/jobs.ts)
3. Store — useJobStore (Zustand, persist sessionStorage) activeJobs
4. Hook — useJobStatus(jobId) React Query polling
5. Sync wiring — useSyncProducts + ProductsHeader: 202→toast(accepted)+track+start poll
6. Merge wiring — useMergeProducts + MergeProductsModal: 202→toast(accepted)+track+start poll; remove premature success toast
7. Indicator — global active-job indicator in dashboard layout
8. Verify — npm run type-check && npm run lint

## Evidence paths
- backend: src/common/jobs/sequential-job.controller.ts (GET jobs/:jobId), sequential-job.types.ts (SequentialJobStatus/SyncPayload/MergePayload/WebhookOrderCreatePayload), sequential-job-queue.service.ts (enqueue returns jobId, getStatus returns SequentialJobRecord)
- frontend: src/app/dashboard/products/api/products.ts (productsApi.sync/merge), hooks/useProduct.ts (useSyncProducts), hooks/useMergeProducts.ts, components/modals/MergeProductsModal.tsx (toast.success on success → BROKEN by 202), components/ProductsHeader.tsx (sync trigger)
- AGENTS.md: react-toastify used in products/auth flows; sonner installed; no test suite; verify = type-check + lint
