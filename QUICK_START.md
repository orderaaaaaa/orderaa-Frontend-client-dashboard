# Quick Start Guide - Orders API Integration

## 🚀 What Was Implemented

This PR adds complete backend API integration for orders with filtering, searching, and pagination.

## ✨ New Features

### 1. Global Search (Dashboard Header)
```
Type search term → Press Enter → View filtered orders
```
- Works from any page in the dashboard
- Automatically navigates to orders page with results
- Searches across customer name, phone, order code, etc.

### 2. Status Filter Tabs (13 Tabs)
```
Click any status tab → Orders filtered by that status
```
All 12 order statuses are now clickable tabs:
- جميع الطلبات (All)
- تم المحاولة (Tried to Reach)
- في انتظار الدفع (Waiting for Payment)
- وقوف التشغيل (On Hold)
- اعادة اتصال (Called Again)
- تم الغاء (Cancelled)
- طلبات جديده (Confirmed)
- تم التحضير (Prepared)
- في الشحن (Shipped)
- مرتجع مسلم (Returned)
- تم التحصيل (Delivered)
- تأجيلات (Down Payment)
- طلبات مفقوده (Missing)

Each tab shows real-time counts from the backend.

### 3. Backend API Integration
```
Orders now fetch from backend API instead of using dummy data
```
- Automatic data fetching with filters
- Loading states while fetching
- Error handling with user-friendly messages
- Smart fallback to dummy data if backend unavailable

### 4. Pagination
```
6 orders per page with next/prev controls
```
- Server-side pagination for performance
- Shows total count and page numbers
- Configurable items per page

## 📋 Setup Instructions

### 1. Environment Configuration

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Replace with your actual backend API URL.

### 2. Backend Requirements

Your backend must implement these endpoints:

#### GET `/orders`
Fetch orders with optional filters:
```
GET /orders?page=1&limit=6&status=SHIPPED&search=ahmed
```

Response format:
```json
{
  "data": [
    {
      "id": 1,
      "code": "ORD-001",
      "status": "SHIPPED",
      "totalCost": 5000,
      "numberOfTriesToReach": 2,
      "customer": {
        "id": 1,
        "name": "Ahmed Mohamed",
        "phone": "01234567890",
        "governorate": "Cairo",
        "city": "Nasr City"
      },
      "orderProducts": [
        {
          "product": {
            "id": 1,
            "name": "Nike Shoes",
            "size": "42",
            "color": "Black"
          },
          "quantity": 1
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 100,
    "totalPages": 17
  }
}
```

#### GET `/orders/stats`
Get order counts by status:
```json
{
  "TRIED_TO_REACH_CUSTOMER": 10,
  "WAITING_FOR_PAYMENT": 5,
  "ON_HOLD": 2,
  "CALLED_CUSTOMER_AGAIN": 3,
  "CANCELLED": 15,
  "CONFIRMED": 20,
  "PREPARED": 8,
  "SHIPPED": 12,
  "RETURNED": 4,
  "DELIVERED": 50,
  "DOWN_PAYMENT": 6,
  "MISSING": 1
}
```

#### GET `/orders/:id`
Get single order with all relations

#### PATCH `/orders/:id/status`
Update order status:
```json
{
  "status": "DELIVERED"
}
```

### 3. Testing Without Backend

The app can run without a backend using dummy data:

1. Don't set `NEXT_PUBLIC_API_URL` or set it to a non-existent URL
2. Orders page will automatically use dummy data
3. All features work except real data fetching

To force backend mode, edit `src/app/dashboard/orders/allOrders/page.tsx`:
```typescript
const [useBackend, setUseBackend] = useState(true); // Change to true
```

## 🎯 Usage Examples

### For Frontend Developers

#### Using the Orders Hook
```typescript
import { useOrders, useOrderStats } from '@/hooks/AllOrders/useOrders';
import { OrderStatus } from '@/types/orders';

function MyComponent() {
  // Fetch orders
  const { orders, pagination, loading, error } = useOrders({
    page: 1,
    limit: 10,
    status: OrderStatus.SHIPPED,
    search: 'ahmed',
  });

  // Get statistics
  const { stats } = useOrderStats();

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <p>Total: {pagination.total}</p>
      <p>Shipped: {stats?.SHIPPED}</p>
      {orders.map(order => (
        <div key={order.id}>{order.code}</div>
      ))}
    </div>
  );
}
```

#### Direct API Calls
```typescript
import { fetchOrders, fetchOrderStats } from '@/lib/api/order';

async function loadData() {
  // Fetch with filters
  const response = await fetchOrders({
    page: 1,
    limit: 10,
    status: OrderStatus.DELIVERED,
  });

  // Get stats
  const stats = await fetchOrderStats();
}
```

### For Backend Developers

Ensure your API returns data in the exact format shown above. Key points:

1. **Pagination**: Include `pagination` object with page, limit, total, totalPages
2. **Relations**: Include `customer` and `orderProducts.product` in order objects
3. **Status Enum**: Use exact status values from `OrderStatus` enum
4. **Stats**: Return counts for ALL statuses, even if count is 0

## 📖 Documentation

Detailed documentation available:

- **IMPLEMENTATION_SUMMARY.md** - Complete technical implementation details
- **ORDERS_API_GUIDE.md** - Developer guide with code examples
- **ARCHITECTURE.md** - System architecture and data flow diagrams

## 🔍 Testing Checklist

- [ ] Backend API endpoints implemented
- [ ] Environment variable set
- [ ] Global search works (type and press Enter)
- [ ] Status tabs are clickable and filter orders
- [ ] Pagination works (next/prev buttons)
- [ ] Counts show correct numbers
- [ ] Loading states appear during fetch
- [ ] Errors display properly
- [ ] OrderCards display correct data

## 🐛 Troubleshooting

### Orders not loading
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. Test backend endpoints directly (e.g., with Postman)
4. Check backend CORS settings

### Search not working
1. Verify you pressed Enter after typing
2. Check URL has `?search=<term>` parameter
3. Ensure backend `/orders` endpoint handles `search` param

### Counts showing 0
1. Check backend `/orders/stats` endpoint
2. Verify stats return format matches expected structure
3. Check for console errors

### TypeScript errors
1. Run `npm install` to ensure all deps are installed
2. Restart TypeScript server in your IDE
3. Check you're using correct types from `@/types/orders`

## 🎉 Success!

If everything is set up correctly:
1. Orders page shows real data from backend
2. Search filters orders by any field
3. Status tabs show accurate counts
4. Clicking tabs filters orders
5. Pagination shows correct page count

Enjoy your fully integrated orders system! 🚀
