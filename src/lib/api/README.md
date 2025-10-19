# Orders API Integration

This directory contains the API integration for the orders functionality.

## API Endpoints

### Get All Orders
- **Endpoint**: `GET /orders/all-orders`
- **Description**: Fetch all orders with optional filters and pagination
- **Query Parameters**:
  - `page` (number): Page number for pagination
  - `limit` (number): Number of items per page
  - `status` (string): Filter by order status
  - `search` (string): Search term for general search
  - `customerName` (string): Filter by customer name
  - `phone` (string): Filter by phone number
  - `governorate` (string): Filter by governorate
  - `city` (string): Filter by city
  - `productName` (string): Filter by product name
  - `shipmentCode` (string): Filter by shipment code
  - `startDate` (string): Filter by start date (ISO format)
  - `endDate` (string): Filter by end date (ISO format)
  - `sortBy` (string): Field to sort by
  - `sortOrder` (string): Sort order (ASC or DESC)

### Get Order by ID
- **Endpoint**: `GET /orders/:id`
- **Description**: Fetch a single order by its ID
- **Path Parameters**:
  - `id` (number): Order ID

## Usage

### In Components

```typescript
import { useOrders } from '@/hooks/useOrders';
import { FilterOrdersDto } from '@/types/orders';

function MyComponent() {
  const filters: FilterOrdersDto = {
    page: 1,
    limit: 10,
    status: 'pending',
  };

  const { orders, loading, error, meta, refetch } = useOrders(filters);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>{order.customerName}</div>
      ))}
    </div>
  );
}
```

### Direct API Calls

```typescript
import { getOrders, getOrderById } from '@/lib/api/orders';

// Fetch orders
const response = await getOrders({ page: 1, limit: 10 });
console.log(response.data); // Array of orders
console.log(response.meta); // Pagination metadata

// Fetch single order
const orderResponse = await getOrderById(123);
console.log(orderResponse.data); // Order object
```

## Types

All TypeScript types are defined in `/src/types/orders.ts`:

- `Order`: Main order entity type
- `OrderItem`: Order item/product type
- `FilterOrdersDto`: API filter/query parameters
- `PaginatedOrdersResponse`: Response type for paginated orders
- `OrderDetailsResponse`: Response type for single order

## Environment Variables

Set the API base URL in your environment file:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Features

- ✅ Filtering by multiple criteria
- ✅ Pagination support
- ✅ Search functionality
- ✅ Sorting support
- ✅ Loading states
- ✅ Error handling
- ✅ Type-safe API calls
- ✅ Reusable hooks
