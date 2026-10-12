# Frontend Orders Module — AGENTS.md

## Primary Domain

Orders is the largest frontend module (~100+ files, 12 subdirs). Root patterns (React Query + Zustand + Tailwind 4 + shadcn) apply universally — this file covers deviations.

## Sub-modules

| Sub-module | Files | Notes |
|-----------|-------|-------|
| `allOrders/` | ~10 | Bulk actions (useOrderBulk), per-status filter types |
| `call-center/` | ~6 | Bulk bar wired to prepare / waiting-for-packaging / call-again (`hooks/useCallCenterBulkActions.ts`) |
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

`print-orders/hooks/useBarcodeScanner.ts` is the only scanner hook (print-orders, shipping-orders, returns `MainScanPanel`). It listens for keyboard-wedge input while no text field has focus. An Enter-terminated buffer is accepted whatever the key timing (slow Bluetooth scanners); a buffer without Enter is accepted only when its average key gap is under `avgTimeThreshold` (30ms). Rejected buffers call `onUnrecognized` (default toast «لم يتم التعرف على الكود»). `enabled: false` clears the buffer; callers pass `!anyModalOpen`. The `window.simulateBarcodeScan` / `testBarcodeScan` / `checkBarcodeScanner` hooks exist only in development. Phones and tablets use the visible `components/ScanInput.tsx`, which calls the same `handleScan` (also rendered inside `ScannedOrdersModal` through `onManualScan`). There is no camera scanner.

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
- **Pending until refetched** — `useOrderBulk` awaits `invalidateAndWait(orderStatusKeys())` before the caller's `onSuccess`; pass its `isPending` to `BulkActionsBar isLoading` (Select and buttons disabled, spinner). Selection changes are ignored while pending.
- **Partial results** — `allOrders/utils/bulkStatusFeedback.ts`: parked orders are excluded client-side with a warning; `PATCH /orders/bulk` silently skips parked/deleted rows, so `updatedCount < sent ids` shows a warning. Used by allOrders and `CustomerOrdersModal`.
- **Call-center bar** — `call-center/hooks/useCallCenterBulkActions.ts` reuses the print-orders mutations, filters by the backend's allowed source statuses (prepare: CONFIRMED / WAITING_FOR_PACKAGING / CALL_AGAIN; waiting-for-packaging: CONFIRMED), excludes parked orders with a warning, and stays pending until list + counts refetch. «تغيير المنتج» opens `ChangeProductModal` (call-again with packaging notes).

## Order Detail UX

- **`[orderId]/` dynamic route** — `page.tsx` loads single order by ID. Contains order timeline showing status transitions, with `OrderDetailsInfo.tsx` displaying metadata.
- **Status management** — department-appropriate action buttons (confirm, mark shipped, mark delivered, cancel) based on current employee's department and order status.
- **Products grid** — line items with variant info (SKU, attributes, quantity, price) rendered in the detail view.
- **Customer info** — name, phone numbers, governorate/city/address with call history if available.
- **Shipping info** — carrier name, tracking number, shipping address, COD collection status.
- **Navigation** — next/previous order navigation from the list context.
- **Change history card «سجل التعديلات»** (T14) — `components/OrderDetails/ChangeHistory/`, placed after the system-failures panel. Reads `GET /orders/:id/change-history` through `useOrderChangeHistory` (`services/orderChangeHistory.ts`, key `[ORDER_DETAILS, orderId, 'change-history']`, so every detail invalidation refreshes it). Values are formatted by the entry's `valueType`; REF values show their label snapshot, statuses go through `useStatusLabel`. Rendered only for holders of `orders:history:read` (T14b, R69; `useHasPermission(PERMISSION_CODES.ORDERS_HISTORY_READ)` in `OrderDetailsInfo.tsx`), so no request is sent without it; still hidden on 403/404.
- **Field labels** — `constants/orderFieldLabels.ts` is the single map of order field keys (catalog keys, `lines`, `line.*`, `customer.*`), change origins and order enum values (payment method/status, shipping type, settlement source). Use `orderFieldLabelOf` (falls back to the raw key). Actor-type labels stay in `constants/orderSystemFailures.ts`.
- **Customer edits from the order page** pass `orderId` to `useUpdateCustomer`, which sends `PATCH /customers/:id?orderId=<id>` so the edit is recorded in that order's history.

