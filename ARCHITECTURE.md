# Orders API Integration - Architecture Overview

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Dashboard Layout                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Global Search Input                                        │ │
│  │  - Captures search term                                     │ │
│  │  - Navigates to /orders/allOrders?search=<term>            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    All Orders Page                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  PageTaps (Status Filter Buttons)                          │ │
│  │  - 13 status tabs with counts                              │ │
│  │  - onClick handlers for each status                        │ │
│  │  - Active state highlighting                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  FilterSection (Advanced Filters)                          │ │
│  │  - Product, Size/Color, Location filters                   │ │
│  │  - Left as-is per requirements                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Order Grid (OrderCard components)                         │ │
│  │  - Displays orders in cards                                │ │
│  │  - Uses backend data when available                        │ │
│  │  - Falls back to dummy data                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Footer (Pagination Controls)                              │ │
│  │  - Page numbers, next/prev buttons                         │ │
│  │  - Shows total count                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────┐
│  User Action │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Event Handler                          │
│  - handleSearch()                       │
│  - handleStatusChange()                 │
│  - handlePageChange()                   │
│  - handleFilterChange()                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  State Update                           │
│  - setSearchValue()                     │
│  - setActiveStatus()                    │
│  - setCurrentPage()                     │
│  - setFilters()                         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  useOrders Hook                         │
│  - Watches state changes                │
│  - Triggers API call                    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  API Layer (order.ts)                   │
│  - fetchOrders(params)                  │
│  - Builds query string                  │
│  - Makes HTTP request                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend API                            │
│  GET /orders?status=X&page=Y&limit=Z   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Response Processing                    │
│  - Type validation                      │
│  - Map Order to OrderDisplay            │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Component Re-render                    │
│  - Update OrderCards                    │
│  - Update pagination                    │
│  - Update counts                        │
└─────────────────────────────────────────┘
```

## Type System

```
Backend DB Model (Prisma)
         │
         ▼
┌─────────────────────────────────────────┐
│  Order (Backend Type)                   │
│  - id, code, status                     │
│  - totalCost, numberOfTriesToReach      │
│  - customer: Customer                   │
│  - merchant: Merchant                   │
│  - orderProducts: OrderProduct[]        │
└──────┬──────────────────────────────────┘
       │
       │ mapOrderToCard()
       ▼
┌─────────────────────────────────────────┐
│  OrderDisplay (Frontend Type)           │
│  - id, name, phone                      │
│  - government, city                     │
│  - items: string[]                      │
│  - price, trys, status                  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  OrderCard Component                    │
│  - Renders order information            │
│  - Shows customer details               │
│  - Displays products                    │
└─────────────────────────────────────────┘
```

## API Endpoints

```
┌────────────────────────────────────────────────────────────┐
│  GET /orders                                               │
│  ──────────────────────────────────────────────────────── │
│  Query Params:                                             │
│    - page: number                                          │
│    - limit: number                                         │
│    - status: OrderStatus                                   │
│    - search: string                                        │
│    - customerName: string                                  │
│    - phone: string                                         │
│    - governorate: string                                   │
│    - city: string                                          │
│    - productName: string                                   │
│                                                            │
│  Response:                                                 │
│    {                                                       │
│      data: Order[],                                        │
│      pagination: {                                         │
│        page, limit, total, totalPages                      │
│      }                                                     │
│    }                                                       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  GET /orders/stats                                         │
│  ──────────────────────────────────────────────────────── │
│  Response:                                                 │
│    {                                                       │
│      "TRIED_TO_REACH_CUSTOMER": 10,                       │
│      "WAITING_FOR_PAYMENT": 5,                            │
│      "ON_HOLD": 2,                                        │
│      ...                                                   │
│    }                                                       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  GET /orders/:id                                           │
│  ──────────────────────────────────────────────────────── │
│  Response: Single Order object with relations              │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  PATCH /orders/:id/status                                  │
│  ──────────────────────────────────────────────────────── │
│  Body: { status: OrderStatus }                             │
│  Response: Updated Order object                            │
└────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Component State                                            │
│  ┌────────────┬────────────────┬────────────────────────┐  │
│  │ filters    │ activeStatus   │ currentPage            │  │
│  │ (Object)   │ (OrderStatus   │ (number)               │  │
│  │            │  | 'all')      │                        │  │
│  └────────────┴────────────────┴────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  useOrders Hook                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  useEffect(() => {                                    │ │
│  │    fetchOrders({ ...filters, status, page })         │ │
│  │  }, [filters, status, page])                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  API Response                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  {                                                    │ │
│  │    orders: [...],                                    │ │
│  │    pagination: { page, limit, total, totalPages }   │ │
│  │  }                                                    │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Component Re-render                                        │
│  - Map orders to OrderDisplay                               │
│  - Render OrderCard components                              │
│  - Update pagination controls                               │
└─────────────────────────────────────────────────────────────┘
```

## Features Implemented

### ✅ Order Status Enum (12 statuses)
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

### ✅ Status Filter Buttons
- 13 clickable tabs (12 statuses + "All")
- Visual feedback for active status
- Dynamic counts from backend stats
- onClick handlers integrated

### ✅ Global Search
- Search from dashboard header
- Auto-navigates to orders page
- Filters orders by search term
- Works across all fields

### ✅ Backend Integration
- Complete API layer with TypeScript
- Custom React hooks for data fetching
- Automatic data refresh on filter changes
- Error handling and loading states

### ✅ Pagination
- Server-side pagination (6 items per page)
- Page navigation controls
- Total count display
- Next/Previous buttons

### ✅ Type Safety
- Full TypeScript coverage
- Type mapping between backend and frontend
- Proper interfaces for all data structures
- No `any` types used

## Files Changed/Created

### Created:
1. `src/lib/api/order.ts` - Orders API functions
2. `src/hooks/AllOrders/useOrders.ts` - Custom hooks for orders
3. `IMPLEMENTATION_SUMMARY.md` - Technical documentation
4. `ORDERS_API_GUIDE.md` - Developer guide
5. `ARCHITECTURE.md` - This file

### Modified:
1. `src/types/orders.ts` - Enhanced with full Order types
2. `src/app/dashboard/layout.tsx` - Added global search
3. `src/app/dashboard/orders/allOrders/page.tsx` - Backend integration
4. `src/app/dashboard/orders/allOrders/pageTaps.tsx` - Status filtering
5. `src/hooks/AllOrders/useFilteredOrders.ts` - Updated types
6. `src/hooks/AllOrders/useFilterState.ts` - Added status/search fields
7. `src/components/ui/Input.tsx` - Added controlled input support
