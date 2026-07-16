# Draft: returnShipmentContent on order-detail update

- intent: CLEAR (outcome known; only surface/placement + strictness forks, both answered by user)
- review_required: false
- decisions:
  - Add-new-order page: already implements returnShipmentContent conditionally + required. NO change.
  - Backend UpdateOrderDto: already supports + validates returnShipmentContent when shippingType != DELIVERY. NO change.
  - Order-detail page: ADD the field inline in PricingSection, under ShippingTypeSelect.
  - Behavior: field visible only when shippingType ∈ {EXCHANGE, RETURN, PARTIAL_RETURN}. Marked required (*) with a warning when empty. User chose "Warn but allow" — do NOT hard-block the inline save; rely on backend 400 (useOrderFieldUpdate already toasts the error). Current value shown when present.
- approval gate: status awaiting-approval, pending write of .omo/plans/return-shipment-content-order-update.md
- ledgers:
  - frontend files: src/components/OrderDetails/sections/PricingSection.tsx (edit), optionally a small field component or reuse EditableTextField; src/types/orders.ts already has returnShipmentContent (no change).
  - backend: none
