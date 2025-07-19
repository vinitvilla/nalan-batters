"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RequirePermission } from "@/components/PermissionWrapper";
import { 
  Receipt, 
  User, 
  Calendar, 
  DollarSign,
  Package,
  RefreshCw,
  Store,
  Truck,
  CreditCard,
  Banknote
} from 'lucide-react';

interface Order {
  id: string;
  total: number;
  tax: number;
  discount: number | null;
  status: string;
  orderType: string;
  paymentMethod: string;
  createdAt: string;
  user: {
    fullName: string;
    phone: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
}

export default function PosOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/pos/orders');
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error while fetching orders');
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <RequirePermission permission="billing">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </RequirePermission>
    );
  }

  if (error) {
    return (
      <RequirePermission permission="billing">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading orders: {error}</p>
            <Button onClick={fetchOrders}>Retry</Button>
          </div>
        </div>
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="billing">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">POS Orders</h1>
            <p className="text-gray-600">Recent in-store sales and transactions</p>
          </div>
          <Button onClick={fetchOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">POS sales will appear here once customers make purchases.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Receipt className="h-5 w-5 text-gray-400" />
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {order.user.fullName}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${order.total.toFixed(2)}
                      </div>
                      <div className="flex gap-2 justify-end mt-1">
                        <Badge variant="secondary">{order.status}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {order.orderType === 'PICKUP' ? <Store className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                          {order.orderType}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {order.paymentMethod === 'CASH' ? <Banknote className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                          {order.paymentMethod}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Items ({order.items.length})
                      </h4>
                      <div className="space-y-1">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.product.name}</span>
                            <span>${(item.quantity * parseFloat(item.price.toString())).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>Subtotal:</span>
                      <span>${(order.total - order.tax + (order.discount || 0)).toFixed(2)}</span>
                    </div>
                    
                    {order.discount && order.discount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span>Discount:</span>
                        <span>-${order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>Tax:</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
