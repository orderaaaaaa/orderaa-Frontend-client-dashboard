# frontend-job-status-sync-merge - Work Plan

## TL;DR (For humans)

The backend now runs product **Sync** and **Merge** as background jobs: both endpoints return `202 { message, jobId }` and the client polls `GET /jobs/:jobId` for status (`QUEUED | RUNNING | DONE | FAILED`). The frontend currently assumes these calls are synchronous (it reads sync counts and pops a "merge succeeded" toast the instant the request resolves) — which is now wrong. This plan adds a small, repo-native job-status layer and rewires the two flows to fire-and-forget + poll + notify.

**What you'll get:** clicking Sync or Merge immediately shows an "accepted / queued" toast, the job is tracked in a Zustand store (so it survives navigation and page reload), a polling hook watches it and shows a success toast with the real result counts (sync) or a "merge done" toast (merge) on `DONE`, and an error toast with retry on `FAILED`. A single global indicator in the dashboard layout shows the in-flight job (jobs are serialized backend-side, so at most one runs at a time).

**Why this approach:** matches the backend 202+jobId+poll contract exactly; reuses existing React Query + Zustand + react-toastify conventions; no new notification-center page (overkill).

**What it will NOT do:** no changes to webhook/auto-enqueued jobs (server-internal); no retry of `DONE`; no rate-limit UI; no sonner migration (uses react-toastify per existing products-module convention).

**Effort:** ~9 files, small/medium. **Risk:** low — additive; endpoints unchanged, only response interpretation changes.

**Reviewer fixes applied (post-review):** (1) 🔴 Momus HIGH — added global `JobWatcher` at layout level so persisted jobs resume polling after reload/navigation (no orphaned badge, DONE toast still fires). (2) MEDIUM — `formatCounts` now defined defensively (tolerates missing `failures`; per-store sync returns none — Oracle HIGH). (3) LOW — `JobPollResponse` includes optional `type`/`payload` for contract completeness; backend actually returns 201 (not 202) but that is irrelevant to the client.

**Decisions:** react-toastify for all job toasts (repo default in products module). Zustand `persist`→sessionStorage for active-jobs. Poll interval 3000ms.

## Scope

IN:
- Add job types + `GET /jobs/:jobId` API function.
- Add Zustand `useJobStore` (activeJobs, sessionStorage persist).
- Add `useJobStatus(jobId)` React Query polling hook.
- Rewire `useSyncProducts` + `ProductsHeader` to fire-and-forget 202 → toast(accepted) → track → poll → toast(done/failed).
- Rewire `useMergeProducts` + `MergeProductsModal` to fire-and-forget 202 → toast(accepted) → track → poll → toast(done/failed); **remove** the premature `toast.success('تم دمج المنتجات بنجاح')`.
- Add one global active-job indicator in the dashboard layout.

OUT:
- Webhook / cron / integration-config auto-enqueued jobs (server-internal, no UI).
- Any retry of a `DONE` job.
- Rate-limit / backpressure UI.
- Migration from react-toastify to sonner.
- New notification-center route/page.

## Verification strategy

- **Type-check:** `npm run type-check` (strict TS) — must pass with 0 errors.
- **Lint:** `npm run lint` (next lint) — must pass with 0 errors/warnings.
- **Manual (agent-executed QA):** no automated test suite exists (per AGENTS.md). QA = type-check + lint + a documented manual flow trace (below). Optionally run `npm run dev` and confirm Sync/Merge toasts behave.
- **Agent-executed QA per todo:** each todo lists happy + failure scenarios with the exact verification command/evidence path.

## Execution strategy

Single worker, in-place edits (no worktree — user override m0013; no commits/pushes — project rule). Backend contract already fixed and validated. Frontend changes are additive and isolated to the products domain + one dashboard-layout indicator + one store + one hook + one api fn. Order: types → api → store → hook → sync wiring → merge wiring → indicator → verify.

## Todos

### Wave 1 — Foundation (types, api, store, hook)

