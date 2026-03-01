"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { userStore } from "@/store/userStore";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { AdminOrderResponse } from "@/types/order";
import type { OrderStatus } from "@/generated/prisma";
import { StatusBadge } from "@/components/shared";
import {
    Truck,
    MapPin,
    Phone,
    User,
    Calendar,
    AlertTriangle,
    RefreshCw,
    List,
    Map as MapIcon,
    CheckCircle2,
    Search,
    Package,
} from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatCurrency, formatPhoneNumber, formatDate } from "@/lib/utils/commonFunctions";
import moment from "moment";
import DeliveryMapView from "../../../components/DeliveryMapView";

export default function DeliveryPage() {
    const [todayOrders, setTodayOrders] = useState<AdminOrderResponse[]>([]);
    const [tomorrowOrders, setTomorrowOrders] = useState<AdminOrderResponse[]>([]);
    const [selectedDateOrders, setSelectedDateOrders] = useState<AdminOrderResponse[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'list' | 'map'>('list');
    const [drivers, setDrivers] = useState<{ id: string, fullName: string, phone: string }[]>([]);
    const [assigningDriver, setAssigningDriver] = useState<string | null>(null);

    const token = userStore((s) => s.token);
    const adminApiFetch = useAdminApi();

    const filterOrders = (orders: AdminOrderResponse[]) => {
        if (!search) return orders;
        const searchLower = search.toLowerCase();
        return orders.filter(order =>
            order.user?.fullName?.toLowerCase().includes(searchLower) ||
            order.user?.phone?.toLowerCase().includes(searchLower) ||
            order.orderNumber?.toLowerCase().includes(searchLower) ||
            order.address?.street?.toLowerCase().includes(searchLower) ||
            order.address?.city?.toLowerCase().includes(searchLower)
        );
    };

    const fetchTodayOrders = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const today = moment().format('YYYY-MM-DD');
            const response = await adminApiFetch(`/api/admin/orders?deliveryDate=${today}&limit=1000`);
            const data = await response?.json();
            const orders = (Array.isArray(data) ? data : data?.orders || data?.data || [])
                .filter((order: AdminOrderResponse) =>
                    order.deliveryDate &&
                    order.address &&
                    order.status !== 'CANCELLED' &&
                    order.deliveryType !== 'PICKUP'
                )
                .map((order: AdminOrderResponse) => ({
                    ...order,
                    fullName: order.user?.fullName || "",
                    phone: order.user?.phone || "",
                }));
            setTodayOrders(orders);
        } catch {
            toast.error("Failed to fetch today's deliveries");
        } finally {
            setLoading(false);
        }
    }, [token, adminApiFetch]);

    const fetchTomorrowOrders = useCallback(async () => {
        if (!token) return;
        try {
            const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
            const response = await adminApiFetch(`/api/admin/orders?deliveryDate=${tomorrow}&limit=1000`);
            const data = await response?.json();
            const orders = (Array.isArray(data) ? data : data?.orders || data?.data || [])
                .filter((order: AdminOrderResponse) =>
                    order.deliveryDate &&
                    order.address &&
                    order.status !== 'CANCELLED' &&
                    order.deliveryType !== 'PICKUP'
                )
                .map((order: AdminOrderResponse) => ({
                    ...order,
                    fullName: order.user?.fullName || "",
                    phone: order.user?.phone || "",
                }));
            setTomorrowOrders(orders);
        } catch {
            toast.error("Failed to fetch tomorrow's deliveries");
        }
    }, [token, adminApiFetch]);

    const fetchDrivers = useCallback(async () => {
        if (!token) return;
        try {
            const response = await adminApiFetch('/api/admin/users/drivers');
            const data = await response?.json();
            if (Array.isArray(data)) {
                setDrivers(data);
            }
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        }
    }, [token, adminApiFetch]);

    const handleAssignDriver = async (orderId: string, driverId: string) => {
        if (!token) return;
        setAssigningDriver(orderId);
        try {
            const res = await adminApiFetch('/api/admin/orders/assign', {
                method: 'POST',
                body: JSON.stringify({ orderId, driverId }),
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });

            if (!res || !res.ok) throw new Error("Failed to assign driver");

            const updateOrder = (orders: AdminOrderResponse[]) =>
                orders.map(order =>
                    order.id === orderId
                        ? { ...order, driverId, driver: drivers.find(d => d.id === driverId) }
                        : order
                );

            setTodayOrders(updateOrder);
            setTomorrowOrders(updateOrder);
            setSelectedDateOrders(updateOrder);

            toast.success("Driver assigned successfully");
        } catch {
            toast.error("Failed to assign driver");
        } finally {
            setAssigningDriver(null);
        }
    };

    const fetchOrdersForDate = useCallback(async (date: string) => {
        if (!token || !date) return;
        setLoading(true);
        try {
            const response = await adminApiFetch(`/api/admin/orders?deliveryDate=${date}&limit=1000`);
            const data = await response?.json();
            const orders = (Array.isArray(data) ? data : data?.orders || data?.data || [])
                .filter((order: AdminOrderResponse) =>
                    order.deliveryDate &&
                    order.address &&
                    order.status !== 'CANCELLED' &&
                    order.deliveryType !== 'PICKUP'
                )
                .map((order: AdminOrderResponse) => ({
                    ...order,
                    fullName: order.user?.fullName || "",
                    phone: order.user?.phone || "",
                }));
            setSelectedDateOrders(orders);
        } catch {
            toast.error("Failed to fetch deliveries for selected date");
        } finally {
            setLoading(false);
        }
    }, [token, adminApiFetch]);

    useEffect(() => {
        if (!token) return;
        fetchTodayOrders();
        fetchTomorrowOrders();
        fetchDrivers();
    }, [token, fetchTodayOrders, fetchTomorrowOrders, fetchDrivers]);

    useEffect(() => {
        if (selectedDate) {
            fetchOrdersForDate(selectedDate);
        }
    }, [selectedDate, token, fetchOrdersForDate]);

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

            const updateOrder = (orders: AdminOrderResponse[]) =>
                orders.map(order =>
                    order.id === orderId
                        ? { ...order, status: newStatus.toUpperCase() as OrderStatus }
                        : order
                );

            setTodayOrders(updateOrder);
            setTomorrowOrders(updateOrder);
            setSelectedDateOrders(updateOrder);

            toast.success("Order status updated successfully");
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    const formatDeliveryDate = (date: string | Date | null | undefined) => {
        if (!date) return 'N/A';
        return moment(date).format('MMM DD, YYYY');
    };

    const pendingCount = [...todayOrders, ...tomorrowOrders, ...selectedDateOrders]
        .filter(order => order.status === 'PENDING').length;

    const deliveredTodayCount = todayOrders.filter(order => order.status === 'DELIVERED').length;

    // View Toggle
    const ViewToggle = () => (
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <Button
                variant={currentView === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('list')}
                className={`cursor-pointer h-8 px-3 gap-1.5 transition-all ${currentView === 'list'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-transparent'
                    }`}
            >
                <List className="w-3.5 h-3.5" />
                List
            </Button>
            <Button
                variant={currentView === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('map')}
                className={`cursor-pointer h-8 px-3 gap-1.5 transition-all ${currentView === 'map'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-transparent'
                    }`}
            >
                <MapIcon className="w-3.5 h-3.5" />
                Map
            </Button>
        </div>
    );

    // Loading skeleton rows
    const LoadingRows = () => (
        <>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                        <TableCell key={j} className="py-4 px-4">
                            <div className="h-4 bg-gray-100 rounded w-full" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );

    // Empty state
    const EmptyState = ({ message = "No delivery orders found" }: { message?: string }) => (
        <div className="flex flex-col items-center justify-center py-16">
            <Truck className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium text-lg">{message}</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or date selection</p>
        </div>
    );

    // Mobile delivery card
    const MobileDeliveryCard = ({ order }: { order: AdminOrderResponse }) => (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg inline-block border border-blue-200">
                        #{order.orderNumber || order.id.slice(-8)}
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 text-sm">{order.user?.fullName || 'Unknown'}</span>
                </div>
                {order.user?.phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{formatPhoneNumber(order.user.phone)}</span>
                    </div>
                )}
                <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-600">
                        {order.address?.street && <div>{order.address.street}</div>}
                        <div>{order.address?.city}, {order.address?.province} {order.address?.postal}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{formatDeliveryDate(order.deliveryDate)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span>
                <div className="flex items-center gap-2">
                    <Select
                        disabled={assigningDriver === order.id}
                        value={order.driverId || "unassigned"}
                        onValueChange={(driverId) => handleAssignDriver(order.id, driverId)}
                    >
                        <SelectTrigger className="w-36 h-8 text-xs border-gray-300">
                            <SelectValue placeholder="Assign Driver" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {drivers.map(driver => (
                                <SelectItem key={driver.id} value={driver.id}>{driver.fullName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        disabled={updatingStatus === order.id}
                        onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                    >
                        <SelectTrigger className="w-32 h-8 text-xs border-gray-300 cursor-pointer">
                            <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );

    // Desktop table
    const renderOrdersTable = (orders: AdminOrderResponse[]) => {
        const filteredOrders = filterOrders(orders);

        return (
            <>
                {/* Mobile card view */}
                <div className="block lg:hidden space-y-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
                            <span className="text-gray-600 font-medium">Loading deliveries...</span>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <EmptyState />
                    ) : (
                        filteredOrders.map(order => (
                            <MobileDeliveryCard key={order.id} order={order} />
                        ))
                    )}
                </div>

                {/* Desktop table view */}
                <div className="hidden lg:block">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                        <Table className="min-w-[900px]">
                            <TableHeader>
                                <TableRow className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                                    <TableHead className="font-semibold text-gray-700 py-4 px-4">Order #</TableHead>
                                    <TableHead className="font-semibold text-gray-700 py-4 px-4">Customer</TableHead>
                                    <TableHead className="font-semibold text-gray-700 py-4 px-4">Delivery Address</TableHead>
                                    <TableHead className="font-semibold text-gray-700 py-4 px-4">Delivery Date</TableHead>
                                    <TableHead className="font-semibold text-gray-700 py-4 px-4">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-700 py-4 px-4">Driver</TableHead>
                                    <TableHead className="font-semibold text-gray-700 py-4 px-4 text-right">Total</TableHead>
                                    <TableHead className="font-semibold text-gray-700 py-4 px-4 text-center">Update Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <LoadingRows />
                                ) : filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-0">
                                            <EmptyState />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order, index) => (
                                        <TableRow
                                            key={order.id}
                                            className={`border-b border-gray-100 hover:bg-blue-50/40 transition-all duration-150 group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                                }`}
                                        >
                                            <TableCell className="py-4 px-4">
                                                <div className="space-y-1">
                                                    <div className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200 whitespace-nowrap inline-block">
                                                        #{order.orderNumber || order.id.slice(-8)}
                                                    </div>
                                                    <p className="text-xs text-gray-500 whitespace-nowrap">
                                                        {formatDate(order.createdAt)}
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-4 px-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                        <span className="font-semibold text-gray-900 text-sm">
                                                            {order.user?.fullName || 'Unknown'}
                                                        </span>
                                                    </div>
                                                    {order.user?.phone && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                            <span className="text-xs text-gray-500">
                                                                {formatPhoneNumber(order.user.phone)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-4 px-4">
                                                <div className="flex items-start gap-1.5 max-w-[200px]">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    <div className="text-sm text-gray-600">
                                                        {order.address?.street && (
                                                            <div className="font-medium text-gray-800 truncate max-w-[170px]">
                                                                {order.address.street}
                                                                {order.address.unit && `, Unit ${order.address.unit}`}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-500 whitespace-nowrap">
                                                            {order.address?.city}, {order.address?.province} {order.address?.postal}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-4 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                                        {formatDeliveryDate(order.deliveryDate)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-4 px-4">
                                                <StatusBadge status={order.status} />
                                            </TableCell>

                                            <TableCell className="py-4 px-4">
                                                <Select
                                                    disabled={assigningDriver === order.id}
                                                    value={order.driverId || "unassigned"}
                                                    onValueChange={(driverId) => handleAssignDriver(order.id, driverId)}
                                                >
                                                    <SelectTrigger className={`w-36 h-8 text-xs border-gray-300 bg-white shadow-sm hover:border-gray-400 transition-colors cursor-pointer ${order.driverId ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        <SelectValue placeholder="Assign driver" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unassigned" className="text-gray-400">
                                                            Unassigned
                                                        </SelectItem>
                                                        {drivers.map(driver => (
                                                            <SelectItem key={driver.id} value={driver.id}>
                                                                {driver.fullName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            <TableCell className="py-4 px-4 text-right">
                                                <span className="font-bold text-sm text-gray-900 whitespace-nowrap">
                                                    {formatCurrency(order.total)}
                                                </span>
                                            </TableCell>

                                            <TableCell className="py-4 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Select
                                                        disabled={updatingStatus === order.id}
                                                        onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                                                    >
                                                        <SelectTrigger className="w-32 h-8 text-xs border-gray-300 bg-white shadow-sm hover:border-gray-400 transition-colors cursor-pointer">
                                                            <SelectValue placeholder="Update Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="PENDING" className="cursor-pointer">Pending</SelectItem>
                                                            <SelectItem value="CONFIRMED" className="cursor-pointer">Confirmed</SelectItem>
                                                            <SelectItem value="SHIPPED" className="cursor-pointer">Shipped</SelectItem>
                                                            <SelectItem value="DELIVERED" className="cursor-pointer">Delivered</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {updatingStatus === order.id && (
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Delivery Management</h1>
                <p className="text-gray-600">Manage and track order deliveries, assign drivers, and monitor progress</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="shadow-sm border border-gray-200 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Today&apos;s Deliveries
                        </CardTitle>
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-3xl font-bold text-gray-900">{todayOrders.length}</div>
                        <p className="text-xs text-gray-500 mt-1">{moment().format('dddd, MMM DD')}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Tomorrow&apos;s Deliveries
                        </CardTitle>
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                            <Truck className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-3xl font-bold text-gray-900">{tomorrowOrders.length}</div>
                        <p className="text-xs text-gray-500 mt-1">{moment().add(1, 'day').format('dddd, MMM DD')}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Pending Orders
                        </CardTitle>
                        <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-3xl font-bold text-gray-900">{pendingCount}</div>
                        <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Delivered Today
                        </CardTitle>
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-3xl font-bold text-gray-900">{deliveredTodayCount}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {todayOrders.length > 0
                                ? `${Math.round((deliveredTodayCount / todayOrders.length) * 100)}% completion`
                                : 'No orders today'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="border-b border-gray-200 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="text-xl font-bold text-gray-900">Deliveries</CardTitle>
                        <div className="relative max-w-xs w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by name, phone, order #..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 border-gray-300 shadow-sm focus:border-blue-500"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Tabs defaultValue="today" className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 pt-4 pb-3 border-b border-gray-100">
                            <TabsList className="bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                                <TabsTrigger
                                    value="today"
                                    className="cursor-pointer text-sm font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all gap-2 flex items-center"
                                >
                                    <Calendar className="w-3.5 h-3.5" />
                                    Today
                                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                        {todayOrders.length}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="tomorrow"
                                    className="cursor-pointer text-sm font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all gap-2 flex items-center"
                                >
                                    <Truck className="w-3.5 h-3.5" />
                                    Tomorrow
                                    <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                        {tomorrowOrders.length}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="custom"
                                    className="cursor-pointer text-sm font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all gap-2 flex items-center"
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                    Custom Date
                                    {selectedDateOrders.length > 0 && (
                                        <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                            {selectedDateOrders.length}
                                        </span>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                            <ViewToggle />
                        </div>

                        {/* Today Tab */}
                        <TabsContent value="today" className="mt-0">
                            <div className="px-6 py-3 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{moment().format('dddd, MMMM DD, YYYY')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        {filterOrders(todayOrders).length} shown
                                    </span>
                                </div>
                            </div>
                            {currentView === 'list' ? (
                                <div className="p-4 sm:p-6">
                                    {renderOrdersTable(todayOrders)}
                                </div>
                            ) : (
                                <div className="h-[300px] sm:h-[450px] lg:h-[600px] relative">
                                    <DeliveryMapView
                                        orders={todayOrders.filter(order => order.address && order.status !== 'CANCELLED')}
                                        title="Today's Deliveries"
                                    />
                                </div>
                            )}
                        </TabsContent>

                        {/* Tomorrow Tab */}
                        <TabsContent value="tomorrow" className="mt-0">
                            <div className="px-6 py-3 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Truck className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{moment().add(1, 'day').format('dddd, MMMM DD, YYYY')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        {filterOrders(tomorrowOrders).length} shown
                                    </span>
                                </div>
                            </div>
                            {currentView === 'list' ? (
                                <div className="p-4 sm:p-6">
                                    {renderOrdersTable(tomorrowOrders)}
                                </div>
                            ) : (
                                <div className="h-[300px] sm:h-[450px] lg:h-[600px] relative">
                                    <DeliveryMapView
                                        orders={tomorrowOrders.filter(order => order.address && order.status !== 'CANCELLED')}
                                        title="Tomorrow's Deliveries"
                                    />
                                </div>
                            )}
                        </TabsContent>

                        {/* Custom Date Tab */}
                        <TabsContent value="custom" className="mt-0">
                            <div className="px-6 py-3 bg-gray-50/60 border-b border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">Select delivery date:</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="h-8 text-sm border-gray-300 w-auto"
                                        />
                                        {selectedDate && (
                                            <span className="text-sm text-gray-600 font-medium">
                                                {moment(selectedDate).format('dddd, MMMM DD, YYYY')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {!selectedDate ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Calendar className="w-14 h-14 text-gray-200 mb-4" />
                                    <p className="text-gray-500 font-medium text-lg">Select a date to view deliveries</p>
                                    <p className="text-gray-400 text-sm mt-1">Use the date picker above to choose a delivery date</p>
                                </div>
                            ) : currentView === 'list' ? (
                                <div className="p-4 sm:p-6">
                                    {renderOrdersTable(selectedDateOrders)}
                                </div>
                            ) : (
                                <div className="h-[300px] sm:h-[450px] lg:h-[600px] relative">
                                    <DeliveryMapView
                                        orders={selectedDateOrders.filter(order => order.address && order.status !== 'CANCELLED')}
                                        title={`Deliveries for ${moment(selectedDate).format('MMM DD, YYYY')}`}
                                    />
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
