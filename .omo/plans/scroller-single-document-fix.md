# Plan: Single-Document Scroller Fix (dashboard layout)

**Status:** VALIDATED (applied in-place on test-staging; type-check + lint + dev-compile PASS; final high-accuracy reviewer PASS; user visual-confirmed working).
**Mode:** Plan finalized. Apply in-place on `test-staging` (worktree isolation skipped per user override m0084). Frontend-only, no backend, no push/commit (project rule).
**Author:** Prometheus (plan builder)
**Date:** 2026-07-20

---

## 1. Problem statement

The dashboard has a **double-scroll / content-clip** defect ("scroller not good"):
- Root shell: `layout.tsx:112` `<div className="flex h-dvh overflow-hidden bg-gray-50">` — FIXED 100dvh clip container.
- Inner scroller: `MainContent.tsx:22` `<main className="flex-1 overflow-y-auto overflow-x-hidden p-4 w-full min-h-0">`.
- Outer wrapper: `MainContent.tsx:8` `<div className="flex-1 flex flex-col overflow-hidden w-0 min-w-0">` ALSO clips overflow.
- `globals.css:273` `html { height: 100%; }` has NO overflow constraint; `layout.tsx:36` `<body>` has NO overflow.

**Consequence today:** the root shell is a fixed `h-dvh overflow-hidden` container, so the document NEVER scrolls (`window.scrollY` is permanently 0). The only scroller is the inner `<main>`, producing a janky nested scroll; and because the root clips, long content can be unreachable. The 4 back-to-top buttons and `useBodyScrollLock.ts` are effectively DEAD today (they read `window.scrollY` which never changes).

**Git archaeology (already done):** "Ahmed Hussam" did NOT introduce this. The scroll architecture was authored by Nader Maher / Omar-YasserVV (commits e734483, 595ed40, 1e76f8b, b61436e, 715a6119). This plan only fixes the layout; no blame implication.

---

## 2. Goals

- Make the **document** the single scroller for all dashboard pages (one smooth window scrollbar; `window.scrollY` works).
- **Re-enable** the 4 back-to-top buttons + `~12 window.scrollTo` pages + `useBodyScrollLock.ts` (they currently read a `window.scrollY` that never changes).
- Pin the **Sidebar** + **TopBar + ActiveJobIndicator** so they stay fixed while the document scrolls.
- Preserve the Safari `h-dvh` viewport fix (b61436e).
- Acceptable blast radius: 4 files, classes-only, no JS logic change.

---

## 3. Rejected alternatives (with rationale)

### Option C — `fixed inset-0` on root (layout.tsx:112) — REJECTED
- Breaks 4 back-to-top buttons that read `window.scrollY` / `window.addEventListener('scroll')`: `allOrders/page.tsx:361`, `call-center/page.tsx:226`, `print-orders/page.tsx:585`, `shipping-orders/page.tsx:349`.
- Breaks `window.scrollTo({top:0})` on ~12 pages (e.g. customers, receipts, purchases, order pages).
- Breaks `useBodyScrollLock.ts` (L7/L15/L23). REJECTED.

### Option A — `html, body { overflow: hidden }` in globals.css — REJECTED
- Clipping body overflow moves scroll into `<main>` and STOPS `window` scroll events → same breakage. REJECTED.

### 1-line fix (remove only `overflow-y-auto` from MainContent.tsx:22) — REJECTED (BROKEN)
- Parent `MainContent.tsx:8` ALSO `overflow-hidden` → content clipped/unreachable. REJECTED.

### 2-line fix (remove `overflow-hidden` from line 8 + `overflow-y-auto` from line 22) — REJECTED (BROKEN)
- Root shell `layout.tsx:112` is `flex h-dvh overflow-hidden` → fixed clip container; even with inner overflow gone, root clips content, document does NOT scroll. REJECTED.

