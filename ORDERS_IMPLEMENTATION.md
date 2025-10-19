# Orders Pages Implementation Guide

This document provides a comprehensive guide to the fully functional orders pages implementation.

## Overview

The orders pages have been fully implemented with:
- ✅ API integration with backend endpoints
- ✅ Advanced filtering capabilities
- ✅ Global search functionality
- ✅ Sorting options
- ✅ Server-side pagination
- ✅ Status-based filtering via tabs
- ✅ Order details page
- ✅ Loading and error states
- ✅ TypeScript type safety

## Architecture

### File Structure

```
src/
├── lib/api/
│   ├── orders.ts          # Orders API service
│   ├── index.ts           # Axios instance
│   └── README.md          # API documentation
├── hooks/
│   ├── useOrders.ts       # Hook for fetching orders list
│   └── useOrderById.ts    # Hook for fetching single order
├── types/
│   └── orders.ts          # TypeScript types for orders
├── app/dashboard/orders/
│   ├── allOrders/
│   │   ├── page.tsx       # Main orders list page
│   │   ├── pageTaps.tsx   # Status tabs component
│   │   ├── FilterSection/ # Filter panel
│   │   └── OrderCard/     # Order card component
│   └── [orderId]/
│       ├── page.tsx       # Order details page
│       └── OrderDetailsInfo.tsx
└── components/
    ├── ui/
    │   ├── SearchBar.tsx      # Search component
    │   ├── SortDropdown.tsx   # Sort component
    │   └── PageTab.tsx        # Tab component
    └── OrderDetails/
        ├── OrderDetailsCardId.tsx
        ├── OrderDetailsInfo.tsx
        ├── OrderDetailsInfoStatus.tsx
        └── OrderDetailsProductCard.tsx
```

## Features

### 1. All Orders Page (`/dashboard/orders/allOrders`)

#### API Integration
- Fetches orders from `GET /orders/all-orders`
- Server-side pagination
- Real-time filtering and sorting

#### Filtering
The page supports multiple filter types:

**Status Filters (via tabs):**
- All orders
- New orders
- Attempted
- Pending payment
- WhatsApp
- Postponed
- Recall
- Stopped
- Cancelled
- Prepared
- Shipping
- Reports
- Returned
- Collected
- Partial delivery
- Lost

**Field Filters:**
- Shipment code
- Customer name
- Phone number
- Execution date
- Campaign name
- Governorate
- Area
- Address

#### Search
- Global search across customer name, phone, shipment code
- Clear button to reset search
- Placeholder with helpful text

#### Sorting
- Sort by creation date (newest/oldest)
- Sort by price (highest/lowest)
- Sort by customer name (A-Z/Z-A)

#### Pagination
- Server-side pagination
- Configurable items per page (default: 6)
- Page navigation controls
- Automatic reset on filter changes

### 2. Order Details Page (`/dashboard/orders/[orderId]`)

#### API Integration
- Fetches single order from `GET /orders/:id`
- Real-time data loading
- Error handling

#### Display Sections
- Order ID and shipment code
- Creation date and time ago
- Delivery attempts indicator
- Order status
- Product cards with details
- Customer information (name, phone, alternative phone)
- Location (governorate, city)
- Full address
- Order notes
- Total price

## API Integration

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### API Endpoints

#### Get All Orders
```typescript
GET /orders/all-orders?page=1&limit=10&status=new&search=...
```

Query parameters:
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status
- `search`: Search query
- `customerName`: Filter by customer name
- `phone`: Filter by phone
- `governorate`: Filter by governorate
- `city`: Filter by city
- `productName`: Filter by product
- `shipmentCode`: Filter by shipment code
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `sortBy`: Field to sort by
- `sortOrder`: ASC or DESC

Response:
```typescript
{
  data: Order[],
  meta: {
    currentPage: number,
    totalPages: number,
    totalItems: number,
    itemsPerPage: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}
```

#### Get Order by ID
```typescript
GET /orders/:id
```

Response:
```typescript
{
  data: Order
}
```

## Usage Examples

### Using the useOrders Hook

