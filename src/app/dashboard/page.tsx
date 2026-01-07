'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { isChecking } = useAuthGuard(true);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-64 mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Localizers for Arabic (uses Arabic-Indic digits)
  const numberFormatter = new Intl.NumberFormat('ar-EG');
  const percentFormatter = new Intl.NumberFormat('ar-EG', {
    style: 'percent',
    maximumFractionDigits: 0,
  });
  const currencyFormatter = new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const totalOrders = 1234;
  const totalCustomers = 856;
  const totalProducts = 342;
  const revenue = 45231;

  return (
    <div dir="rtl" lang="ar" className="space-y-6 text-right">
      <div>
        <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-muted-foreground">
          مرحبًا بك في نظام إدارة المتجر الإلكتروني
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي الطلبات
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {numberFormatter.format(totalOrders)}
            </div>
            <p className="text-xs text-muted-foreground">
              {'زيادة ' +
                percentFormatter.format(0.12) +
                ' مقارنة بالشهر الماضي'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي العملاء
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {numberFormatter.format(totalCustomers)}
            </div>
            <p className="text-xs text-muted-foreground">
              {'زيادة ' +
                percentFormatter.format(0.08) +
                ' مقارنة بالشهر الماضي'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المنتجات
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {numberFormatter.format(totalProducts)}
            </div>
            <p className="text-xs text-muted-foreground">
              {numberFormatter.format(3) + ' منتجات جديدة هذا الأسبوع'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormatter.format(revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {'زيادة ' +
                percentFormatter.format(0.15) +
                ' مقارنة بالشهر الماضي'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