### 3-part fix v1 (remove root `overflow-hidden` + sticky header + drop inner overflow, but KEEP `h-dvh` on root) — REJECTED (BLOCKED by high-accuracy reviewer)
- Keeping `h-dvh` (a FIXED `height: 100dvh`) on the root shell prevents the body/document from growing → document never scrolls; content bleeds below the viewport with no way to reach it. Also: with `h-dvh` kept and the document not scrolling, the Sidebar (`lg:static` flex child) would scroll away once content overflowed. This variant was blocked by two independent momus reviews. The root MUST become `min-h-dvh` (growable) and the Sidebar MUST be pinned.

---

## 4. Confirmed fix (5 parts, classes-only — no JS)

User chose **document-scroll (single smooth bar)**. All changes are Tailwind class edits across 4 files.

### Part 1 — `src/app/dashboard/layout.tsx:112` — root shell grows instead of clipping
```diff
- <div className="flex h-dvh overflow-hidden bg-gray-50">
+ <div className="flex min-h-dvh bg-gray-50">
```
`min-h-dvh` (min-height: 100dvh) lets the shell grow with content → body/document grows → the **document** scrolls. `overflow-hidden` removed (no longer needed; growth replaces clipping).

### Part 2 — `src/app/globals.css` (~line 283, beside existing `.h-dvh` rule) — Safari fallback for `min-h-dvh`
```diff
  @supports (-webkit-touch-callout: none) {
    body {
      min-height: -webkit-fill-available;
    }
    .h-dvh {
      height: -webkit-fill-available;
    }
+   .min-h-dvh {
+     min-height: -webkit-fill-available;
+   }
  }
```
Mirrors the existing `.h-dvh` Safari fallback so `min-h-dvh` fills the iOS viewport correctly (preserves b61436e fix).

### Part 3 — `src/components/dashboard-layout/Sidebar.tsx` — pin Sidebar during document scroll
Locate the outer sidebar wrapper (currently `fixed inset-y-0 right-0 z-40 ... lg:translate-x-0 lg:pointer-events-auto lg:static lg:inset-0`):
```diff
- lg:static lg:inset-0
+ lg:sticky lg:top-0 lg:h-dvh
```
On desktop (`lg+`) the Sidebar becomes `position: sticky; top: 0; height: 100dvh` → stays pinned at the left/right while the document scrolls. Mobile keeps its existing `fixed` overlay behavior (unchanged). The inner `h-full` child still fills it.

### Part 4 — `src/app/dashboard/layout.tsx:127-141` — single sticky header wrapper
```diff
       <MainContent>
-        <div className="flex-shrink-0 pt-[env(safe-area-inset-top)]">
+        <div className="sticky top-0 z-10 bg-gray-50">
+          <div className="flex-shrink-0 pt-[env(safe-area-inset-top)]">
-          <TopBar
+            <TopBar
               onMenuToggle={handleSidebarToggle}
               onSearch={handleSearch}
               onClearSearch={handleClearSearch}
               isSearching={isSearching}
               username={user?.name}
               onUserAction={handleUserAction}
             />
-          </div>
+          </div>
+
+          <div className="flex-shrink-0 px-4 py-1">
+            <ActiveJobIndicator />
+          </div>
+        </div>

-        <div className="flex-shrink-0 px-4 py-1">
-          <ActiveJobIndicator />
-        </div>

         <ErrorBoundary
           fallback={(reset) => <ContentError onRetry={reset} />}
         >
           <PageContent>{children}</PageContent>
         </ErrorBoundary>
       </MainContent>
```
**CRITICAL:** ONE sticky wrapper around BOTH TopBar + ActiveJobIndicator. Do NOT make two separate `sticky top-0` siblings (they overlap when pinned). `bg-gray-50` masks content behind the pinned header; `z-10` keeps it above page content.

### Part 5 — `src/components/dashboard-layout/MainContent.tsx` — drop inner overflow constraints
```diff
  export function MainContent({ children, className = '' }: MainContentProps) {
    return (
-     <div className={`flex-1 flex flex-col overflow-hidden w-0 min-w-0 ${className}`}>
+     <div className={`flex-1 flex flex-col w-0 min-w-0 ${className}`}>
        {children}
      </div>
    );
  }

  export function PageContent({ children, className = '' }: { children: React.ReactNode; className?: string; }) {
    return (
-     <main className={`flex-1 overflow-y-auto overflow-x-hidden p-4 w-full min-h-0 ${className}`}>
+     <main className={`flex-1 overflow-x-hidden p-4 w-full min-h-0 ${className}`}>
        {children}
      </main>
    );
  }
```