```typescript
import { useOrders } from '@/hooks/useOrders';

function MyComponent() {
  const { orders, loading, error, meta, refetch } = useOrders({
    page: 1,
    limit: 10,
    status: 'new',
    search: 'john',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>{order.customerName}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Using the useOrderById Hook

```typescript
import { useOrderById } from '@/hooks/useOrderById';

function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const orderId = parseInt(params.orderId);
  const { order, loading, error, refetch } = useOrderById(orderId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div>
      <h1>{order.customerName}</h1>
      <p>Total: {order.totalPrice}</p>
    </div>
  );
}
```

### Direct API Calls

```typescript
import { getOrders, getOrderById } from '@/lib/api/orders';

// Fetch orders
const response = await getOrders({
  page: 1,
  limit: 10,
  status: 'new',
});

// Fetch single order
const orderResponse = await getOrderById(123);
```

## TypeScript Types

All types are defined in `src/types/orders.ts`:

### Order Type
```typescript
interface Order {
  id: number;
  shipmentCode?: string;
  customerName: string;
  phone: string;
  alternativePhone?: string;
  governorate: string;
  city: string;
  address: string;
  status: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryAttempts?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  executionDate?: string;
}
```

### OrderItem Type
```typescript
interface OrderItem {
  id: number;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}
```

### FilterOrdersDto Type
```typescript
interface FilterOrdersDto {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  customerName?: string;
  phone?: string;
  governorate?: string;
  city?: string;
  productName?: string;
  shipmentCode?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
```

## Component Props

### SearchBar
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}
```

### SortDropdown
```typescript
interface SortDropdownProps {
  onSort: (sortBy: string, sortOrder: 'ASC' | 'DESC') => void;
  options?: SortOption[];
}
```

### PageTab
```typescript
interface PageTabProps {
  label: string;
  count?: number;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}
```

## State Management

The allOrders page manages multiple states:
- `filters`: Field-based filters
- `searchQuery`: Global search term
- `statusFilter`: Selected status from tabs
- `sortBy`: Sort field
- `sortOrder`: Sort direction (ASC/DESC)
- `currentPage`: Current page number
- `select`: Multi-select mode

All states are synchronized and reset pagination when changed.

## Error Handling

The implementation includes comprehensive error handling:
- Network errors are caught and displayed
- Loading states during API calls
- Empty state when no results
- Error messages with retry option

## Best Practices

1. **Type Safety**: All components and functions use TypeScript types
2. **Separation of Concerns**: API logic separated from UI logic
3. **Reusable Hooks**: Custom hooks for common functionality
4. **Loading States**: Proper feedback during async operations
5. **Error Boundaries**: Graceful error handling
6. **Responsive Design**: Works on all screen sizes
7. **Accessibility**: Semantic HTML and ARIA labels

## Testing Backend Integration

To test with your backend:

1. Set the API URL in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://your-backend-url/api
   ```

2. Ensure your backend implements the expected endpoints:
   - `GET /orders/all-orders` with query parameters
   - `GET /orders/:id` for single order

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Navigate to `/dashboard/orders/allOrders`

5. Test features:
   - Click status tabs to filter
   - Use search bar
   - Apply field filters
   - Change sorting
   - Navigate pages
   - Click order card to view details

## Troubleshooting

### Orders not loading
- Check console for API errors
- Verify API URL in `.env.local`
- Ensure backend is running
- Check CORS configuration

### Filters not working
- Check browser network tab
- Verify query parameters are sent
- Check backend filter implementation

### Pagination issues
- Verify meta data in API response
- Check page boundaries
- Ensure backend returns correct total count

## Future Enhancements

Potential improvements:
- Export orders to CSV/Excel
- Bulk actions (select multiple orders)
- Print order details
- Order status updates from UI
- Order notes editing
- Real-time updates via WebSocket
- Advanced analytics dashboard
- Order timeline/history

## Support

For issues or questions:
1. Check this documentation
2. Review API documentation in `src/lib/api/README.md`
3. Check TypeScript types in `src/types/orders.ts`
4. Review component implementation

## Conclusion

The orders pages are now fully functional with comprehensive features for managing orders. All functionality is connected to backend APIs and ready for production use.
