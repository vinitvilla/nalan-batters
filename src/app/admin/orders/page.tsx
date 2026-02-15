"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { userStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { AdminOrderResponse, ORDER_STATUS_FILTERS, ORDER_STATUSES } from "@/types/order";
import type { OrderStatus } from "@/generated/prisma";
import { MoreVertical, Package, Phone, Truck, Clock, MapPin, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { capitalize, formatCurrency, formatPhoneNumber, formatDate, formatDateOnly } from "@/lib/utils/commonFunctions";
import { DateFilter } from "@/components/ui/date-filter";
import { EnhancedPagination } from "@/components/ui/enhanced-pagination";
import moment from "moment";

export default function OrdersPage() {
    const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [orderType, setOrderType] = useState("all");
    const [paymentMethod, setPaymentMethod] = useState("all");
    const [loading, setLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    
    // Date filter state
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: '',
        quickFilter: 'all'
    });
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    
    // Sorting state
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    
    const token = userStore((s) => s.token);
    const adminApiFetch = useAdminApi();
    const router = useRouter();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch orders with pagination and filters
    const fetchOrders = async () => {
        if (!token) return;
        setLoading(true);
        
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });

            if (search) params.append('search', debouncedSearch);
            if (status !== 'all') params.append('status', status);
            if (orderType !== 'all') params.append('orderType', orderType);
            if (paymentMethod !== 'all') params.append('paymentMethod', paymentMethod);
            if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
            if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);
            if (sortBy) params.append('sortBy', sortBy);
            if (sortOrder) params.append('sortOrder', sortOrder);

            const response = await adminApiFetch(`/api/admin/orders?${params.toString()}`);
            if (!response) throw new Error("No response from server");
            
            const data = await response.json();
            
            // Handle both new paginated response and old response format
            if (data.orders && data.pagination) {
                // New paginated response
                const mappedOrders = data.orders.map((order: AdminOrderResponse) => ({
                    ...order,
                    fullName: order.user?.fullName || "",
                    phone: order.user?.phone || "",
                }));
                setOrders(mappedOrders);
                setTotalPages(data.pagination.totalPages);
                setTotalItems(data.pagination.totalCount);
            } else {
                // Fallback for old response format
                const orders = (Array.isArray(data) ? data : data.orders || []).map((order: AdminOrderResponse) => ({
                    ...order,
                    fullName: order.user?.fullName || "",
                    phone: order.user?.phone || "",
                }));
                setOrders(orders);
                setTotalPages(Math.ceil(orders.length / itemsPerPage));
                setTotalItems(orders.length);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    // Fetch orders when dependencies change
    useEffect(() => {
        fetchOrders();
    }, [token, currentPage, itemsPerPage, debouncedSearch, status, orderType, paymentMethod, dateFilter, sortBy, sortOrder]);

    // Reset to first page when filters change (except page and itemsPerPage)
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearch, status, orderType, paymentMethod, dateFilter, sortBy, sortOrder]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        if (!token) return;
        
        setUpdatingStatus(orderId);
        
        try {
            const res = await adminApiFetch(`/api/admin/orders/${orderId}`, {
                method: "PUT",
                body: JSON.stringify({ status: newStatus.toUpperCase() }),
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            
            if (!res || !res.ok) {
                const errorData = await res?.json?.();
                throw new Error(errorData?.message || "Failed to update order status");
            }
            
            // Update the order in the local state
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId
                        ? { ...order, status: newStatus.toUpperCase() as OrderStatus }
                        : order
                )
            );
            
            toast.success("Order status updated successfully");
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const handleDateFilterChange = (newDateFilter: typeof dateFilter) => {
        setDateFilter(newDateFilter);
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            // Toggle sort order if same column
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            // Set new column and default to desc
            setSortBy(column);
            setSortOrder("desc");
        }
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        }
        return sortOrder === "asc" ? 
            <ArrowUp className="w-4 h-4 text-blue-600" /> : 
            <ArrowDown className="w-4 h-4 text-blue-600" />;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Orders</h1>
                <p className="text-gray-600">Manage and track all customer orders in one place</p>
            </div>
            
            <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="border-b border-gray-200 pb-6">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1 max-w-md">
                                <Input
                                    placeholder="Search by customer name, phone, or order number..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="h-11 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <Tabs value={status} onValueChange={setStatus} className="w-full md:w-auto">
                                <TabsList className="flex w-full md:w-auto bg-gray-100 p-1 rounded-lg">
                                    {ORDER_STATUS_FILTERS.map(s => (
                                        <TabsTrigger 
                                            key={s} 
                                            value={s} 
                                            className="flex-1 md:flex-none cursor-pointer text-xs sm:text-sm font-medium px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
                                        >
                                            {capitalize(s)}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-2">Order Type</label>
                                <Select value={orderType} onValueChange={setOrderType}>
                                    <SelectTrigger className="w-full md:w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="delivery">Delivery</SelectItem>
                                        <SelectItem value="pickup">Pickup</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-2">Payment Method</label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="w-full md:w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Methods</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-2">Sort By</label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full md:w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt">Order Date</SelectItem>
                                        <SelectItem value="total">Amount</SelectItem>
                                        <SelectItem value="user.fullName">Customer</SelectItem>
                                        <SelectItem value="status">Status</SelectItem>
                                        <SelectItem value="orderType">Type</SelectItem>
                                        <SelectItem value="deliveryDate">Delivery Date</SelectItem>
                                        <SelectItem value="orderNumber">Order Number</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-2">Order</label>
                                <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                                    <SelectTrigger className="w-full md:w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Newest First</SelectItem>
                                        <SelectItem value="asc">Oldest First</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <DateFilter
                                dateFilter={dateFilter}
                                onDateFilterChange={handleDateFilterChange}
                                className="w-full md:w-auto"
                            />
                        </div>
                    </div>
                    
                    {/* Mobile Card View */}
                    <div className="block lg:hidden space-y-4">
                        {loading ? (
                            <div className="text-center text-muted-foreground py-8">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                Loading orders...
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center text-muted-foreground py-12">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-500 mb-2">No orders found</p>
                                <p className="text-sm text-gray-400">Try adjusting your filters or search criteria</p>
                            </div>
                        ) : (
                            orders.map((order, index) => (
                                <div
                                    key={order.id}
                                    className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 hover:shadow-md hover:border-gray-300 cursor-pointer transition-all duration-200"
                                    onClick={(e) => {
                                        // Don't navigate if clicking on the select dropdown
                                        const target = e.target as HTMLElement;
                                        if (target.closest('[role="combobox"]') || target.closest('[role="option"]') || target.closest('.select-trigger')) {
                                            return;
                                        }
                                        router.push(`/admin/orders/${order.id}`);
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-block border border-blue-200">
                                                #{order.orderNumber || "N/A"}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg text-gray-900">{order.user.fullName}</p>
                                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {formatPhoneNumber(order.user.phone)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-3">
                                            <Select 
                                                value={order.status} 
                                                onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                                                disabled={updatingStatus === order.id}
                                            >
                                                <SelectTrigger className="w-36 h-10 select-trigger border-gray-300 bg-white shadow-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ORDER_STATUSES.map(statusOption => (
                                                        <SelectItem key={statusOption} value={statusOption}>
                                                            {capitalize(statusOption)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="text-right">
                                                <p className="font-bold text-xl text-gray-900">{formatCurrency(order.total)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">Type</span>
                                                <div className="mt-1">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                                        (order as any).orderType === 'delivery' 
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                        {(order as any).orderType === 'delivery' ? (
                                                            <Truck className="w-3 h-3 mr-1" />
                                                        ) : (
                                                            <Package className="w-3 h-3 mr-1" />
                                                        )}
                                                        {capitalize((order as any).orderType || "N/A")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">Payment</span>
                                                <div className="mt-1">
                                                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                                                        {capitalize((order as any).paymentMethod || "N/A")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">Order Date</span>
                                                <div className="mt-1 space-y-1">
                                                    <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {moment(order.createdAt).format('HH:mm')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">Delivery</span>
                                                <div className="mt-1">
                                                    {order.deliveryDate ? (
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-gray-900 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                                                                {formatDateOnly(order.deliveryDate)}
                                                            </p>
                                                            <p className="text-xs text-gray-600 flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {order.address?.city || "N/A"}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-400 italic bg-gray-50 px-2 py-1 rounded-md">Not scheduled</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                                        <TableHead className="font-semibold text-gray-700 py-4 px-4 text-left whitespace-nowrap">
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                                                onClick={() => handleSort("orderNumber")}
                                            >
                                                Order #
                                                {getSortIcon("orderNumber")}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4 px-4 text-left">
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                                                onClick={() => handleSort("user.fullName")}
                                            >
                                                Customer
                                                {getSortIcon("user.fullName")}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4 px-4 text-left">
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                                                onClick={() => handleSort("status")}
                                            >
                                                Status
                                                {getSortIcon("status")}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4 px-4 text-left">
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                                                onClick={() => handleSort("orderType")}
                                            >
                                                Type
                                                {getSortIcon("orderType")}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4 px-4 text-right">
                                            <div className="flex items-center justify-end">
                                                <Button
                                                    variant="ghost"
                                                    className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                                                    onClick={() => handleSort("total")}
                                                >
                                                    Amount
                                                    {getSortIcon("total")}
                                                </Button>
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4 px-4 text-left">
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                                                onClick={() => handleSort("createdAt")}
                                            >
                                                Order Date
                                                {getSortIcon("createdAt")}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4 px-4 text-left">
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                                                onClick={() => handleSort("deliveryDate")}
                                            >
                                                Delivery
                                                {getSortIcon("deliveryDate")}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4 px-4 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground py-16">
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mr-4"></div>
                                                    <span className="text-gray-600 font-medium">Loading orders...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground py-16">
                                                <div className="flex flex-col items-center">
                                                    <Package className="w-12 h-12 text-gray-300 mb-4" />
                                                    <span className="text-gray-500 font-medium text-lg">No orders found</span>
                                                    <span className="text-gray-400 text-sm mt-1">Try adjusting your filters or search criteria</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.map((order, index) => (
                                        <TableRow
                                            key={order.id}
                                            className={`cursor-pointer hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100 group ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                            }`}
                                            onClick={(e) => {
                                                const target = e.target as HTMLElement;
                                                if (target.closest('[role="combobox"]') || target.closest('[role="option"]') || target.closest('.select-trigger') || target.closest('[data-radix-menu-trigger]')) {
                                                    return;
                                                }
                                                router.push(`/admin/orders/${order.id}`);
                                            }}
                                        >
                                            <TableCell className="py-4 px-4">
                                                <div className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200 whitespace-nowrap">
                                                    #{order.orderNumber || "N/A"}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="py-4 px-4">
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-gray-900 text-sm">
                                                        {order.user.fullName}
                                                    </div>
                                                    <div className="text-xs text-gray-600 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {formatPhoneNumber(order.user.phone)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="py-4 px-4">
                                                <Select 
                                                    value={order.status} 
                                                    onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                                                    disabled={updatingStatus === order.id}
                                                >
                                                    <SelectTrigger className="w-28 h-8 select-trigger border-gray-300 bg-white shadow-sm hover:border-gray-400 transition-colors text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ORDER_STATUSES.map(statusOption => (
                                                            <SelectItem key={statusOption} value={statusOption} className="text-xs">
                                                                {capitalize(statusOption)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            
                                            <TableCell className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                                                    (order as any).orderType === 'delivery' 
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}>
                                                    {(order as any).orderType === 'delivery' ? (
                                                        <Truck className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <Package className="w-3 h-3 mr-1" />
                                                    )}
                                                    {capitalize((order as any).orderType || "N/A")}
                                                </span>
                                            </TableCell>
                                            
                                            <TableCell className="py-4 px-4 text-right">
                                                <div className="space-y-1">
                                                    <div className="font-bold text-sm text-gray-900 whitespace-nowrap">
                                                        {formatCurrency(order.total)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded text-center whitespace-nowrap">
                                                        {capitalize((order as any).paymentMethod || "N/A")}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="py-4 px-4">
                                                <div className="space-y-1">
                                                    <div className="text-xs font-medium text-gray-900 whitespace-nowrap">
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                                        <Clock className="w-3 h-3" />
                                                        {moment(order.createdAt).format('HH:mm')}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="py-4 px-4">
                                                {order.deliveryDate ? (
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-medium text-gray-900 bg-green-50 px-2 py-1 rounded border border-green-200 whitespace-nowrap">
                                                            {formatDateOnly(order.deliveryDate)}
                                                        </div>
                                                        <div className="text-xs text-gray-600 flex items-center gap-1 truncate max-w-24">
                                                            <MapPin className="w-3 h-3 flex-shrink-0" />
                                                            <span className="truncate">{order.address?.city || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
                                                        Not scheduled
                                                    </div>
                                                )}
                                            </TableCell>
                                            
                                            <TableCell
                                                className="py-4 px-4 text-center"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 p-0 hover:bg-gray-100 border border-gray-200 shadow-sm group-hover:border-gray-300 transition-all"
                                                        >
                                                            <MoreVertical className="h-3 w-3 text-gray-600" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 shadow-lg">
                                                        <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)} className="cursor-pointer">
                                                            <Package className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {/* TODO: implement edit */}} className="cursor-pointer">
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Order
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {/* TODO: implement delete */}} className="text-red-600 cursor-pointer">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    
                    {/* Enhanced Pagination */}
                    <EnhancedPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
