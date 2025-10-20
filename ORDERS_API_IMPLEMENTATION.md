# Orders API Integration Implementation

This document describes the implementation of the orders API integration, search functionality, and status filtering.

## Overview

The implementation includes:
1. **Order Types and Interfaces** - Complete TypeScript definitions matching the backend DB schema
2. **API Functions** - Functions to fetch orders with filtering and pagination
3. **Global Search** - Search functionality in the dashboard header using Zustand store
4. **Status Filtering** - Clickable status filter tabs with active states
5. **Real Data Integration** - Replaced dummy data with API calls
6. **Pagination** - Client-side pagination for filtered orders

## Files Modified/Created

### Created Files:
- `src/lib/api/order.ts` - Order API functions
- `src/store/ordersStore.ts` - Zustand store for global search and filter state
- `src/types/orders.ts` - Complete type definitions (updated)

### Modified Files:
- `src/app/dashboard/layout.tsx` - Added search input integration
- `src/app/dashboard/orders/allOrders/page.tsx` - Integrated API calls and loading states
- `src/app/dashboard/orders/allOrders/pageTaps.tsx` - Added onClick handlers and active states
- `src/components/ui/PageTab.tsx` - Added onClick prop support
- `src/hooks/AllOrders/useFilteredOrders.ts` - Updated to work with new Order type

## Implementation Details

### 1. Types and Interfaces (`src/types/orders.ts`)

Added comprehensive types matching the backend Prisma schema:

```typescript
// Order Status Enum
export enum OrderStatus {
  TRIED_TO_REACH_CUSTOMER = 'TRIED_TO_REACH_CUSTOMER',
  WAITING_FOR_PAYMENT = 'WAITING_FOR_PAYMENT',
  ON_HOLD = 'ON_HOLD',
  CALLED_CUSTOMER_AGAIN = 'CALLED_CUSTOMER_AGAIN',
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED',
  PREPARED = 'PREPARED',
  SHIPPED = 'SHIPPED',
  RETURNED = 'RETURNED',
  DELIVERED = 'DELIVERED',
  DOWN_PAYMENT = 'DOWN_PAYMENT',
  MISSING = 'MISSING',
}

// Order, Customer, Product, OrderProduct interfaces
// FilterOrdersDto matching backend
// PaginatedResponse for API responses
```

### 2. API Functions (`src/lib/api/order.ts`)

Two main functions that interact with the backend:

```typescript
// Fetch orders with optional filters
getOrders(filters?: FilterOrdersDto): Promise<PaginatedResponse<Order>>

// Fetch single order by ID
getOrderById(id: number): Promise<Order>
```

**Backend Endpoints Used:**
- `GET /orders/all-orders` - Get filtered orders with pagination
- `GET /orders/:id` - Get specific order details

### 3. Global State Management (`src/store/ordersStore.ts`)

Created a Zustand store to manage:
- Search query (from header input)
- Selected status filter (from tabs)

```typescript
interface OrdersStore {
  searchQuery: string;
  selectedStatus: OrderStatus | null;
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: OrderStatus | null) => void;
  clearFilters: () => void;
}
```

### 4. Search Integration (Dashboard Header)

In `src/app/dashboard/layout.tsx`:
- Connected Input component to zustand store
- Search query updates trigger re-fetch of orders in the orders page

### 5. Status Filter Tabs (`src/app/dashboard/orders/allOrders/pageTaps.tsx`)

Features:
- Each tab represents an OrderStatus
- Shows count of orders per status
- Active state highlighting
- onClick handlers to filter by status
- "All Orders" tab to clear status filter

### 6. Main Orders Page (`src/app/dashboard/orders/allOrders/page.tsx`)

Key features:
- Fetches orders using `getOrders()` API
- Watches for search query and status changes (useEffect)
- Shows loading spinner during fetch
- Shows error message if fetch fails
- Calculates status counts for tabs
- Applies client-side filtering via `useFilteredOrders` hook
- Client-side pagination via `usePagination` hook

### 7. Updated Filtering Hook (`src/hooks/AllOrders/useFilteredOrders.ts`)

Updated to work with the new Order type structure:
- Filters by customer name, phone, governorate, area
- Filters by product name, size/color
- Filters by shipment code (order.code)
- Filters by address

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Replace with your actual backend URL.

### 2. Backend Requirements

The backend must implement these endpoints:

**GET /orders/all-orders**
- Query Parameters:
  - `status` (optional): OrderStatus enum value
  - `search` (optional): string to search across orders
  - `page` (optional): page number
  - `limit` (optional): items per page

- Response Format:
```typescript
{
  data: Order[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

**GET /orders/:id**
- Response: Single Order object with nested customer and orderProducts

### 3. Order Data Structure

Each Order should include:
```typescript
{
  id: number,
  code: string,
  status: OrderStatus,
  totalCost: number,
  numberOfTriesToReach: number,
  notes?: string,
  customer: {
    id: number,
    name: string,
    phone: string,
    address?: string,
    governorate?: string,
    area?: string
  },
  orderProducts: [{
    product: {
      name: string,
      size?: string,
      color?: string,
      // ... other product fields
    },
    quantity: number,
    price: number
  }]
}
```

## Usage Flow

1. **User enters search query in header** → Updates zustand store → Triggers API call with search param
2. **User clicks status tab** → Updates zustand store → Triggers API call with status param
3. **API returns filtered data** → Displayed in OrderCard components
4. **User applies FilterSection filters** → Client-side filtering on fetched data
5. **Pagination** → Client-side pagination on filtered results

## Status Mappings

The following status tabs are implemented:

| Arabic Label | OrderStatus Enum |
|--------------|------------------|
| طلبات جديده | TRIED_TO_REACH_CUSTOMER |
| في انتظار الدفع | WAITING_FOR_PAYMENT |
| تأجيلات | ON_HOLD |
| اعادة اتصال | CALLED_CUSTOMER_AGAIN |
| تم الغاء | CANCELLED |
| تم التأكيد | CONFIRMED |
| تم التحضير | PREPARED |
| في الشحن | SHIPPED |
| مرتجع | RETURNED |
| تم التسليم | DELIVERED |
| دفعة مقدمة | DOWN_PAYMENT |
| طلبات مفقوده | MISSING |

## Testing

To test the implementation:

1. Ensure backend is running and accessible
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Run `npm run dev`
4. Navigate to `/dashboard/orders/allOrders`
5. Test:
   - Search functionality from header
   - Status filter tabs
   - Pagination controls
   - FilterSection filters

## Notes

- The FilterSection component was not modified as per requirements
- Client-side filtering is applied ON TOP of server-filtered results
- Pagination is currently client-side but can be changed to server-side by modifying the page.tsx to pass page/limit to getOrders()
- Loading states and error handling are implemented
- All statuses from the DB schema are supported

## Future Enhancements

Potential improvements:
1. Server-side pagination (pass page/limit to API)
2. Debouncing on search input
3. URL query params to persist filters
4. Export filtered orders
5. Bulk actions on selected orders
