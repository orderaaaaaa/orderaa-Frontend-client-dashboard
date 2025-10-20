# Orders API Integration - Developer Guide

## Quick Start

### Enabling Backend Integration

By default, the orders page uses dummy data. To enable backend integration:

1. Set the `NEXT_PUBLIC_API_URL` environment variable to your backend API URL
2. In `src/app/dashboard/orders/allOrders/page.tsx`, the `useBackend` state controls data source
3. When a search or filter is applied, the app automatically switches to backend mode

### Global Search

Users can search for orders from anywhere in the dashboard:

1. Type search term in the header search box
2. Press Enter
3. The app navigates to `/dashboard/orders/allOrders?search=<term>`
4. Orders are fetched from backend with the search query

### Status Filtering

Click on any status tab to filter orders:

```typescript
// Status tabs automatically filter orders
<PageTaps 
  data={orders} 
  activeStatus={activeStatus}
  onStatusChange={handleStatusChange}
  stats={orderStats}
/>
```

Available statuses:
- All Orders (جميع الطلبات)
- Tried to Reach Customer (تم المحاولة)
- Waiting for Payment (في انتظار الدفع)
- On Hold (وقوف التشغيل)
- Called Customer Again (اعادة اتصال)
- Cancelled (تم الغاء)
- Confirmed (طلبات جديده)
- Prepared (تم التحضير)
- Shipped (في الشحن)
- Returned (مرتجع مسلم)
- Delivered (تم التحصيل)
- Down Payment (تأجيلات)
- Missing (طلبات مفقوده)

### Pagination

Pagination is handled automatically:

```typescript
// Backend pagination
const { orders, pagination } = useOrders({
  page: currentPage,
  limit: 6,
  status: activeStatus,
});

// Display with Footer component
<Footer
  currentPage={currentPage}
  totalPages={pagination.totalPages}
  totalItems={pagination.total}
  hasNextPage={currentPage < pagination.totalPages}
  hasPreviousPage={currentPage > 1}
  onPageChange={setCurrentPage}
  onPrevious={() => setCurrentPage(p => p - 1)}
  onNext={() => setCurrentPage(p => p + 1)}
/>
```

## API Integration

### Using the Orders Hook

```typescript
import { useOrders, useOrderStats } from '@/hooks/AllOrders/useOrders';
import { OrderStatus } from '@/types/orders';

function MyComponent() {
  // Fetch orders with filters
  const { orders, pagination, loading, error } = useOrders({
    page: 1,
    limit: 10,
    status: OrderStatus.SHIPPED,
    search: 'customer name',
  });

  // Get order statistics
  const { stats } = useOrderStats();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Total orders: {pagination.total}</p>
      <p>Shipped orders: {stats?.[OrderStatus.SHIPPED]}</p>
      {orders.map(order => (
        <div key={order.id}>{order.code}</div>
      ))}
    </div>
  );
}
```

### Direct API Calls

```typescript
import { 
  fetchOrders, 
  fetchOrderById, 
  fetchOrderStats,
  updateOrderStatus 
} from '@/lib/api/order';
import { OrderStatus } from '@/types/orders';

// Fetch orders with filters
const response = await fetchOrders({
  page: 1,
  limit: 10,
  status: OrderStatus.CONFIRMED,
  search: 'ahmed',
});

// Get single order
const order = await fetchOrderById(123);

// Get statistics
const stats = await fetchOrderStats();

// Update order status
const updatedOrder = await updateOrderStatus(123, OrderStatus.DELIVERED);
```

## Type Definitions

### Order

```typescript
interface Order {
  id: number;
  code: string;
  status: OrderStatus;
  totalCost: number;
  numberOfTriesToReach: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  merchantId: number;
  customerId: number;
  merchant?: Merchant;
  customer?: Customer;
  orderProducts?: OrderProduct[];
}
```

### OrderDisplay (for OrderCard component)

```typescript
interface OrderDisplay {
  id: number;
  name: string;          // Customer name
  phone: string;         // Customer phone
  government: string;    // Governorate
  items: string[];       // Product names with size/color
  price: number;         // Total cost
  trys: number;          // Number of tries to reach
  status: string;        // Order status
  city: string;          // City
  alert?: number;        // Alert count (optional)
}
```

## Data Mapping

When using backend data, orders are mapped from the API format to the display format:

```typescript
const mapOrderToCard = (order: Order): OrderDisplay => ({
  id: order.id,
  name: order.customer?.name || 'Unknown',
  phone: order.customer?.phone || '',
  government: order.customer?.governorate || '',
  items: order.orderProducts?.map(op => 
    `${op.product.name} ${op.product.size || ''} ${op.product.color || ''}`.trim()
  ) || [],
  price: order.totalCost,
  trys: order.numberOfTriesToReach,
  status: order.status,
  city: order.customer?.city || '',
  alert: undefined,
});
```

## Error Handling

The `useOrders` hook provides error state:

```typescript
const { orders, loading, error } = useOrders(params);

if (error) {
  // Display error message to user
  return <div className="text-red-500">{error}</div>;
}
```

For direct API calls, wrap in try-catch:

```typescript
try {
  const orders = await fetchOrders({ page: 1 });
} catch (error) {
  console.error('Failed to fetch orders:', error);
  // Handle error
}
```

## Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

The API client (`src/lib/api/index.ts`) automatically uses this URL as the base for all API calls.

## Customization

### Changing Items Per Page

```typescript
const { orders } = useOrders({
  page: 1,
  limit: 12, // Change from default 6
});
```

### Adding Custom Filters

1. Update `OrderFilters` type in `src/types/orders.ts`
2. Update `defaultEmptyFilters` in `src/hooks/AllOrders/useFilterState.ts`
3. Update `FetchOrdersParams` in `src/lib/api/order.ts`
4. Update `useOrders` dependency array to include new filter

### Custom Status Tabs

Edit `src/app/dashboard/orders/allOrders/pageTaps.tsx`:

```typescript
<div onClick={() => handleTabClick(OrderStatus.YOUR_STATUS)}>
  <PageTab
    label="Your Label"
    count={stats?.[OrderStatus.YOUR_STATUS]}
    icon={<YourIcon width={18} height={18} />}
    active={activeStatus === OrderStatus.YOUR_STATUS}
  />
</div>
```

## Performance Considerations

1. **Pagination**: Always use pagination for large datasets (default: 6 items per page)
2. **Debouncing**: Consider adding debounce for search input
3. **Caching**: The hooks refetch on param changes - consider adding React Query for caching
4. **Loading States**: Always show loading indicators during API calls

## Troubleshooting

### Orders not loading from backend

1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend API is running
3. Check browser console for network errors
4. Ensure `useBackend` state is `true`

### Search not working

1. Verify search query is in URL: `/dashboard/orders/allOrders?search=<term>`
2. Check if backend `/orders` endpoint supports `search` parameter
3. Ensure `useBackend` switches to `true` on search

### Pagination issues

1. Check backend returns correct pagination metadata
2. Verify `totalPages` calculation matches backend
3. Ensure page numbers are 1-indexed (not 0-indexed)

### Type errors

1. Ensure backend response matches `Order` interface
2. Check `PaginatedResponse<Order>` structure is correct
3. Verify `orderProducts` includes nested `product` data
