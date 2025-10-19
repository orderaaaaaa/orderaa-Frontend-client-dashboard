# Orders Pages Features Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                     (Next.js 14 App)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ALL ORDERS PAGE                               │
│                (/dashboard/orders/allOrders)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  STATUS TABS (Interactive Filters)                  │        │
│  │  [All] [New] [Attempted] [Shipping] ... (15+ tabs) │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  SEARCH BAR                     │  SORT DROPDOWN   │        │
│  │  [🔍 Search orders...]          │  [▼ Newest First] │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  FILTER PANEL                                       │        │
│  │  [Shipment] [Customer] [Phone] [Date] ...          │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌───────────┬───────────┬───────────┐                         │
│  │  Order 1  │  Order 2  │  Order 3  │  ← ORDER CARDS          │
│  │  Click    │  Click    │  Click    │                         │
│  └───────────┴───────────┴───────────┘                         │
│  ┌───────────┬───────────┬───────────┐                         │
│  │  Order 4  │  Order 5  │  Order 6  │                         │
│  └───────────┴───────────┴───────────┘                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  PAGINATION                                         │        │
│  │  [◄ Prev]  [1] [2] [3] ... [10]  [Next ►]         │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Click Order Card
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ORDER DETAILS PAGE                             │
│               (/dashboard/orders/[orderId])                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  ORDER HEADER                                       │        │
│  │  Order #12345  |  Shipment: ABC123                 │        │
│  │  Created: 2024-10-19  |  2 days ago                │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  STATUS                                             │        │
│  │  ● New Order  |  Delivery Attempts: 2              │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌───────────┬───────────┬───────────┬───────────┐             │
│  │ Product 1 │ Product 2 │ Product 3 │ Product 4 │ ← PRODUCTS  │
│  │ Size: 42  │ Size: 43  │ Size: 44  │ Size: 45  │             │
│  │ Color: XX │ Color: YY │ Color: ZZ │ Color: AA │             │
│  │ 100 EGP   │ 150 EGP   │ 200 EGP   │ 180 EGP   │             │
│  └───────────┴───────────┴───────────┴───────────┘             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  CUSTOMER INFO                                      │        │
│  │  Name: محمد أحمد                                   │        │
│  │  Phone: 01012345678  |  Alt: 01098765432          │        │
│  │  Location: القاهرة - مدينة نصر                    │        │
│  │  Address: شارع مكرم عبيد، عمارة 10                │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  ORDER NOTES                                        │        │
│  │  الرجاء التسليم صباحاً                             │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  [متابعة]  [تأكيد]                                 │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────┐      API Request       ┌─────────────┐
│             │ ──────────────────────> │             │
│   FRONTEND  │                         │   BACKEND   │
│   (React)   │ <────────────────────── │  (NestJS)   │
│             │      JSON Response      │             │
└─────────────┘                         └─────────────┘
      │                                        │
      │                                        │
      ▼                                        ▼
┌─────────────┐                         ┌─────────────┐
│  useOrders  │                         │   Orders    │
│    Hook     │                         │  Service    │
└─────────────┘                         └─────────────┘
      │                                        │
      ▼                                        ▼
┌─────────────┐                         ┌─────────────┐
│   Orders    │                         │  Database   │
│   State     │                         │             │
└─────────────┘                         └─────────────┘
```

## Feature Checklist

### All Orders Page ✅
- [x] Status filtering via tabs
- [x] Global search
- [x] Field-based filters
- [x] Sorting options
- [x] Server-side pagination
- [x] Loading states
- [x] Error handling
- [x] Empty states
- [x] Click to view details

### Order Details Page ✅
- [x] Order information
- [x] Customer details
- [x] Product cards
- [x] Location data
- [x] Notes display
- [x] Loading states
- [x] Error handling
- [x] Not found state

### API Integration ✅
- [x] GET /orders/all-orders
- [x] GET /orders/:id
- [x] Query parameters
- [x] Response handling
- [x] Error handling

### Code Quality ✅
- [x] TypeScript types
- [x] Custom hooks
- [x] Reusable components
- [x] Clean architecture
- [x] Documentation

## Technology Stack

```
┌─────────────────────────────────────────┐
│  Frontend Framework                     │
│  ├─ Next.js 14 (App Router)            │
│  ├─ React 18                            │
│  └─ TypeScript                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  State Management                       │
│  ├─ React Hooks (useState, useEffect)  │
│  ├─ Custom Hooks (useOrders, etc.)     │
│  └─ useMemo for optimization            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  HTTP Client                            │
│  ├─ Axios                               │
│  ├─ Interceptors                        │
│  └─ Error handling                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  UI Libraries                           │
│  ├─ Tailwind CSS                        │
│  ├─ Lucide Icons                        │
│  └─ Radix UI Components                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Utilities                              │
│  ├─ date-fns (date formatting)         │
│  └─ clsx (class names)                  │
└─────────────────────────────────────────┘
```

## API Flow Example

### Fetching Orders with Filters

```
User Action: Click "New Orders" tab + Enter search "Ahmed"
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  Component State Update                              │
│  - statusFilter = "new"                              │
│  - searchQuery = "Ahmed"                             │
│  - currentPage = 1                                   │
└──────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  useMemo: Build API Filters                         │
│  {                                                   │
│    page: 1,                                          │
│    limit: 6,                                         │
│    status: "new",                                    │
│    search: "Ahmed"                                   │
│  }                                                   │
└──────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  useOrders Hook                                      │
│  - loading = true                                    │
│  - Calls getOrders(filters)                         │
└──────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  API Request                                         │
│  GET /orders/all-orders?page=1&limit=6              │
│      &status=new&search=Ahmed                        │
└──────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  Backend Processing                                  │
│  - Validate query params                            │
│  - Apply filters to database query                  │
│  - Execute query                                     │
│  - Format response                                   │
└──────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  API Response                                        │
│  {                                                   │
│    data: [ {...}, {...} ],                          │
│    meta: {                                           │
│      currentPage: 1,                                 │
│      totalPages: 5,                                  │
│      totalItems: 28,                                 │
│      hasNextPage: true                               │
│    }                                                 │
│  }                                                   │
└──────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  useOrders Hook                                      │
│  - loading = false                                   │
│  - orders = response.data                            │
│  - meta = response.meta                              │
└──────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  Component Re-render                                 │
│  - Display order cards                               │
│  - Show pagination                                   │
│  - Update total count                                │
└──────────────────────────────────────────────────────┘
```

## Summary

✅ **Full Stack Integration**: Frontend connected to backend
✅ **Rich Features**: Filtering, search, sort, pagination
✅ **Type Safety**: Complete TypeScript coverage
✅ **User Experience**: Loading states, error handling
✅ **Code Quality**: Clean architecture, reusable components
✅ **Documentation**: Comprehensive guides

**Status: PRODUCTION READY** 🚀
