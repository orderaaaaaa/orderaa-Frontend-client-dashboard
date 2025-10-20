# Orders API Integration - Data Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Dashboard Header (layout.tsx)                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Search Input: "ابحث هنا..."                        │  │  │
│  │  └────────────────┬───────────────────────────────────┘  │  │
│  │                   │ onChange → setSearchQuery()          │  │
│  └───────────────────┼──────────────────────────────────────┘  │
│                      │                                          │
│  ┌───────────────────▼──────────────────────────────────────┐  │
│  │  Zustand Store (ordersStore.ts)                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  searchQuery: string                               │  │  │
│  │  │  selectedStatus: OrderStatus | null                │  │  │
│  │  │  setSearchQuery(query)                             │  │  │
│  │  │  setSelectedStatus(status)                         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └───────────────────┬──────────────────────────────────────┘  │
│                      │ triggers useEffect                       │
│  ┌───────────────────▼──────────────────────────────────────┐  │
│  │  All Orders Page (page.tsx)                              │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Status Filter Tabs (pageTaps.tsx)                 │  │  │
│  │  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                   │  │  │
│  │  │  │جميع│ │جديد│ │دفع│ │تأج│ │...│ │مفق│                   │  │  │
│  │  │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                   │  │  │
│  │  │       onClick → setSelectedStatus()                │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  useEffect([searchQuery, selectedStatus])          │  │  │
│  │  │     ↓                                               │  │  │
│  │  │  fetchOrders()                                      │  │  │
│  │  └────────────────┬───────────────────────────────────┘  │  │
│  └───────────────────┼──────────────────────────────────────┘  │
└────────────────────┼─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                     API LAYER                                 │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  API Functions (lib/api/order.ts)                        ││
│  │  ┌────────────────────────────────────────────────────┐  ││
│  │  │  getOrders(filters?)                               │  ││
│  │  │    → GET /orders/all-orders                        │  ││
│  │  │    → params: { status, search, page, limit }       │  ││
│  │  │                                                     │  ││
│  │  │  getOrderById(id)                                  │  ││
│  │  │    → GET /orders/:id                               │  ││
│  │  └────────────────────────────────────────────────────┘  ││
│  │                                                           ││
│  │  ┌────────────────────────────────────────────────────┐  ││
│  │  │  Axios Instance (lib/api/index.ts)                 │  ││
│  │  │    baseURL: process.env.NEXT_PUBLIC_API_URL        │  ││
│  │  │    withCredentials: true                           │  ││
│  │  │    Authorization: Bearer token                     │  ││
│  │  └────────────────────────────────────────────────────┘  ││
│  └──────────────────────┬────────────────────────────────────┘│
└─────────────────────────┼─────────────────────────────────────┘
                          │ HTTP Request
┌─────────────────────────▼─────────────────────────────────────┐
│                    BACKEND API                                 │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  NestJS Controllers (OrdersController)                   ││
│  │  ┌────────────────────────────────────────────────────┐  ││
│  │  │  @Get('/all-orders')                               │  ││
│  │  │  getOrders(@Query() query: FilterOrdersDto)        │  ││
│  │  │    → OrdersService.getOrders(query)                │  ││
│  │  │                                                     │  ││
│  │  │  @Get('/:id')                                      │  ││
│  │  │  getOrderById(@Param('id') id: number)             │  ││
│  │  │    → OrdersService.getOrderById(id)                │  ││
│  │  └────────────────────────────────────────────────────┘  ││
│  │                                                           ││
│  │  ┌────────────────────────────────────────────────────┐  ││
│  │  │  OrdersService                                     │  ││
│  │  │    → Queries Prisma Database                       │  ││
│  │  │    → Returns PaginatedResponse<Order>              │  ││
│  │  └────────────────────────────────────────────────────┘  ││
│  └──────────────────────┬────────────────────────────────────┘│
└─────────────────────────┼─────────────────────────────────────┘
                          │ DB Query
┌─────────────────────────▼─────────────────────────────────────┐
│                      DATABASE                                  │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Prisma Database (PostgreSQL/MySQL/etc.)                 ││
│  │  ┌────────────────────────────────────────────────────┐  ││
│  │  │  Order Table                                       │  ││
│  │  │    - id, code, status, totalCost, ...              │  ││
│  │  │                                                     │  ││
│  │  │  Customer Table                                    │  ││
│  │  │    - id, name, phone, governorate, area, ...       │  ││
│  │  │                                                     │  ││
│  │  │  Product Table                                     │  ││
│  │  │    - id, name, size, color, material, ...          │  ││
│  │  │                                                     │  ││
│  │  │  OrderProduct Table (Join)                         │  ││
│  │  │    - orderId, productId, quantity, price           │  ││
│  │  └────────────────────────────────────────────────────┘  ││
│  └──────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

