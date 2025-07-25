"use client";

import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Banknote,
  Search,
  Filter,
  TrendingUp,
  Clock,
  ShoppingCart,
  Eye,
  Download,
  MoreVertical,
  SlidersHorizontal
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
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

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  todayOrders: number;
}

export default function PosOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    todayOrders: 0
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/pos/orders');
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
        setFilteredOrders(result.data);
        calculateStats(result.data);
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

  const calculateStats = (orderData: Order[]) => {
    const today = moment().startOf('day');
    
    const todayOrders = orderData.filter(order => {
      const orderDate = moment(order.createdAt).startOf('day');
      return orderDate.isSame(today);
    });

    const totalRevenue = orderData.reduce((sum, order) => sum + order.total, 0);
    
    setStats({
      totalOrders: orderData.length,
      totalRevenue,
      avgOrderValue: orderData.length > 0 ? totalRevenue / orderData.length : 0,
      todayOrders: todayOrders.length
    });
  };

  const filterOrders = () => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.phone.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentMethod === paymentFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, paymentFilter, orders]);

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <RequirePermission permission="billing">
        <div className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading POS Orders</h3>
              <p className="text-gray-600">Fetching recent transactions...</p>
            </div>
          </div>
        </div>
      </RequirePermission>
    );
  }

  if (error) {
    return (
      <RequirePermission permission="billing">
        <div className="p-6">
          <div className="flex items-center justify-center h-96">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchOrders} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="billing">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 shadow-sm sticky top-0 z-10">
          <div className="px-6 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Receipt className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    POS Orders
                  </h1>
                  <p className="text-gray-600 mt-1">Manage and track in-store transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2 hover:bg-blue-50">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Total Orders</p>
                      <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                      <p className="text-emerald-200 text-xs mt-1">All time</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Today's Orders</p>
                      <p className="text-3xl font-bold mt-2">{stats.todayOrders}</p>
                      <p className="text-blue-200 text-xs mt-1">Today's activity</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold mt-2">${stats.totalRevenue.toFixed(2)}</p>
                      <p className="text-purple-200 text-xs mt-1">All orders</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Avg Order Value</p>
                      <p className="text-3xl font-bold mt-2">${stats.avgOrderValue.toFixed(2)}</p>
                      <p className="text-orange-200 text-xs mt-1">Per transaction</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-8">
          {/* Filters Section */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Filter className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="Search by customer name, phone, or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 bg-gray-50/50 border-gray-200 focus:border-blue-300 focus:ring-blue-200 text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-44 h-12 bg-gray-50/50 border-gray-200 focus:border-blue-300">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          <SelectValue placeholder="All Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            All Status
                          </div>
                        </SelectItem>
                        <SelectItem value="PENDING">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="COMPLETED">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            Completed
                          </div>
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            Cancelled
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                      <SelectTrigger className="w-44 h-12 bg-gray-50/50 border-gray-200 focus:border-blue-300">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <SelectValue placeholder="All Payments" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            All Payments
                          </div>
                        </SelectItem>
                        <SelectItem value="CASH">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-green-600" />
                            Cash
                          </div>
                        </SelectItem>
                        <SelectItem value="CARD">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            Card
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      variant="outline" 
                      size="lg"
                      className="h-12 px-4 bg-gray-50/50 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Content */}
          {filteredOrders.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Receipt className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {orders.length === 0 
                    ? 'POS sales will appear here once customers make purchases in-store.' 
                    : 'Try adjusting your search or filter criteria to find the orders you\'re looking for.'
                  }
                </p>
                {orders.length > 0 && (
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPaymentFilter('all');
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              </div>
              
              {filteredOrders.map(order => (
                <Card key={order.id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              #{order.orderNumber}
                            </h3>
                            <Badge 
                              className={`text-xs ${
                                order.status === 'COMPLETED'  || order.status === 'DELIVERED' || order.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-800' 
                                  : order.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.status}
                            </Badge>
                            {order.discount && (
                              <Badge className="text-xs flex items-center gap-1 bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900 border border-yellow-300 shadow-sm px-2 py-1">
                                <span className="font-semibold">Discount</span>
                                <span className="bg-yellow-100 rounded px-1 text-xs font-mono">
                                  -${order.discount.toFixed(2)}
                                </span>
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{order.user.fullName}</span>
                              <span>•</span>
                              <span>{moment(order.createdAt).format('MMM D, YYYY')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {order.orderType === 'PICKUP' ? <Store className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                              <span>{order.orderType}</span>
                              <span>•</span>
                              {order.paymentMethod === 'CASH' ? <Banknote className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                              <span>{order.paymentMethod}</span>
                              <span>•</span>
                              <span>{order.items.length} items</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                          ${order.total.toFixed(2)}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                Order #{selectedOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedOrder.user.fullName}</p>
                      <p><span className="font-medium">Phone:</span> {selectedOrder.user.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Order Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Date:</span> {moment(selectedOrder.createdAt).format('MMMM D, YYYY')}</p>
                      <p><span className="font-medium">Time:</span> {moment(selectedOrder.createdAt).format('h:mm A')}</p>
                      <p><span className="font-medium">Type:</span> {selectedOrder.orderType}</p>
                      <p><span className="font-medium">Payment:</span> {selectedOrder.paymentMethod}</p>
                      <p>
                        <span className="font-medium">Status:</span> 
                        <Badge 
                          className={`ml-2 text-xs ${
                            selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800' 
                              : selectedOrder.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {selectedOrder.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">{item.quantity}</span>
                          </div>
                          <span className="font-medium">{item.product.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${(item.quantity * parseFloat(item.price.toString())).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">${parseFloat(item.price.toString()).toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Order Summary
                  </h4>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">${(selectedOrder.total - selectedOrder.tax + (selectedOrder.discount || 0)).toFixed(2)}</span>
                    </div>
                    
                    {selectedOrder.discount && selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span className="font-medium">-${selectedOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span className="font-medium">${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RequirePermission>
  );
}
