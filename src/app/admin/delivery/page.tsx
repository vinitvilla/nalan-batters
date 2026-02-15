"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { userStore } from "@/store/userStore";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { AdminOrderResponse, ORDER_STATUSES } from "@/types/order";
import type { OrderStatus } from "@/generated/prisma";
import {
    Truck,
    MapPin,
    Clock,
    Package,
    Phone,
    User,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    RefreshCw,
    List,
    Map as MapIcon
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

    // Filter orders by search term
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

    // Fetch orders for today
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

    // Fetch orders for tomorrow
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

    // Fetch drivers
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

    // Assign driver
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

    // Fetch orders for selected date
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

            // Update the order in all relevant state arrays
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



    // Get status badge variant
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'CONFIRMED':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle2 className="w-3 h-3 mr-1" />Confirmed</Badge>;
            case 'SHIPPED':
                return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200"><Truck className="w-3 h-3 mr-1" />Shipped</Badge>;
            case 'DELIVERED':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Package className="w-3 h-3 mr-1" />Delivered</Badge>;
            case 'CANCELLED':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Format date for display (date only, no time)
    const formatDeliveryDate = (date: string | Date | null | undefined) => {
        if (!date) return 'N/A';
        return moment(date).format('MMM DD, YYYY');
    };

    // Render orders table
    const renderOrdersTable = (orders: AdminOrderResponse[]) => {
        const filteredOrders = filterOrders(orders);

        if (filteredOrders.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No delivery orders found</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Delivery Address</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">#{order.orderNumber || order.id.slice(-8)}</span>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{order.user?.fullName || 'Unknown'}</span>
                                        </div>
                                        {order.user?.phone && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-500">
                                                    {formatPhoneNumber(order.user.phone)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm">
                                            {order.address?.street && <div>{order.address.street}</div>}
                                            {order.address?.unit && <div>Unit: {order.address.unit}</div>}
                                            <div>
                                                {order.address?.city}, {order.address?.province} {order.address?.postal}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{formatDeliveryDate(order.deliveryDate)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(order.status)}
                                </TableCell>
                                <TableCell>
                                    <Select
                                        disabled={assigningDriver === order.id}
                                        value={order.driverId || "unassigned"}
                                        onValueChange={(driverId) => handleAssignDriver(order.id, driverId)}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Assign Driver" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {drivers.map(driver => (
                                                <SelectItem key={driver.id} value={driver.id}>
                                                    {driver.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium">${formatCurrency(order.total)}</span>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        disabled={updatingStatus === order.id}
                                        onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                                    >
                                        <SelectTrigger className="w-32 cursor-pointer">
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
                                        <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    // Reusable View Toggle Component
    const ViewToggle = () => (
        <div className="flex border border-gray-200 rounded-md">
            <Button
                variant={currentView === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('list')}
                className="rounded-r-none cursor-pointer"
            >
                <List className="w-4 h-4 mr-1" />
                List
            </Button>
            <Button
                variant={currentView === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('map')}
                className="rounded-l-none border-l cursor-pointer"
            >
                <MapIcon className="w-4 h-4 mr-1" />
                Map
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Simple Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Truck className="w-6 h-6" />
                                Delivery Management
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Manage and track order deliveries</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <Input
                                placeholder="Search deliveries..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-xs"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                {/* Simple Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today&apos;s Deliveries</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{todayOrders.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {moment().format('dddd, MMM DD')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tomorrow&apos;s Deliveries</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tomorrowOrders.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {moment().add(1, 'day').format('dddd, MMM DD')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {[...todayOrders, ...tomorrowOrders, ...selectedDateOrders]
                                    .filter(order => order.status === 'PENDING').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Requires attention
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Simple Tabs */}
                <Tabs defaultValue="today" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="today" className="flex items-center gap-2 cursor-pointer">
                            <Calendar className="w-4 h-4" />
                            Today ({todayOrders.length})
                        </TabsTrigger>
                        <TabsTrigger value="tomorrow" className="flex items-center gap-2 cursor-pointer">
                            <Truck className="w-4 h-4" />
                            Tomorrow ({tomorrowOrders.length})
                        </TabsTrigger>
                        <TabsTrigger value="custom" className="flex items-center gap-2 cursor-pointer">
                            <MapPin className="w-4 h-4" />
                            Custom Date ({selectedDateOrders.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="today" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Today&apos;s Deliveries - {moment().format('dddd, MMMM DD, YYYY')}
                                    </div>
                                    <ViewToggle />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : currentView === 'list' ? (
                                    renderOrdersTable(todayOrders)
                                ) : (
                                    <div className="h-[600px] relative bg-white rounded-lg border overflow-hidden">
                                        <DeliveryMapView
                                            orders={todayOrders.filter(order => order.address && order.status !== 'CANCELLED')}
                                            title="Today&apos;s Deliveries"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tomorrow" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-5 h-5" />
                                        Tomorrow&apos;s Deliveries - {moment().add(1, 'day').format('dddd, MMMM DD, YYYY')}
                                    </div>
                                    <ViewToggle />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : currentView === 'list' ? (
                                    renderOrdersTable(tomorrowOrders)
                                ) : (
                                    <div className="h-[600px] relative bg-white rounded-lg border overflow-hidden">
                                        <DeliveryMapView
                                            orders={tomorrowOrders.filter(order => order.address && order.status !== 'CANCELLED')}
                                            title="Tomorrow&apos;s Deliveries"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        Custom Date Deliveries
                                    </div>
                                    <ViewToggle />
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="max-w-xs"
                                    />
                                    {selectedDate && (
                                        <span className="text-sm text-gray-600">
                                            - {moment(selectedDate).format('dddd, MMMM DD, YYYY')}
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!selectedDate ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Select a date to view deliveries</p>
                                    </div>
                                ) : loading ? (
                                    <div className="flex justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : currentView === 'list' ? (
                                    renderOrdersTable(selectedDateOrders)
                                ) : (
                                    <div className="h-[600px] relative bg-white rounded-lg border overflow-hidden">
                                        <DeliveryMapView
                                            orders={selectedDateOrders.filter(order => order.address && order.status !== 'CANCELLED')}
                                            title={`Deliveries for ${moment(selectedDate).format('MMM DD, YYYY')}`}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>


            </div>
        </div>
    );
}