## Invoice Printing UX

- **`print-orders/` sub-module** (~25 files) — self-contained with own hooks (`usePrintOrdersFilters`, `useBarcodeScanner`, `useScannerFeedback`, `usePrintOrderBulk`, `useOrderActions`, `useInvoiceSettings`, `useMarkOrdersPrinted`), services (`printOrders.ts`, `scannedOrders.ts`), types, constants (`invoiceLabels.ts`), utils (`invoiceMapper.ts`, `printAssets.ts`).
- **Print queue UI** — select orders via checkboxes, bulk print action navigates from main orders page. `PrintOrdersContent.tsx` orchestrates the print flow.
- **Print claims and confirmation (U6b, R84/R101)** — `components/FilterSection/index.tsx` owns the flow. The count modal (`PrintInvoicesModal`, 1..20) calls `POST /orders/print/claim-next`; printing the selection calls `POST /orders/print/claim`. Selected orders skipped as `PRINTED` are reprinted, `NOT_CONFIRMED` ones are printed unclaimed and marked on yes, and `CLAIMED_BY_OTHER` / `PARKED` / `NOT_FOUND` are toasted and not printed. After `window.print()` the invoices are kept and `PrintConfirmDialog` asks «هل تمت الطباعة؟»: it refreshes the claim on open and before each «إعادة الطباعة», «نعم» sends `PUT /orders/print/mark {ordersIds, printTimes}` plus one `POST /orders/print/reprint` for printed orders, and «لا» or closing sends `POST /orders/print/release`. Nothing is marked or counted without «نعم». A closed tab leaves the claim to expire after 10 minutes. The legacy `POST /orders/print {count}` (claims and marks in one call) is no longer used by the dashboard.
- **Invoice formats**: A4 letter (`Invoice/` component) for standard printers, 100mm x 150mm thermal (`BostaInvoice/` component) for Bosta shipping labels — both rendered via `jspdf` + `jspdf-autotable`.
- **Data transformation** — `invoiceMapper.ts` converts `Order` data into invoice-specific props. `invoiceLabels.ts` holds Arabic label constants.
- **Printer CSS** in global styles — `@media print` rules for `.a4-invoice`, `.bosta-invoice`, `.generic-invoice` classes.

## Barcode Scanner UX (expanded)

- **One hook**: `useBarcodeScanner` (see Barcode Scanner System) plus the visible `ScanInput` field for phones, tablets and scanners that type into a focused field.
- **Returns scanning** (`returns-receiving/components/Step1Receive/MainScanPanel.tsx`): the barcode field is never disabled during a lookup. Codes are queued, shown as pending rows and resolved in order; duplicates vibrate. «تأكيد استلام المرتجعات» opens a confirmation with the scanned count.
- **Audio feedback**: `useScannerFeedback` hook in `print-orders/hooks/` plays a beep via `AudioContext` on successful scan.
- **Dual mode**: scanning used in `shipping-orders/` (assign orders to carrier, approve for shipment) and `returns-receiving/` (register return, verify order exists).

## Returns UX

- **Step1 (الاستلام)** — `Step1Receive/index.tsx`: scan order barcode to verify order exists (via `getReturnOrderByCode` in mock or real API), upload receipt image (required, single file), upload code sheet images (optional, multi-upload). Uploads happen atomically via `Promise.all`. Mutation-driven through `useReturnsMutations` in `returns-receiving/hooks/`.
- **Step2 (التقسيم)** — `Step2Categorize/index.tsx`: DISABLED — backend not ready. Sorts returns into disposition categories (`RESEND`, `FINAL_RETURN`, `WAREHOUSE`) via `CategoryBucket` type. Mock `bulkUpdateReturnCategories` exists in services.
- **Zod schemas** — return-receiving uses its own type definitions in `types/returns.ts`. Shared order filter schemas in `src/schemas/orderFilters.schema.ts`. No dedicated return-receiving Zod file exists — validation is handled through TypeScript types and the mock service layer.
- **Mock services** in `returns-receiving/services/mock.ts` — `getReturnOrderByCode`, `uploadReturnsReceiptProof`, `bulkUpdateReturnCategories`, `generateReturnResendCodes`. Fixture data in `fixtures.ts`. These are temporary; replace with real API calls when backend endpoints are available.
