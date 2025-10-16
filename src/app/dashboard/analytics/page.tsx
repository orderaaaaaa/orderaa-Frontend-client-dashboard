'use client';

import { AuthGuard } from '@/components/auth-guard';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
} from 'lucide-react';

// Mock analytics data
const revenueData = [
  { month: 'Jan', revenue: 12000, orders: 145 },
  { month: 'Feb', revenue: 15000, orders: 178 },
  { month: 'Mar', revenue: 18000, orders: 203 },
  { month: 'Apr', revenue: 22000, orders: 234 },
  { month: 'May', revenue: 25000, orders: 267 },
  { month: 'Jun', revenue: 28000, orders: 289 },
];

const topProducts = [
  { name: 'Wireless Headphones', sales: 234, revenue: 23400 },
  { name: 'Running Shoes', sales: 189, revenue: 24570 },
  { name: 'Smartphone Case', sales: 156, revenue: 3900 },
  { name: 'Coffee Maker', sales: 98, revenue: 7840 },
  { name: 'Desk Lamp', sales: 87, revenue: 3999 },
];

export default function AnalyticsPage() {
  const currentMonth = revenueData[revenueData.length - 1];
  const previousMonth = revenueData[revenueData.length - 2];
  const revenueGrowth = (
    ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) *
    100
  ).toFixed(1);
  const ordersGrowth = (
    ((currentMonth.orders - previousMonth.orders) / previousMonth.orders) *
    100
  ).toFixed(1);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Track your business performance and insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${currentMonth.revenue.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />+{revenueGrowth}% from
                last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMonth.orders}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />+{ordersGrowth}% from
                last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(currentMonth.revenue / currentMonth.orders).toFixed(2)}
              </div>
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="mr-1 h-3 w-3" />
                -2.1% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2%</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +0.3% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((data, index) => (
                  <div
                    key={data.month}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 text-sm font-medium">
                        {data.month}
                      </div>
                      <div className="flex-1">
                        <Progress
                          value={(data.revenue / 30000) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ${data.revenue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="secondary"
                        className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.sales} sales
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ${product.revenue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Acquisition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Organic Search</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <Progress value={45} className="h-2" />

                <div className="flex justify-between">
                  <span className="text-sm">Social Media</span>
                  <span className="text-sm font-medium">30%</span>
                </div>
                <Progress value={30} className="h-2" />

                <div className="flex justify-between">
                  <span className="text-sm">Direct</span>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Delivered</span>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    856
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Processing</span>
                  <Badge
                    variant="default"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    234
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Shipped</span>
                  <Badge
                    variant="default"
                    className="bg-blue-100 text-blue-800"
                  >
                    89
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending</span>
                  <Badge variant="secondary">55</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventory Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">In Stock</span>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    289
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Low Stock</span>
                  <Badge
                    variant="default"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    34
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Out of Stock</span>
                  <Badge variant="destructive">19</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