1. [x] Add job types to `types/products.ts`
  - References: `src/app/dashboard/products/types/products.ts` (existing `SyncProductsResponse`, `MergeProductsPayload`); backend `src/common/jobs/sequential-job.types.ts` (`SequentialJobStatus` enum: QUEUED|RUNNING|DONE|FAILED; `SequentialJobRecord` shape).
  - Add:
    ```ts
    export interface JobAcceptedResponse {
      message: string;
      jobId: string;
    }
    export type JobStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';
    // NOTE: the Prisma `sequential_jobs` table has `type`/`payload` columns, but the
    // backend `GET /jobs/:jobId` response (sequential-job-queue.service.ts getStatus) does
    // NOT return them. `type`/`payload` below are optional and will be undefined from the API;
    // the job `type` used for toast branching must come from the Zustand store's ActiveJob.type.
    export interface JobPollResponse {
      jobId: string;
      status: JobStatus;
      enqueuedAt: number;
      startedAt?: number;
      finishedAt?: number;
      result?: unknown;
      error?: string;
      type?: string;
      payload?: unknown;
    }

    // Sync job `result` shape. WARNING: path-dependent (see Oracle HIGH finding).
    // - Aggregate path (syncAllForMerchant): { synced, created, updated, failures[] }
    // - Per-store path (syncProducts):       { synced, created, updated }  (NO failures)
    export interface SyncJobResult {
      synced: number;
      created: number;
      updated: number;
      failures?: { storeId: number | null; provider: string; error: string }[];
    }

    // formatCounts MUST tolerate a missing `failures` (per-store sync returns none).
    export const formatCounts = (result: unknown): string => {
      const r = (result ?? {}) as Partial<SyncJobResult>;
      const synced = r.synced ?? 0;
      const created = r.created ?? 0;
      const updated = r.updated ?? 0;
      const failures = r.failures?.length ?? 0;
      let msg = `تمت المزامنة: ${synced} منتج (${created} جديد، ${updated} محدث)`;
      if (failures > 0) msg += ` — ${failures} أخطاء`;
      return msg;
    };
    ```
  - Acceptance: types compile; `JobStatus` literal union matches backend enum values exactly (uppercase). `formatCounts` handles `result` being `undefined` OR missing `failures` without throwing.
  - QA happy: `npm run type-check` passes; a grep confirms `JobStatus` has the 4 literals. QA fail: `npm run type-check` fails if a typo'd literal (e.g. 'RUNING') is used — fix before proceed.
  - Commit: none (local only).

1. [x] Add `jobsApi.getStatus(jobId)` API fn
  - References: `src/app/dashboard/products/api/products.ts` (pattern: `http` wrapper, e.g. `sync`). New file `src/app/dashboard/products/api/jobs.ts` (keeps products.ts focused; co-located with products domain).
  - Add:
    ```ts
    import http from '@/lib/api/http';
    import { JobPollResponse } from '../types/products';
    export const jobsApi = {
      getStatus: async (jobId: string): Promise<JobPollResponse> => {
        const response = await http.get<JobPollResponse>(`/jobs/${jobId}`);
        return response.data;
      },
    };
    ```
  - Acceptance: hits `GET /jobs/:jobId`; returns `JobPollResponse`; 404 from backend surfaces as axios error (handled by hook).
  - QA happy: `npm run type-check` passes; manual `npm run dev` → call returns a record. QA fail: wrong path (`/job/` singular) → 404; verify path is `/jobs/${jobId}`.
  - Commit: none.

2. [x] Add Zustand `useJobStore` (activeJobs + sessionStorage persist)
  - References: `src/store/` (existing authStore uses `persist` + localStorage; AGENTS.md: Zustand for client state). New file `src/store/useJobStore.ts`.
  - Store shape:
    ```ts
    interface ActiveJob { jobId: string; type: 'SYNC' | 'MERGE'; label: string; }
    interface JobStore {
      activeJobs: ActiveJob[];
      addJob: (j: ActiveJob) => void;
      removeJob: (jobId: string) => void;
    }
    ```
    Use `persist` with `createJSONStorage(() => sessionStorage)` (survives reload, not cross-tab permanent). Key `orderaa-active-jobs`.
  - Acceptance: addJob/removeJob mutate activeJobs; store rehydrates from sessionStorage on load.
  - QA happy: `npm run type-check` passes; in dev, add a job, reload page, job still present in store (sessionStorage). QA fail: using `localStorage` would persist across sessions unexpectedly — confirmed sessionStorage.
  - Commit: none.

