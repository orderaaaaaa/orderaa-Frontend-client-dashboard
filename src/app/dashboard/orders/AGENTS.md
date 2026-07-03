# Frontend Orders Module — AGENTS.md

## Primary Domain

Orders is the largest frontend module (~100+ files, 12 subdirs). Root patterns (React Query + Zustand + Tailwind 4 + shadcn) apply universally — this file covers deviations.

## Sub-modules

| Sub-module | Files | Notes |
|-----------|-------|-------|
| `allOrders/` | ~10 | Bulk actions (useOrderBulk), per-status filter types |
| `call-center/` | ~5 | Minimal |
| `print-orders/` | ~25 | Largest sub-module — has own hooks/services/types/utils/constants/components |
| `returns-receiving/` | ~15 | Step-based workflow (stepper), barcode scanning, mock services |
| `shipping-orders/` | ~8 | Shipping approval flow, uses shared services |
| `tracking/` | ~5 | Minimal |
| `[orderId]/` | ~10 | Single-order detail view |
| `hooks/` | 3 | useDefaultStatusByPath, useDepartment, useScannedOrders |
| `components/` | 4 | PageTabs (87 lines), pageTaps (157 lines — duplicate), OrdersSelectionHeader, etc. |

## Data Flow — 4 coexisting patterns

