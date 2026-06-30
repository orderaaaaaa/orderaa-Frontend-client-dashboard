# Orderaa Frontend — AGENTS.md

## Stack

Next.js 14.2 / React 18 / Tailwind 4 (`@tailwindcss/postcss`) / shadcn-ui New York / React Query (TanStack) / Zustand / Axios / React Hook Form + Zod / RTL Arabic layout.

## Commands (run inside `orderaa-web-frontend/`)

| Action | Command |
|--------|---------|
| Dev server (port 4001) | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Type check | `npm run type-check` |
| Deploy Vercel | `npm run deploy` |

**Package manager: npm** — never pnpm in frontend.

## Critical: no test suite

Frontend has **zero test files, zero test framework, no test scripts**. Do not try to run tests. Verification = `npm run type-check && npm run lint`.

## Lint config

No `.eslintrc.*` file. Lint via `next lint` (Next.js built-in ESLint config). Prettier config inline in `package.json`: `singleQuote: true`.

## Git hooks (Husky)

| Hook | Action |
|------|--------|
| pre-commit | `npx lint-staged` → `tsc --noEmit` on staged `.ts/.tsx` |
| pre-push | auto-deploy Vercel if branch is `development` |
| post-merge | auto-deploy Vercel unconditionally |

## Typescript

`strict: true` in tsconfig. Pre-commit hook enforces `tsc --noEmit` on staged files — fix type errors before commit.

## Directory layout

```
src/
  app/               ← Next.js App Router (route groups: (auth), (home), (new-landing), old-landing/)
  components/        ← shadcn/ui + domain components
    ui/              ← Radix primitives (shadcn)
    orders/          ← order domain (OrderCard, CustomerOrdersModal, etc.)
    dashboard-layout/← sidebar, topbar, breadcrumb, error boundary
  hooks/             ← custom hooks + React Query wrappers
    orders/
  lib/api/           ← Axios instance + typed endpoint functions
  services/          ← React Query hooks (useOrders, useGovernoratesQuery, etc.)
  store/             ← Zustand stores (auth, orders, receipt, productDropdown)
  types/             ← TypeScript types (orders.ts is largest, ~490 lines)
  providers/         ← QueryProvider, theme-provider
  schemas/           ← Zod validation schemas
  constants/         ← app-wide constants (Navbar, dashboard-layout, orders-tabs)
  lib/excel/         ← Bulk import pipeline (parser, processor, validator, template-generator)
  assets/            ← fonts (Beiruti.ttf), sounds (error-sound.mp3, success.mp3)
  utils/             ← cn() helper (clsx + tailwind-merge)
```

## Data flow

```
Component
  → services/ hook (useOrders, useGovernoratesQuery, etc.)
    → lib/api/http.ts (Axios wrapper) OR lib/api/*.ts (raw axios calls)
      → NEXT_PUBLIC_API_URL backend
```

React Query manages caching, loading, error states. Zustand for client-only state.

## Auth token flow

Zustand `authStore` uses `persist` middleware → `localStorage('auth-storage')`. Axios request interceptor reads token **directly from localStorage** (`auth-storage` key), not from Zustand store. Response 401 interceptor clears localStorage and redirects to `/signin`.

## Service layer — 2 patterns coexist

1. **services/orders.ts** — uses `http` wrapper (`@/lib/api/http.ts`), inline queryFn
2. **services/lookups.ts** — delegates axios calls to `lib/api/lookups.ts` endpoint functions

Both valid. No barrel exports — import each hook individually.

## Tailwind 4 specifics

Uses `@import 'tailwindcss'` syntax (not legacy `@tailwind` directives). `@tailwindcss/postcss` plugin. `@custom-variant dark (&:is(.dark *))` for dark mode. `@theme inline` block for CSS variable theming. `tw-animate-css` package for animation utilities.

## Key conventions

- `@/` path alias → `./src/*`
- RTL layout: `html lang="ar" dir="rtl"` in `layout.tsx`
- Custom Beiruti font via `next/font/local` (`--font-beiruti`)
- shadcn-ui v2 components, `lucide-react` icons
- Order management is primary domain
- Infinite scroll for order list via `useInfiniteOrders` in `services/orders.ts`
- `NEXT_PUBLIC_API_URL` in `.env.local` (default: `https://api.orderaa.com`)
- Axios base URL from `NEXT_PUBLIC_API_URL`, default headers: `Accept-Language: ar`
- React Query QueryClient config: `retry: false`, `refetchOnWindowFocus: false`, `staleTime: 30000`
- React Query devtools available in dev via `QueryProvider`
- 2 toast libraries coexisting: `react-toastify` (used in auth guard hooks) + `sonner` (installed — verify before using)
- `react-day-picker` styles imported globally in `layout.tsx`
- PDF generation via `jspdf` + `jspdf-autotable` + `html2canvas`
- Drag-and-drop via `@dnd-kit`
- Charts via `apexcharts` + `recharts`
- Animations via `framer-motion`
- Excel import/export via `xlsx` + custom pipeline in `lib/excel/`
- Custom checkbox CSS overrides native checkboxes (purple `#5d24e1`)
- `input[type='date']` custom styling for RTL (hidden text, positioned picker)
- Print styles for invoices (A4, bosta 100mm×150mm, generic-invoice)
- iOS Safari zoom fix: `font-size: 16px !important` on form inputs
- Safe area inset: `pt-[env(safe-area-inset-top)]` in dashboard layout

## Required Analysis Tools

Frontend is Next.js 14.2. Use these tools before and during code changes:

**Serena MCP** — code analysis, symbol search, find references, find implementations, diagnostics, rename. Essential before deleting/refactoring/renaming components, hooks, stores, or types.

**Next.js MCP** — Next.js-specific tools:
- `nextjs_index` — discover available MCP tools from running dev server
- `nextjs_call` — call tool by name (routes, errors, build status, cache)
- `nextjs_browser_eval` — open pages, click, screenshot, capture console errors
- `nextjs_docs` — version-accurate Next.js docs from installed package

Always use Serena + Next.js MCP before modifying code. Lets you verify routes, check runtime errors, explore component tree, and find references without guessing.

Before starting: read `mem:core` then `mem:frontend/core` for component tree, routes, data flow patterns.

## Living Rules — self-extending from chat

`opencode.json` loads `.FE-RULES` as instruction every session.

**When user states a general pattern/constraint during conversation** (not a one-time task instruction), append it verbatim to `.FE-RULES`:
- file: `orderaa-web-frontend/.FE-RULES`

Signal this is a rule: instruction applies to all future work, not just current task. When unsure, ask "is this a permanent rule for all future work?". If yes, append it.

Keep entries short, one rule per bullet, prefixed with `- `. Do NOT remove or edit existing entries — only append.

## Session Isolation (Worktree)

Before editing any code, create isolated worktree:

1. Verify `.gitignore` has `.temp-worktree-parallel-tasks/` — if missing, append it
2. Generate task slug from description
3. Create branch: `git checkout -b <slug>`
4. Create worktree: `git worktree add .temp-worktree-parallel-tasks/<slug>/frontend <slug>`
5. Work inside worktree: `cd .temp-worktree-parallel-tasks/<slug>/frontend`
6. Install deps: `npm install`

Read-only tasks (analysis, docs, no code changes) skip this step.

## Verify step

Every frontend task must end with: `npm run type-check && npm run lint`. Fix any errors. Only skip if change is entirely non-code (assets).