3. [x] Add `useJobStatus(jobId)` React Query polling hook
  - References: `src/app/dashboard/products/hooks/` (React Query pattern from `useProduct.ts`); `jobsApi.getStatus`; AGENTS.md QueryClient config (`retry:false`). New file `src/app/dashboard/products/hooks/useJobStatus.ts`.
  - Implementation:
    ```ts
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
    ```
  - Acceptance: polls every 3s until terminal; stops on DONE/FAILED; `enabled:false` when jobId null.
  - QA happy: `npm run type-check` passes; React Query devtools show polling then stop. QA fail: `refetchInterval` returning `false` stops polling (not `0`/`undefined` which would re-poll) — verify boolean false.
  - Commit: none.

### Wave 2 — Wiring (sync, merge, indicator)

4. [x] Rewire `useSyncProducts` to fire-and-forget 202 + track + poll
  - References: `src/app/dashboard/products/hooks/useProduct.ts:79` (`useSyncProducts`); `productsApi.sync()` (api/products.ts:41 returns `SyncProductsResponse` → **change to `JobAcceptedResponse`**); `useJobStore.addJob`; `toast` from `react-toastify`; `useJobStatus`.
  - Changes:
    1. `productsApi.sync()` return type → `JobAcceptedResponse` (T1/T2 already in place; backend returns 202 with jobId).
     2. `useSyncProducts` `onSuccess`: capture `data.jobId`; `toast.info('تم بدء مزامنة المنتجات...', { autoClose: 2000 })` (or `toast.loading`); `useJobStore.getState().addJob({ jobId, type:'SYNC', label:'مزامنة المنتجات' })`. Do NOT invalidate products and **DO NOT mount any local watcher here** — the global `JobWatcher` (todo 6) owns ALL terminal toasts so we avoid a double-toast.
     3. (No local watcher.) Terminal toast + `productKeys.all` invalidate + `removeJob` happen exclusively in the global `JobWatcher` (todo 6) which reads `type` from the Zustand store entry.
  - Acceptance: clicking Sync shows accepted toast immediately; real success toast appears only when poll reaches DONE with counts; products list refreshes then.
  - QA happy: `npm run type-check` + `npm run lint` pass; `npm run dev` → Sync → accepted toast → (after backend job) done toast with counts. QA fail: if `productsApi.sync` still typed as `SyncProductsResponse`, build breaks — confirm return type changed; if toast fires before DONE, regression — confirm premature toast removed.
  - Commit: none.

