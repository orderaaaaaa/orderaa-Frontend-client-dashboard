# Quick Start Guide - Orders API Integration

## 🚀 Quick Setup (3 Steps)

### Step 1: Configure Environment
Create `.env.local` in the project root:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your backend URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 2: Install Dependencies (if needed)
```bash
npm install
```

### Step 3: Run Development Server
```bash
npm run dev
```

Navigate to: `http://localhost:4001/dashboard/orders/allOrders`

## 🎯 What's Been Implemented

### 1. Global Search (Dashboard Header)
- **Location**: Top header search bar
- **What it does**: Filters orders across the entire app
- **How it works**: Type in search box → Updates Zustand store → Triggers API call

### 2. Status Filter Tabs
- **Location**: Top of orders page (horizontal tabs)
- **What it does**: Filter orders by status
- **How it works**: Click a tab → Updates Zustand store → Triggers API call

**Available Status Filters:**
- جميع الطلبات (All Orders)
- طلبات جديده (New Orders - TRIED_TO_REACH_CUSTOMER)
- في انتظار الدفع (Waiting for Payment - WAITING_FOR_PAYMENT)
- تأجيلات (On Hold - ON_HOLD)
- اعادة اتصال (Call Again - CALLED_CUSTOMER_AGAIN)
- تم الغاء (Cancelled - CANCELLED)
- تم التأكيد (Confirmed - CONFIRMED)
- تم التحضير (Prepared - PREPARED)
- في الشحن (Shipped - SHIPPED)
- مرتجع (Returned - RETURNED)
- تم التسليم (Delivered - DELIVERED)
- دفعة مقدمة (Down Payment - DOWN_PAYMENT)
- طلبات مفقوده (Missing - MISSING)

### 3. Order Cards
- **Location**: Grid of order cards below filters
- **What it does**: Displays order information
- **Data source**: Real API data (not dummy data)

### 4. Pagination
- **Location**: Bottom of page
- **What it does**: Navigate through pages of orders
- **How it works**: Client-side pagination on filtered results

## 📡 Backend Requirements

Your backend MUST implement these endpoints:

### GET /orders/all-orders
**Query Parameters:**
- `status` (optional): OrderStatus enum value
- `search` (optional): Search string
- `page` (optional): Page number
- `limit` (optional): Items per page

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "code": "ORD-001",
      "status": "CONFIRMED",
      "totalCost": 5000,
      "numberOfTriesToReach": 2,
      "notes": "Customer notes",
      "customer": {
        "id": 1,
        "name": "أحمد محمد",
        "phone": "01234567890",
        "governorate": "القاهرة",
        "area": "مدينة نصر",
        "address": "123 Street"
      },
      "orderProducts": [
        {
          "id": 1,
          "quantity": 2,
          "price": 2500,
          "product": {
            "id": 1,
            "name": "تيشيرت",
            "size": "L",
            "color": "أسود"
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### GET /orders/:id
**Expected Response:** Single order object (same structure as above)

## 🧪 Testing Checklist

After setup, test these features:

- [ ] **Search**: Type in header search → Orders filter
- [ ] **Status Filter**: Click "طلبات جديده" → Only new orders show
- [ ] **Clear Filter**: Click "جميع الطلبات" → All orders show
- [ ] **Loading State**: Should show spinner while fetching
- [ ] **Error State**: Disconnect backend → Should show error message
- [ ] **Empty State**: Filter with no results → Should show "لا توجد طلبات"
- [ ] **Pagination**: Click next/prev → Navigate through pages
- [ ] **Order Cards**: Should show real data (customer name, phone, products, etc.)
- [ ] **Tab Counts**: Each status tab should show correct count

## 🔍 Troubleshooting

### Problem: "فشل في تحميل الطلبات"
**Solution**: 
- Check backend is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check browser console for API errors
- Ensure backend CORS is configured

### Problem: Tabs show 0 for all statuses
**Solution**:
- Backend may not have any orders
- Check backend database has test data
- Verify backend returns correct status enum values

### Problem: Search doesn't work
**Solution**:
- Type in search box and wait for API call
- Check Network tab in browser DevTools
- Verify backend implements search parameter

### Problem: TypeScript errors
**Solution**:
- Run `npm install` to ensure all dependencies
- Existing file casing issue (Input.tsx vs input.tsx) is unrelated to this implementation

## 📂 Key Files to Review

1. **API Functions**: `src/lib/api/order.ts`
2. **Types**: `src/types/orders.ts`
3. **State Management**: `src/store/ordersStore.ts`
4. **Main Page**: `src/app/dashboard/orders/allOrders/page.tsx`
5. **Filter Tabs**: `src/app/dashboard/orders/allOrders/pageTaps.tsx`

## 💡 Tips

1. **Check Browser Console**: Open DevTools to see API calls and errors
2. **Use Network Tab**: Monitor API requests and responses
3. **Test with Different Data**: Create orders with different statuses in backend
4. **Performance**: Currently fetching all orders then filtering client-side. For large datasets, implement server-side pagination by modifying the API call to pass page/limit parameters.

## 🎓 How It Works (Simple Flow)

```
User Types in Search
    ↓
Zustand Store Updates (searchQuery)
    ↓
useEffect Detects Change
    ↓
Calls getOrders({ search: "query" })
    ↓
Backend Returns Filtered Data
    ↓
Orders State Updates
    ↓
OrderCards Re-render with New Data
```

Same flow for status filters!

## 📞 Need Help?

See detailed documentation in:
- `ORDERS_API_IMPLEMENTATION.md` - Full technical details
- `IMPLEMENTATION_SUMMARY.md` - Feature checklist

---

**That's it! Your orders API integration is ready to use.** 🎉
