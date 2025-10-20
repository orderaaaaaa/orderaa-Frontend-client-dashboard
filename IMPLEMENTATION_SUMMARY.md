# Orders API Integration Implementation Summary

## Overview
This document describes the implementation of the orders API integration with filtering, pagination, and global search functionality.

## Changes Made

### 1. API Layer (`src/lib/api/order.ts`)
Created a new API module for order-related operations with the following functions:

- **`fetchOrders(params)`**: Fetch orders with optional filtering and pagination
  - Supports: status, search, customerName, phone, governorate, city, productName
  - Returns paginated results

- **`fetchOrderById(id)`**: Fetch a single order by ID

- **`fetchOrdersByStatus(status, params)`**: Fetch orders filtered by status

- **`fetchOrderStats()`**: Get order statistics/counts by status

- **`updateOrderStatus(id, status)`**: Update order status

- **`searchOrders(searchTerm, params)`**: Global order search

### 2. Type Definitions (`src/types/orders.ts`)
Enhanced type definitions to match the database schema:

- **`OrderStatus` enum**: All 12 order statuses from the backend
  - TRIED_TO_REACH_CUSTOMER
  - WAITING_FOR_PAYMENT
  - ON_HOLD
  - CALLED_CUSTOMER_AGAIN
  - CANCELLED
  - CONFIRMED
  - PREPARED
  - SHIPPED
  - RETURNED
  - DELIVERED
  - DOWN_PAYMENT
  - MISSING

- **`Order` interface**: Complete order structure matching DB model
- **`Product` interface**: Product details
- **`OrderProduct` interface**: Join table for orders and products
- **`Customer` interface**: Customer information
- **`Merchant` interface**: Merchant information
- **`PaginatedResponse<T>`**: Generic pagination response
- **`PaginationParams`**: Pagination parameters (page, limit)
- **Updated `OrderFilters`**: Added status and search fields

### 3. Custom Hooks

#### `src/hooks/AllOrders/useOrders.ts`
New hook for fetching orders from the backend:
- **`useOrders(params)`**: Fetches orders with reactive updates based on params
- **`useOrderStats()`**: Fetches order statistics for tab counts
- Handles loading and error states

#### `src/hooks/AllOrders/useFilteredOrders.ts`
Updated to use `OrderDisplay` type for local filtering of dummy data

#### `src/hooks/AllOrders/useFilterState.ts`
Updated default filters to include status and search fields

### 4. Dashboard Layout (`src/app/dashboard/layout.tsx`)
Implemented global search functionality:
- Added `searchValue` state
- Added `handleSearch` function to navigate to orders page with search query
- Updated Input component to handle value changes and Enter key press
- Search navigates to `/dashboard/orders/allOrders?search=<query>`

### 5. Page Tabs Component (`src/app/dashboard/orders/allOrders/pageTaps.tsx`)
Complete refactor to support status filtering:
- Added props: `activeStatus`, `onStatusChange`, `stats`
- Each tab is now clickable with onClick handlers
- Tabs are mapped to OrderStatus enum values
- Active tab styling based on `activeStatus`
- Dynamic counts from backend stats

### 6. All Orders Page (`src/app/dashboard/orders/allOrders/page.tsx`)
Major refactor to integrate backend API:

**New Features:**
- Backend API integration with `useOrders` and `useOrderStats` hooks
- Status filtering via tab clicks
- Global search from URL parameters
- Backend/dummy data toggle (for testing without backend)
- Proper type mapping between backend Order and display OrderDisplay format

**State Management:**
- `activeStatus`: Current status filter (or 'all')
- `currentPage`: Current page for backend pagination
- `useBackend`: Toggle to switch between backend and dummy data
- `filters`: All filter values
- `searchQuery`: From URL parameters

**Data Flow:**
1. Fetch orders from backend based on filters and status
2. Map backend Order objects to OrderDisplay format for rendering
3. Apply local filtering for dummy data mode
4. Paginate results (backend or local)
5. Render OrderCard components

### 7. Input Component (`src/components/ui/Input.tsx`)
Enhanced to support controlled inputs:
- Added `value`, `onChange`, and `onKeyDown` props
- Proper TypeScript types for event handlers

## Usage

### Global Search
1. User types in search box in dashboard header
2. Press Enter to search
3. Navigates to all orders page with search query
4. Orders are fetched from backend with search filter

### Status Filtering
1. User clicks on a status tab (e.g., "في الشحن")
2. `handleStatusChange` is called with the OrderStatus
3. Backend is queried for orders with that status
4. Results are displayed with pagination

### Pagination
1. Backend returns paginated results (6 items per page)
2. Footer component shows page controls
3. Clicking next/previous or page numbers fetches new data from backend

### Filter Section
The FilterSection component remains unchanged as per requirements, but is integrated with the new filter state management.

## Backend Requirements

The backend API must implement the following endpoints:

### GET `/orders`
Query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 6)
- `status` (OrderStatus): Filter by status
- `search` (string): Global search term
- `customerName` (string): Filter by customer name
- `phone` (string): Filter by phone
- `governorate` (string): Filter by governorate
- `city` (string): Filter by city
- `productName` (string): Filter by product name

Response:
```json
{
  "data": [/* Order objects */],
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 100,
    "totalPages": 17
  }
}
```

### GET `/orders/:id`
Returns a single Order object with related data (customer, merchant, orderProducts)

### GET `/orders/stats`
Returns order counts by status:
```json
{
  "TRIED_TO_REACH_CUSTOMER": 10,
  "WAITING_FOR_PAYMENT": 5,
  "ON_HOLD": 2,
  // ... all statuses
}
```

### PATCH `/orders/:id/status`
Body: `{ "status": "DELIVERED" }`
Returns updated Order object

## Testing

The implementation includes a `useBackend` toggle in the allOrders page that allows testing with dummy data when the backend is not available. Set to `true` to use backend, `false` to use dummy data.

## Future Enhancements

1. Add error handling UI (retry buttons, error messages)
2. Add loading skeletons for better UX
3. Implement optimistic updates for status changes
4. Add real-time updates with WebSockets
5. Implement bulk operations (select multiple orders)
6. Add export functionality
7. Add advanced filtering UI