### 1. User Searches for Orders

```
User Types "أحمد" in Search Box
    ↓
Input onChange Event
    ↓
setSearchQuery("أحمد")
    ↓
Zustand Store Updates: searchQuery = "أحمد"
    ↓
useEffect Detects Change
    ↓
Calls: getOrders({ search: "أحمد" })
    ↓
Axios: GET /orders/all-orders?search=أحمد
    ↓
Backend Filters Orders WHERE customer.name LIKE "%أحمد%"
    ↓
Returns: { data: [...], total: 5, page: 1, ... }
    ↓
State Updates: setOrders([...])
    ↓
Component Re-renders
    ↓
OrderCards Display Filtered Results
```

### 2. User Clicks Status Filter

```
User Clicks "طلبات جديده" Tab
    ↓
onClick Event
    ↓
setSelectedStatus(OrderStatus.TRIED_TO_REACH_CUSTOMER)
    ↓
Zustand Store Updates: selectedStatus = "TRIED_TO_REACH_CUSTOMER"
    ↓
Tab UI Updates (Active State)
    ↓
useEffect Detects Change
    ↓
Calls: getOrders({ status: "TRIED_TO_REACH_CUSTOMER" })
    ↓
Axios: GET /orders/all-orders?status=TRIED_TO_REACH_CUSTOMER
    ↓
Backend Filters: WHERE status = "TRIED_TO_REACH_CUSTOMER"
    ↓
Returns: { data: [...], total: 10, page: 1, ... }
    ↓
State Updates: setOrders([...])
    ↓
Status Counts Calculated
    ↓
Component Re-renders
    ↓
OrderCards Display New Orders Only
    ↓
Tab Shows Count Badge (10)
```

### 3. Combined Search + Status Filter

```
User Searches "أحمد" AND Clicks "CONFIRMED" Status
    ↓
Both searchQuery and selectedStatus in Store
    ↓
useEffect Detects Both Values
    ↓
Calls: getOrders({ 
  search: "أحمد",
  status: "CONFIRMED"
})
    ↓
Axios: GET /orders/all-orders?search=أحمد&status=CONFIRMED
    ↓
Backend Applies Both Filters:
  WHERE customer.name LIKE "%أحمد%"
  AND status = "CONFIRMED"
    ↓
Returns Filtered Results
    ↓
Display Orders for "أحمد" That Are "CONFIRMED"
```

## Type Safety Flow

```
TypeScript Types Ensure Safety:

User Input → Zustand Store (OrderStatus | null)
    ↓
API Call → FilterOrdersDto { status?: OrderStatus, search?: string }
    ↓
Backend Response → PaginatedResponse<Order>
    ↓
Order Interface → {
  id: number,
  customer: Customer,
  orderProducts: OrderProduct[],
  status: OrderStatus,
  ...
}
    ↓
OrderCard Props → Mapped from Order interface
    ↓
UI Rendering → Type-safe display
```

## State Management

```
┌─────────────────────────────────────┐
│  Zustand Store (Global)             │
│  - searchQuery                      │
│  - selectedStatus                   │
├─────────────────────────────────────┤
│  Used By:                           │
│  - Dashboard Header (search input)  │
│  - PageTaps (status tabs)           │
│  - AllOrders Page (data fetching)   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Component State (Local)            │
│  - orders: Order[]                  │
│  - loading: boolean                 │
│  - error: string | null             │
│  - filters: OrderFilters            │
│  - statusCounts: Record<...>        │
├─────────────────────────────────────┤
│  Managed By:                        │
│  - AllOrders Page component         │
│  - Updates on API response          │
└─────────────────────────────────────┘
```

## Performance Considerations

### Current Implementation:
- ✅ API call on search/filter change
- ✅ Client-side filtering with FilterSection
- ✅ Client-side pagination
- ✅ Fetches large dataset (limit: 1000)

### Optimization Opportunities:
- 🔄 Implement search debouncing (300ms)
- 🔄 Server-side pagination (pass page/limit to API)
- 🔄 Infinite scroll instead of pagination
- 🔄 Cache API responses
- 🔄 Implement virtual scrolling for large lists

## Error Handling Flow

```
API Call Initiated
    ↓
Try Block
    ↓
    Success?
    ├─ YES → Update orders state
    │        Show data
    │
    └─ NO → Catch Error
            ↓
            setError("فشل في تحميل الطلبات")
            ↓
            Show Error Message UI
            ↓
            Console.error for debugging
```

## Loading States

```
fetchOrders() Called
    ↓
setLoading(true)
    ↓
Show Loading Spinner
    ↓
API Call
    ↓
Response Received
    ↓
setLoading(false)
    ↓
Show Data or Error
```

---

This diagram illustrates the complete data flow from user interaction to database and back!