1. **Shared services** (primary) — relies on `services/orders.ts` with inline queryFn via `http` wrapper. Preferred.
2. **Local `api/` + hooks/** — `allOrders/api/orders.ts` + `allOrders/hooks/useOrderBulk.ts`. Self-contained.
3. **Mixed React Query + plain async** — `returns-receiving/` calls mutation hooks + direct service calls. Acceptable.
4. **Mock services** — `returns-receiving/services/mock.ts` + `fixtures.ts`. Used when backend endpoint is missing. Do NOT extend — remove when real API exists.

## Key Deviations from Root AGENTS.md

- **Barrel exports used extensively** — `hooks/index.ts`, `print-orders/hooks/index.ts`, `services/index.ts`, `utils/index.ts`, `types/index.ts`, `components/index.ts`. Contradicts root "no barrel exports" guidance — this module is exempt (accepted pattern).
- **Duplicate `PageTabs` / `pageTaps`** — both exist in `components/`, both imported by 5+ files. `pageTaps.tsx` is the larger variant (157 lines). Do NOT create a third variant.
- **Type duplication** — persists between `types/StatusTypes.ts` and shared `@/types/orders.ts`. Extend shared types rather than creating local duplicates.

## Barcode Scanner System

`print-orders/hooks/useBarcodeScanner.ts` — buffer-based hardware scanner detection (keyboard wedge via key timing). Average time threshold (30ms) with character accumulation + AudioContext feedback. Two variants: `useBarcodeScanner` (generic) and `useFocusedBarcodeScanner` (returns-receiving, with input focus management).

## Invoice / Print Architecture

`print-orders/` has a complete sub-module with own hooks/services/types:
- **Components**: `Invoice/`, `BostaInvoice/` (100mm×150mm thermal) — jsPDF rendering
- **Hooks**: `usePrintOrdersFilters`, `useBarcodeScanner`, `useScannerFeedback`, `usePrintOrderBulk`, `useOrderActions`, `useInvoiceSettings`, `useMarkOrdersPrinted`
- **Utils**: `invoiceMapper.ts` (data → invoice props), `printAssets.ts`
- **Constants**: `invoiceLabels.ts`

Print styles for invoices in root `layout.tsx` / global CSS (A4 letter, bosta thermal, generic-invoice).

## Icon Usage

Module imports from **7 react-icon families** (not just `lucide-react`): Boxes (base), Truck, BadgePlus, Repeat, PhoneCall, Ban, CheckCircle2, CircleDollarSign, Clock3, FileText, ClipboardCheck, etc. Use existing imports before adding new icon packages.

## Order List UX

- **Infinite scroll** via `useInfiniteOrders` in `services/orders.ts`. Uses `useInfiniteQuery` with `getNextPageParam` checking `meta.hasNextPage`. Appends pages as user scrolls.
- **Filter tabs** by status per department: call-center sees pre-confirmation statuses (NEW_ORDER through CONFIRMED), packaging sees CONFIRMED through WAITING_FOR_APPROVAL, shipping sees SHIPPING onward. Tabs rendered via `PageTabs`/`pageTaps`.
- **Filter controls**: date range picker, carrier dropdown, search by order ID/phone/customer name. Filter state managed through `FilterOrdersDto` in `services/orders.ts`. Zod validation in `src/schemas/orderFilters.schema.ts`.
- **Per-status filter types** in `allOrders/` — local type definitions that mirror `OrderStatus` subsets for each department tab.
- **Loading state**: skeleton cards (`OrderCard.tsx`) matching the order card shape, shown during initial `isLoading`.
- **Empty state**: `OrderCard` or list view shows "لا توجد طلبات" message per status tab when data length is zero.
- **Error state**: error display with retry button mapped from React Query `isError` state in the page component.

## Bulk Actions UX

- **OrdersSelectionHeader** in `components/` — toggle select mode, select-all/clear, shows count of selected orders (`تم تحديد N طلب`).
- **Bulk actions bar** appears on selection: bulk print (navigates to `print-orders/`), bulk shipping export (generates shipping manifest), bulk assign carrier.
- **`useOrderBulk` hook** in `allOrders/hooks/useOrderBulk.ts` — wraps `bulkOrders()` mutation from `allOrders/api/orders.ts`. Accepts `BulkRequest` payload and optional `currentStatus`. Used for status transitions and bulk operations.
- **Bulk types** in `allOrders/types/Bulk.ts` — `BulkRequest`, `BulkUpdateResponse` interfaces.

## Order Detail UX

- **`[orderId]/` dynamic route** — `page.tsx` loads single order by ID. Contains order timeline showing status transitions, with `OrderDetailsInfo.tsx` displaying metadata.
- **Status management** — department-appropriate action buttons (confirm, mark shipped, mark delivered, cancel) based on current employee's department and order status.
- **Products grid** — line items with variant info (SKU, attributes, quantity, price) rendered in the detail view.
- **Customer info** — name, phone numbers, governorate/city/address with call history if available.
- **Shipping info** — carrier name, tracking number, shipping address, COD collection status.
- **Navigation** — next/previous order navigation from the list context.

## Invoice Printing UX

- **`print-orders/` sub-module** (~25 files) — self-contained with own hooks (`usePrintOrdersFilters`, `useBarcodeScanner`, `useScannerFeedback`, `usePrintOrderBulk`, `useOrderActions`, `useInvoiceSettings`, `useMarkOrdersPrinted`), services (`printOrders.ts`, `scannedOrders.ts`), types, constants (`invoiceLabels.ts`), utils (`invoiceMapper.ts`, `printAssets.ts`).
- **Print queue UI** — select orders via checkboxes, bulk print action navigates from main orders page. `PrintOrdersContent.tsx` orchestrates the print flow.
- **Invoice formats**: A4 letter (`Invoice/` component) for standard printers, 100mm x 150mm thermal (`BostaInvoice/` component) for Bosta shipping labels — both rendered via `jspdf` + `jspdf-autotable`.
- **Data transformation** — `invoiceMapper.ts` converts `Order` data into invoice-specific props. `invoiceLabels.ts` holds Arabic label constants.
- **Printer CSS** in global styles — `@media print` rules for `.a4-invoice`, `.bosta-invoice`, `.generic-invoice` classes.

## Barcode Scanner UX (expanded)

- **Two variants**: `useBarcodeScanner` (generic, used in `print-orders/hooks/`) — keyboard wedge via buffer accumulation with 30ms average keystroke threshold to distinguish scanner from human typing. `useFocusedBarcodeScanner` (`returns-receiving/hooks/`) — same mechanics with input focus management for the returns workflow.
- **Audio feedback**: `useScannerFeedback` hook in `print-orders/hooks/` plays a beep via `AudioContext` on successful scan.
- **Dual mode**: scanning used in `shipping-orders/` (assign orders to carrier, approve for shipment) and `returns-receiving/` (register return, verify order exists).

## Returns UX

- **Step1 (الاستلام)** — `Step1Receive/index.tsx`: scan order barcode to verify order exists (via `getReturnOrderByCode` in mock or real API), upload receipt image (required, single file), upload code sheet images (optional, multi-upload). Uploads happen atomically via `Promise.all`. Mutation-driven through `useReturnsMutations` in `returns-receiving/hooks/`.
- **Step2 (التقسيم)** — `Step2Categorize/index.tsx`: DISABLED — backend not ready. Sorts returns into disposition categories (`RESEND`, `FINAL_RETURN`, `WAREHOUSE`) via `CategoryBucket` type. Mock `bulkUpdateReturnCategories` exists in services.
- **Zod schemas** — return-receiving uses its own type definitions in `types/returns.ts`. Shared order filter schemas in `src/schemas/orderFilters.schema.ts`. No dedicated return-receiving Zod file exists — validation is handled through TypeScript types and the mock service layer.
- **Mock services** in `returns-receiving/services/mock.ts` — `getReturnOrderByCode`, `uploadReturnsReceiptProof`, `bulkUpdateReturnCategories`, `generateReturnResendCodes`. Fixture data in `fixtures.ts`. These are temporary; replace with real API calls when backend endpoints are available.
