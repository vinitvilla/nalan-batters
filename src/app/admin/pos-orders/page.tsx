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
import { useAdminApi } from "@/app/admin/use-admin-api";
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
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List
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

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function PosOrdersPage() {
  const adminApiFetch = useAdminApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loadingPagination, setLoadingPagination] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    todayOrders: 0
  });

  const fetchOrders = async (page = 1, search = '', status = 'all', payment = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search,
        status: status === 'all' ? '' : status,
        paymentMethod: payment === 'all' ? '' : payment
      });
      
      const response = await adminApiFetch(`/api/admin/pos/orders?${params}`);
      if (!response) {
        throw new Error('No response from server');
      }
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
        setPagination(result.pagination);
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
      totalOrders: pagination.total || orderData.length,
      totalRevenue,
      avgOrderValue: orderData.length > 0 ? totalRevenue / orderData.length : 0,
      todayOrders: todayOrders.length
    });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders(1, searchTerm, statusFilter, paymentFilter);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoadingPagination(true);
    fetchOrders(page, searchTerm, statusFilter, paymentFilter).finally(() => {
      setLoadingPagination(false);
    });
  };

  const handleRefresh = () => {
    fetchOrders(currentPage, searchTerm, statusFilter, paymentFilter);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    handleSearch();
  }, [statusFilter, paymentFilter]);

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
                <Button onClick={handleRefresh} className="w-full">
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
                    POS Transactions
                  </h1>
                  <p className="text-gray-600 mt-1">Point-of-sale transactions and walk-in customer orders</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2 hover:bg-blue-50">
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
                      <p className="text-emerald-100 text-sm font-medium">Total Transactions</p>
                      <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                      <p className="text-emerald-200 text-xs mt-1">POS sales</p>
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
                      <p className="text-blue-100 text-sm font-medium">Today's Sales</p>
                      <p className="text-3xl font-bold mt-2">{stats.todayOrders}</p>
                      <p className="text-blue-200 text-xs mt-1">In-store today</p>
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
                      <p className="text-purple-100 text-sm font-medium">POS Revenue</p>
                      <p className="text-3xl font-bold mt-2">${stats.totalRevenue.toFixed(2)}</p>
                      <p className="text-purple-200 text-xs mt-1">In-store sales</p>
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
                        placeholder="Search by order number or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-12 h-12 bg-gray-50/50 border-gray-200 focus:border-blue-300 focus:ring-blue-200 text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSearch}
                      className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
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
          {orders.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Receipt className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {pagination.total === 0 ? 'No POS transactions yet' : 'No POS orders match your filters'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {pagination.total === 0 
                    ? 'Point-of-sale transactions will appear here when customers make in-store purchases.' 
                    : 'Try adjusting your search or filter criteria to find the POS transactions you\'re looking for.'
                  }
                </p>
                {pagination.total > 0 && (
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPaymentFilter('all');
                      fetchOrders(1, '', 'all', 'all');
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
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <Select 
                    value={pageSize.toString()} 
                    onValueChange={(value) => {
                      const newPageSize = Number(value);
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                      // Update the fetch function to use the new page size
                      const params = new URLSearchParams({
                        page: '1',
                        limit: newPageSize.toString(),
                        search: searchTerm,
                        status: statusFilter === 'all' ? '' : statusFilter,
                        paymentMethod: paymentFilter === 'all' ? '' : paymentFilter
                      });
                      
                      fetch(`/api/admin/pos/orders?${params}`)
                        .then(response => response.json())
                        .then(result => {
                          if (result.success) {
                            setOrders(result.data);
                            setPagination(result.pagination);
                            calculateStats(result.data);
                          }
                        });
                    }}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="h-4 w-px bg-gray-300 mx-2"></div>
                  
                  <div className="flex items-center border rounded-lg p-1 bg-gray-50">
                    <Button
                      variant={viewMode === 'card' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => setViewMode('card')}
                    >
                      <LayoutGrid className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => setViewMode('table')}
                    >
                      <List className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {viewMode === 'card' ? (
                // Card View - Enhanced Design
                <div className="grid gap-3">
                  {orders.map((order: Order) => (
                    <Card key={order.id} className={`bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-l-4 ${
                      order.status === 'COMPLETED' || order.status === 'DELIVERED' || order.status === 'CONFIRMED'
                        ? 'border-l-green-500' 
                        : order.status === 'PENDING'
                        ? 'border-l-yellow-500'
                        : 'border-l-red-500'
                    } ${loadingPagination ? 'opacity-50' : ''}`}>
                      <CardContent className="p-0">
                        {/* Compact Header Row */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex items-center gap-3">
                            {/* Order Number Badge */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
                              <Receipt className="h-4 w-4" />
                              <span className="font-bold text-sm">{order.orderNumber}</span>
                            </div>
                            
                            {/* Status Badge */}
                            <Badge 
                              className={`text-xs font-semibold px-2 py-1 ${
                                order.status === 'COMPLETED' || order.status === 'DELIVERED' || order.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-700 border-green-300' 
                                  : order.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                  : 'bg-red-100 text-red-700 border-red-300'
                              }`}
                            >
                              {order.status}
                            </Badge>
                            
                            {/* Timestamp */}
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="text-sm font-medium">{moment(order.createdAt).format('MMM D, h:mm A')}</span>
                            </div>
                          </div>
                          
                          {/* Total & View Button */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</div>
                              {order.discount && order.discount > 0 && (
                                <div className="text-xs text-green-600 font-medium">-${order.discount.toFixed(2)} saved</div>
                              )}
                            </div>
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => handleViewOrder(order)}
                              className="h-9 px-4 bg-blue-600 hover:bg-blue-700"
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                          </div>
                        </div>

                        {/* Content Row - Horizontal Layout */}
                        <div className="px-4 py-3 border-t border-gray-100">
                          <div className="flex items-center justify-between gap-6">
                            {/* Payment Method */}
                            <div className="flex items-center gap-3 min-w-[140px]">
                              {order.paymentMethod === 'CASH' ? (
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shadow-sm">
                                  <Banknote className="h-5 w-5 text-green-600" />
                                </div>
                              ) : order.paymentMethod === 'CARD' ? (
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                                  <CreditCard className="h-5 w-5 text-blue-600" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shadow-sm">
                                  <CreditCard className="h-5 w-5 text-purple-600" />
                                </div>
                              )}
                              <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Payment</div>
                                <div className="text-sm font-bold text-gray-900">{order.paymentMethod}</div>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="h-10 w-px bg-gray-200" />

                            {/* Items Summary - Takes more space */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                <Package className="h-5 w-5 text-orange-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Items ({order.items.length})</div>
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {order.items.map((item, idx) => (
                                    <span key={idx}>
                                      {item.product.name} × {item.quantity}
                                      {idx < order.items.length - 1 && ', '}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="h-10 w-px bg-gray-200" />

                            {/* Tax Info */}
                            <div className="flex items-center gap-3 min-w-[120px]">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shadow-sm">
                                <Receipt className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Tax</div>
                                <div className="text-sm font-bold text-gray-900">${order.tax.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Table View - Enhanced Design
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="text-left px-4 py-3 font-bold text-gray-900 text-sm uppercase tracking-wide">Order</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-900 text-sm uppercase tracking-wide">Time</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-900 text-sm uppercase tracking-wide">Status</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-900 text-sm uppercase tracking-wide">Payment</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-900 text-sm uppercase tracking-wide">Items</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-900 text-sm uppercase tracking-wide">Tax</th>
                            <th className="text-right px-4 py-3 font-bold text-gray-900 text-sm uppercase tracking-wide">Total</th>
                            <th className="text-center px-4 py-3 font-bold text-gray-900 text-sm uppercase tracking-wide">Action</th>
                          </tr>
                        </thead>
                        <tbody className={loadingPagination ? 'opacity-50' : ''}>
                          {orders.map((order: Order, index: number) => (
                            <tr key={order.id} className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                            }`}>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg text-xs flex items-center justify-center font-bold shadow-sm">
                                    <Receipt className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold text-gray-900">{order.orderNumber}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{moment(order.createdAt).format('MMM D')}</div>
                                    <div className="text-xs text-gray-500">{moment(order.createdAt).format('h:mm A')}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <Badge 
                                  className={`text-xs font-semibold px-2.5 py-1 ${
                                    order.status === 'COMPLETED' || order.status === 'DELIVERED' || order.status === 'CONFIRMED'
                                      ? 'bg-green-100 text-green-700 border-green-300' 
                                      : order.status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                      : 'bg-red-100 text-red-700 border-red-300'
                                  }`}
                                >
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  {order.paymentMethod === 'CASH' ? (
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                      <Banknote className="h-4 w-4 text-green-600" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <CreditCard className="h-4 w-4 text-blue-600" />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-gray-900">{order.paymentMethod}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-orange-500" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                                    <div className="text-xs text-gray-500 max-w-40 truncate">
                                      {order.items.map((item, idx) => (
                                        <span key={idx}>
                                          {item.product.name}
                                          {idx < order.items.length - 1 && ', '}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm font-semibold text-purple-600">${order.tax.toFixed(2)}</span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="text-lg font-bold text-green-600">${order.total.toFixed(2)}</div>
                                {order.discount && order.discount > 0 && (
                                  <div className="text-xs text-green-600 font-medium">-${order.discount.toFixed(2)}</div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => handleViewOrder(order)}
                                  className="h-8 px-3 bg-blue-600 hover:bg-blue-700"
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!pagination.hasPrev || loadingPagination}
                          onClick={() => handlePageChange(1)}
                        >
                          First
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!pagination.hasPrev || loadingPagination}
                          onClick={() => handlePageChange(pagination.page - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        
                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                              pageNum = i + 1;
                            } else if (pagination.page >= pagination.totalPages - 2) {
                              pageNum = pagination.totalPages - 4 + i;
                            } else {
                              pageNum = pagination.page - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === pagination.page ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!pagination.hasNext || loadingPagination}
                          onClick={() => handlePageChange(pagination.page + 1)}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!pagination.hasNext || loadingPagination}
                          onClick={() => handlePageChange(pagination.totalPages)}
                        >
                          Last
                        </Button>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Total: {pagination.total} orders
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
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
