'use client';

import { AuthGuard } from '@/components/auth-guard';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Eye, Download, Filter } from 'lucide-react';
import { useState } from 'react';

// Mock orders data
const mockOrders = [
  {
    id: '#ORD-001',
    customer: 'John Smith',
    email: 'john@example.com',
    date: '2024-01-15',
    total: 299.97,
    status: 'Delivered',
    items: 3,
  },
  {
    id: '#ORD-002',
    customer: 'Sarah Johnson',
    email: 'sarah@example.com',
    date: '2024-01-14',
    total: 159.99,
    status: 'Shipped',
    items: 2,
  },
  {
    id: '#ORD-003',
    customer: 'Mike Davis',
    email: 'mike@example.com',
    date: '2024-01-14',
    total: 79.99,
    status: 'Processing',
    items: 1,
  },
  {
    id: '#ORD-004',
    customer: 'Emily Wilson',
    email: 'emily@example.com',
    date: '2024-01-13',
    total: 449.98,
    status: 'Pending',
    items: 4,
  },
  {
    id: '#ORD-005',
    customer: 'David Brown',
    email: 'david@example.com',
    date: '2024-01-13',
    total: 24.99,
    status: 'Cancelled',
    items: 1,
  },
  {
    id: '#ORD-006',
    customer: 'Lisa Anderson',
    email: 'lisa@example.com',
    date: '2024-01-12',
    total: 189.99,
    status: 'Delivered',
    items: 2,
  },
];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders] = useState(mockOrders);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Delivered
          </Badge>
        );
      case 'Shipped':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Shipped
          </Badge>
        );
      case 'Processing':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            Processing
          </Badge>
        );
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Orders</h1>
            <p className="text-muted-foreground">
              Manage customer orders and fulfillment
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">856</div>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">144</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                {/* <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                /> */}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.items} items</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
