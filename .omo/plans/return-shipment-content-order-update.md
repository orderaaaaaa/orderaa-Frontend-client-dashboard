# TL;DR (For humans)

The "add new order" page already shows `returnShipmentContent` ("محتوى شحنة الاسترجاع") only when the shipping type is EXCHANGE / RETURN / PARTIAL_RETURN, and it is required there. The backend `UpdateOrderDto` also already requires it on order update.

The GAP is the **order-detail page** (`/dashboard/orders/[orderId]`): you can change `shippingType` to EXCHANGE/RETURN/PARTIAL_RETURN via `PricingSection`, but there is **no field to view or enter `returnShipmentContent`** — so saving such a change hits a backend 400 with no UI to fix it.

**This plan adds a conditional, required-marked `returnShipmentContent` field inline in `PricingSection`**, mirroring the add-page. No backend change needed — the API already enforces it. User chose "warn but allow": the field shows a required warning when empty & non-DELIVERY but the inline save is not hard-blocked; the backend 400 (already surfaced via the existing error toast) is the enforcement.

---

# Context / Findings (grounded)

- Add-new-order page: `src/app/dashboard/upload-products/manual/ShippingSection.tsx`
  - `requiresReturnContent = ['PARTIAL_RETURN','EXCHANGE','RETURN'].includes(shippingType)` (line 72)
  - Field rendered `{requiresReturnContent && (...)}` (lines 333–348), labeled "محتوى شحنة الاسترجاع", required marker, `onReturnShipmentContentChange`.
  - `schema.ts` zod superRefine (lines 45–54) requires it for those types.
  - `payload.ts` (lines 70–72) sends it. → **Already correct, no change.**
- Backend: `src/orders/dto/update-order.dto.ts` lines 303–321: `returnShipmentContent` with `@ValidateIf((o) => o.shippingType && o.shippingType !== ShippingType.DELIVERY)` → **already required on update.** No change.
- Order-detail page gap:
  - `src/components/OrderDetails/sections/PricingSection.tsx`: renders `ShippingTypeSelect` + `PaymentMethodSelect` + `PaymentStatusSelect` + two `EditableTextField`s. `ShippingTypeSelect.onChange` calls `onUpdate('shippingType', value)`. **No `returnShipmentContent` anywhere.** (lines 57–62)
  - `src/components/OrderDetails/fields/ShippingTypeSelect.tsx`: display + select of shipping type; no content field.
  - `src/components/OrderDetails/EditShippingModal.tsx`: edits company/governorate/city/address/returnShippingCost/times — NOT shippingType or returnShipmentContent.
  - `Order` type (`src/types/orders.ts` line 327) already has `returnShipmentContent?: string | null`.
  - Update mechanism: `useOrderFieldUpdate` (src/hooks/OrderDetails/useOrderFieldUpdate.ts) → `useUpdateOrder` mutation → PATCH `/orders/:id`. On error it already toasts `err.response.data.message`.

# Goal

On the order-detail page, display `returnShipmentContent` and let the user fill it, conditionally on `shippingType`:
- Visible only when `shippingType ∈ {EXCHANGE, RETURN, PARTIAL_RETURN}`.
- Shows current value (read/edit).
- Marked required (`*` + warning text) when empty and non-DELIVERY.
- Soft-gate (warn but allow): do not prevent the `onUpdate('shippingType', ...)` call; backend 400 + existing toast is the enforcement.
- Mirrors add-page labeling and conditional logic exactly.

# Approach

Extend `PricingSection` to render a `returnShipmentContent` editor directly beneath `ShippingTypeSelect`. Reuse the existing inline-edit pattern:

- Add a local `returnContent` state in `PricingSection`, initialized from `order.returnShipmentContent ?? ''`.
- Compute `requiresReturnContent` from `order.shippingType` (same 3-value check as add-page).
- When `requiresReturnContent`:
  - Render a labeled field "محتوى شحنة الاسترجاع" with `*` (required).
  - Use a controlled textarea/Input + Save button (same interaction as `EditableTextField`) that calls `onUpdate('returnShipmentContent', value)`.
  - If `returnContent` is empty, show warning text "يرجى إدخال محتوى شحنة الاسترجاع" (same copy as add-page schema) but DO NOT block the separate `shippingType` change (honor "warn but allow").
