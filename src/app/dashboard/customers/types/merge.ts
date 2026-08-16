/**
 * Types for T4 — merging duplicate customers.
 *
 * `MergeableCustomer` is the shape the merge popup renders for one side of
 * the comparison. It doubles as the shape of the 409 conflict payload's
 * `conflict.customer` (`PhoneConflictCustomerDto` on the backend,
 * `src/customers/dto/customer-response.dto.ts`) — both carry exactly the
 * fields the popup shows: name, email, phone numbers, orders count, blocked
 * state and notes.
 */
export interface MergeableCustomer {
  id: number;
  name: string;
  email?: string;
  phoneNumbers: string[];
  notes: string[];
  isBlocked: boolean;
  blockedUntil: string | null;
  ordersCount: number;
}

/** Body of the 409 thrown by `PATCH /customers/:id` on a duplicate phone. */
export interface PhoneConflictDetails {
  /** The normalised phone number that clashed. */
  phoneNumber: string;
  customer: MergeableCustomer;
}

/** Full 409 response body — `message` is kept only for the no-permission fallback toast. */
export interface PhoneConflictErrorBody {
  message: string;
  code: 'PHONE_NUMBER_ALREADY_EXISTS';
  conflict: PhoneConflictDetails;
}

/** `POST /customers/:customerId/merge` request body. */
export interface MergeCustomersPayload {
  /** IDs of the duplicate customers to merge into the target (they get deleted). */
  sourceCustomerId: number[];
  name?: string;
  email?: string;
  /** Explicit — the user's choice in the popup, never computed automatically. */
  isBlocked?: boolean;
  blockedUntil?: string | null;
  phoneNumbers?: string[];
}
