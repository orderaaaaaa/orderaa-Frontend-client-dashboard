# Mock Data Usage

This directory contains mock data for development and testing purposes.

## How It Works

The application now uses a **hybrid approach** that prioritizes API calls but gracefully falls back to mock data when the API is unavailable:

### Order List (`/dashboard/orders/allOrders`)
1. **First**, attempts to fetch orders from the backend API
2. **If API fails**, falls back to mock data from `mockData.ts`
3. Click on any order card to navigate to order details

### Order Details (`/dashboard/orders/[orderId]`)
1. **First**, attempts to fetch the specific order by ID from the API
2. **If API fails**, searches for the order in mock data
3. Shows the full order details with all information

### Load More & Infinite Scroll
- Works with API when available
- Gracefully handles pagination failures

### Excel Export
- Exports from API when available
- Falls back to currently loaded orders (mock or API) if export API fails

## Mock Data Structure

The mock data in `mockData.ts` includes:
- **15 complete orders** with various statuses
- All required Order interface fields
- Complete customer information
- Product details with SKUs, images, variants
- Payment and shipping information
- Notes and tracking data

## Development Tips

1. **Testing with Mock Data**: If your backend is down, the app will automatically use mock data
2. **Testing with API**: When your backend is running, the app will use real API data
3. **No Code Changes Needed**: The fallback happens automatically
4. **Console Warnings**: Check browser console for "API failed, using mock data" messages

## Order IDs in Mock Data

The mock data contains orders with IDs: 1-15

You can navigate to any of these directly:
- `/dashboard/orders/1` - NEW_ORDER
- `/dashboard/orders/2` - CONFIRMED
- `/dashboard/orders/3` - SHIPPING
- `/dashboard/orders/4` - DELIVERED
- `/dashboard/orders/11` - DELIVERED with coupon
- `/dashboard/orders/12` - MISSING
- `/dashboard/orders/13` - PARTIAL_DELIVERY
- `/dashboard/orders/14` - CANCELLED
- `/dashboard/orders/15` - RETURNED_DELIVERED