- When `shippingType` is switched back to DELIVERY, hide the field (and optionally clear the stored value via `onUpdate('returnShipmentContent','')` to match add-page reset behavior — keep parity).
- Keep `ShippingTypeSelect` as-is; its `onChange` already calls `onUpdate('shippingType', value)`.

Decision: implement as a small inline block (textarea + save), not a new shared component, to stay consistent with `PricingSection`'s existing direct markup and avoid over-abstraction. If a cleaner reusable editor is preferred, extract a `ReturnShipmentContentField` — but minimal change is favored.

# Files to change

| File | Change |
|------|--------|
| `src/components/OrderDetails/sections/PricingSection.tsx` | Add conditional `returnShipmentContent` editor under `ShippingTypeSelect`; local state; requiresReturnContent check; warning text; save via `onUpdate`. |

No backend change. No type change (`Order` already has the field).

# Must-NOT-Have

- Do NOT modify the add-new-order page (already correct).
- Do NOT modify `UpdateOrderDto` / `CreateOrderDto` (already enforced).
- Do NOT add a new API endpoint.
- Do NOT hard-block the `shippingType` save (user chose warn-but-allow).
- Do NOT touch `EditShippingModal` unless we later decide to; out of scope per decision.

# Verification (agent-executed, frontend)

- `npm run type-check` → passes (no type errors).
- `npm run lint` → passes (no lint errors).
- Manual reasoning checks (no test suite exists):
  - When `order.shippingType === 'EXCHANGE'` and `returnShipmentContent` empty → field visible, required `*`, warning shown.
  - Editing + saving content calls `onUpdate('returnShipmentContent', value)` and persists (PATCH sends `{ returnShipmentContent: value }`).
  - Switching `shippingType` to `DELIVERY` hides the field and clears value.
  - Switching to `EXCHANGE` with empty content and saving `shippingType` → request proceeds; if backend rejects, existing toast shows Arabic message (no crash).

# Acceptance

1. Order-detail `PricingSection` shows `returnShipmentContent` only for EXCHANGE/RETURN/PARTIAL_RETURN.
2. Field displays current value and is editable; required warning shown when empty.
3. Saving persists through existing update path; backend enforcement unchanged.
4. `npm run type-check && npm run lint` clean.

# Todos

- [ ] **PricingSection.tsx**: Add `returnContent` local state initialized from `order.returnShipmentContent ?? ''` — accept `Order` prop already present. Reference: `PricingSectionProps.order` (PricingSection.tsx:19-23). QA: type-check; state initializes to current value.
- [ ] **PricingSection.tsx**: Compute `requiresReturnContent = ['PARTIAL_RETURN','EXCHANGE','RETURN'].includes(order.shippingType)` — mirror add-page ShippingSection.tsx:72. QA: true for EXCHANGE/RETURN/PARTIAL_RETURN, false for DELIVERY/undefined.
- [ ] **PricingSection.tsx**: Render conditional block under `ShippingTypeSelect` (lines 57-62) — labeled "محتوى شحنة الاسترجاع" with `*` when `requiresReturnContent`; textarea/Input + Save button calling `onUpdate('returnShipmentContent', value)`. QA: field visible only for non-DELIVERY types; Save triggers PATCH with `{ returnShipmentContent: value }`.
- [ ] **PricingSection.tsx**: Show warning text "يرجى إدخال محتوى شحنة الاسترجاع" (copy from manual schema.ts:51) when `requiresReturnContent && !returnContent.trim()` — warn-but-allow, do NOT block `shippingType` save. QA: warning appears/disappears with content; `shippingType` change still proceeds.
- [ ] **PricingSection.tsx**: On `shippingType` switching to DELIVERY, hide field and clear value via `onUpdate('returnShipmentContent','')` — parity with add-page ShippingSection.tsx:315-317. QA: field hidden for DELIVERY; stored value cleared.
- [ ] **Verify**: Run `npm run type-check && npm run lint` in `orderaa-web-frontend/` — both pass. No backend change. QA evidence: clean command output.
- [ ] **Change log**: Add entry to `docs/changelog/orders.md` (frontend) noting conditional returnShipmentContent added to order-detail PricingSection. QA: file updated with date + one-line what/why.