- [x] **T6: Rewire `useMergeProducts` + `MergeProductsModal` to fire-and-forget 202 + track + poll**
  - References: `src/app/dashboard/products/hooks/useMergeProducts.ts`; `src/app/dashboard/products/components/modals/MergeProductsModal.tsx:310-341` (handleSubmit → `mutate` → `onSuccess` shows `toast.success('تم دمج المنتجات بنجاح')` then closes). `productsApi.merge` return type → `JobAcceptedResponse`.
  - Changes:
    1. `productsApi.merge` return type → `JobAcceptedResponse`.
     2. `handleSubmit` `onSuccess`: capture `data.jobId`; `toast.info('تم بدء دمج المنتجات...')`; `useJobStore.addJob({ jobId, type:'MERGE', label:'دمج المنتجات' })`; **close the modal** (`onClose()`) AND call the parent `onSuccess()` prop (clears `ProductsTable` selection state: `setSelectedIds/new Set()`, `setSelectedProductsMap/new Map()`, `setSelect(false)`) so user isn't blocked waiting and selection resets. **Remove** the immediate `toast.success('تم دمج المنتجات بنجاح')`.
     3. (No local watcher.) Terminal toast + invalidate + `removeJob` happen exclusively in the global `JobWatcher` (todo 6) — this avoids a double-toast (a local watcher + the global watcher would both fire).
  - Acceptance: merge modal closes immediately on submit; success toast appears only when poll reaches DONE; products list refreshes.
  - QA happy: type-check + lint pass; `npm run dev` → select products → merge → modal closes → (after job) success toast. QA fail: if modal stays open waiting, UX regression — confirm `onClose()` called in onSuccess; if premature success toast remains, regression — confirm removed.
  - Commit: none.

 6. [x] Add single global active-job indicator + reload-resume watcher in dashboard layout
  - References: `src/components/dashboard-layout/` (sidebar/topbar); AGENTS.md (dashboard layout wraps auth routes); `useJobStore.activeJobs`; `useJobStatus`. **This todo closes the Momus HIGH reload-resume gap.**
  - Implementation (TWO parts, both rendered ONCE at the dashboard-layout level, e.g. inside the topbar or a `JobWatcherProvider`):
    - **(a) ActiveJobIndicator**: read `useJobStore.activeJobs`; if non-empty, show a small pulsing badge with the first job's label + a spinner; tooltip lists all. Since backend serializes, at most one runs, but show count if >1. Display-only.
    - **(b) JobWatcher (RESUME POLLING)**: for EACH job in `useJobStore.activeJobs`, render a `<JobWatcher key={job.jobId} jobId={job.jobId} type={job.type} />` (pass `type` from the store entry; do NOT read `data.type` — the backend `GET /jobs/:jobId` response omits `type`/`payload`, so `type` must come from the Zustand store, not the API). Inside, call `useJobStatus(jobId)`; on terminal status fire the toasts and call `removeJob(jobId)`:
      - `DONE` + type `SYNC` → `toast.success(formatCounts(data?.result))` (pass `data.result`, NOT `data` — `formatCounts` reads `result.synced/created/updated/failures`), `queryClient.invalidateQueries({ queryKey: productKeys.all })`, `removeJob`.
      - `DONE` + type `MERGE` → `toast.success('تم دمج المنتجات بنجاح')`, invalidate `productKeys.all`, `removeJob`.
      - `FAILED` (any type) → `toast.error(data.error || 'فشلت العملية')`, `removeJob`.
      This makes persisted (sessionStorage) jobs resume polling after a page reload or navigation — without it, a completed job would leave an orphaned store entry and the user would get no DONE toast.
  - Acceptance: indicator + watcher appear when a job is active; both disappear when store empties (job removed on DONE/FAILED). After a manual page reload mid-job, the watcher re-mounts from sessionStorage and still delivers the DONE/FAILED toast + clears the entry.
  - QA happy: type-check + lint pass; `npm run dev` → trigger sync → indicator shows → disappears on done; RELOAD the page mid-job → on completion the DONE toast still fires and the badge clears. QA fail: indicator/badge persists after done → confirm `removeJob` called on terminal inside JobWatcher; if reload loses the toast → confirm JobWatcher is mounted at layout level (not inside ProductsHeader).
  - Commit: none.

### Wave 3 — Verify

7. [x] Verify — type-check + lint
  - Run `npm run type-check` and `npm run lint` from `orderaa-web-frontend/`. Both must pass with 0 errors.
  - Acceptance: exit 0 on both.
  - QA happy: both commands exit 0. QA fail: any TS error (e.g. `SyncProductsResponse` still referenced) or lint error → fix and re-run.
  - Commit: none.

## Final verification wave

Runs in parallel after all todos; all must APPROVE; surface results and wait for user's explicit okay before declaring complete:
- **F1. plan compliance audit** — every todo's references/acceptance matched the written code.
- **F2. code quality review** — follows FE-RULES (follow existing structure/UI identity, no redesign, reusable patterns); react-toastify consistent; no dead code; RTL/Arabic strings preserved.
- **F3. real manual QA** — `npm run dev`, trigger Sync and Merge, confirm accepted→done/failed toasts + indicator + list refresh; confirm reload mid-job resumes (sessionStorage).
- **F4. scope fidelity** — no out-of-scope changes (no webhook UI, no sonner migration, no notification page).

## Commit strategy

No commits/pushes (project rule + user override). All changes stay local in the frontend repo working tree. Worker must NOT run git commit.

## Success criteria

1. `POST /products/sync` and `POST /products/:id/merge` clients handle `202 { message, jobId }` (no longer expect synchronous result).
2. User gets immediate "accepted" feedback and a final "done" (with counts for sync) / "failed" (with retry) toast.
3. Active job survives navigation + page reload (Zustand sessionStorage).
4. Single global indicator reflects in-flight job.
5. `npm run type-check` + `npm run lint` pass with 0 errors.
6. No premature success toast (merge modal no longer claims success before the job runs).