**Why this works (end-to-end):**
1. Root shell `min-h-dvh` (growable) + no `overflow-hidden` → `<main>` content flows → body/document grows → **document scrolls** (single window scrollbar).
2. `min-h-dvh` + `.min-h-dvh { min-height: -webkit-fill-available }` → Safari fix preserved.
3. Sidebar `lg:sticky lg:top-0 lg:h-dvh` → pinned during document scroll (was the blocker in v1).
4. Header single `sticky top-0 z-10 bg-gray-50` → pinned during document scroll, no overlap.
5. **`window.scrollY` / `window.scrollTo` now functional** → the 4 back-to-top buttons, ~12 `scrollTo` pages, and `useBodyScrollLock.ts` (which were DEAD under the old fixed shell) now work. This is a behavior RESTORATION, not a regression.
6. Mobile Sidebar keeps its `fixed` overlay (unchanged).
7. `min-h-0` on `<main>` redundant but harmless.

**Blast radius:** 4 files, classes-only, no JS logic.
- `layout.tsx`: root shell (112) + header wrappers (127-141). `MainContent`/`PageContent` used only locally (127, 146).
- `globals.css`: one added `.min-h-dvh` Safari rule inside existing `@supports` block.
- `Sidebar.tsx`: desktop positioning classes only (`lg:static lg:inset-0` → `lg:sticky lg:top-0 lg:h-dvh`); mobile `fixed` unchanged.
- `MainContent.tsx`: 2 callers (`layout.tsx` + `dashboard-layout/index.ts`); `PageContent` consumed only inside `MainContent` at layout.tsx:146.
- No page sets `h-full` expecting `<main>` as a fixed-height scroller (verified: orders/page.tsx redirects to allOrders; customers/page.tsx `CustomersContent`; products/page.tsx `ProductsTable`).
- Pages with their OWN internal `overflow-y-auto` (e.g. `MainScanPanel` scanned list `max-h-60 overflow-y-auto`, `PageTabs` horizontal scroll) are unaffected — local scroll regions inside the now-document-scrolling `<main>`.

---

## 5. Verification gates (post-apply, before declaring done)

1. `npm run type-check` — must pass (no type changes; classes only).
2. `npm run lint` — must pass.
3. Visual smoke via dev server (`npm run dev`, port 4001) on a desktop viewport:
    - Long dashboard pages (orders list, customers) scroll smoothly with a SINGLE window scrollbar (no nested double-scroll).
    - **Sidebar stays pinned** while scrolling (does NOT scroll away).
    - **TopBar + ActiveJobIndicator stay pinned** at top while content scrolls underneath.
    - **Back-to-top button** on `allOrders`, `call-center`, `print-orders`, `shipping-orders` appears after scrolling and resets to top (was dead before).
    - A modal (e.g. AddLeadModal / returns dialog) opens with body scroll locked behind it; no background scroll leak (`useBodyScrollLock` now functional).
    - Safari / mobile: layout fills viewport (min-h-dvh + .min-h-dvh fallback), no topbar cut-off; mobile Sidebar overlay still works.
4. Re-run high-accuracy reviewer (momus) on the applied diff as a final gate.

---

## 6. Decision (user)

User chose **document-scroll (single smooth bar)** (m0073). Apply the 5-part fix in-place on `test-staging`, then run verification + final reviewer.

- Dispatch a bounded frontend-skilled fixer (per orchestration rule m0084: every sub-agent uses frontend skills, follows system design, NO worktree, edits in-place on `test-staging`).
- Fixer applies Parts 1–5, runs `npm run type-check` + `npm run lint`, and does a dev-server visual smoke check.
- After fixer: re-run high-accuracy reviewer on the diff.

No worktree (user override). No commit/push (project rule). Changes stay local.
