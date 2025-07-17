"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { userStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { Order, ORDER_STATUSES } from "../orders/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar, Package, Truck, Clock, MapPin, Map as MapIcon } from "lucide-react";
import { capitalize, formatCurrency, formatPhoneNumber, formatDateOnly, formatOrderId } from "@/lib/utils/commonFunctions";

export default function DeliveryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const token = userStore((s) => s.token);
    const adminApiFetch = useAdminApi();
    const router = useRouter();

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        adminApiFetch("/api/admin/orders")
            .then(res => res && res.json())
            .then(data => {
                // Filter only orders that have delivery dates and are not cancelled
                const deliveryOrders = (Array.isArray(data) ? data : data.orders || [])
                    .filter((order: Order) => order.deliveryDate && order.status !== 'CANCELLED')
                    .map((order: Order) => ({
                        ...order,
                        fullName: order.user?.fullName || "",
                        phone: order.user?.phone || "",
                    }));
                setOrders(deliveryOrders);
            })
            .catch(() => toast.error("Failed to fetch delivery orders"))
            .finally(() => setLoading(false));
    }, [token, adminApiFetch]);

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
                        ? { ...order, status: newStatus.toUpperCase() }
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

    const handleMapView = (ordersList: Order[], title: string) => {
        // Filter orders that have valid addresses
        const ordersWithAddresses = ordersList.filter(order => 
            order.address?.street && order.address?.city
        );
        
        if (ordersWithAddresses.length === 0) {
            toast.error("No orders with valid addresses found for mapping");
            return;
        }
        
        // Determine date filter based on title
        let dateFilter = 'today';
        if (title.toLowerCase().includes('tomorrow')) {
            dateFilter = 'tomorrow';
        } else if (title.toLowerCase().includes('week')) {
            dateFilter = 'week';
        }
        
        // Navigate to map page with query parameters
        router.push(`/admin/delivery/map?date=${dateFilter}&title=${encodeURIComponent(title)}`);
    };

    // Helper function to format date for display (date only, no time)
    const formatDeliveryDate = (date: string | Date | null | undefined) => {
        if (!date) return 'N/A';
        return formatDateOnly(date);
    };

    // Helper function to get date in YYYY-MM-DD format using local time
    const getDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper function to extract date part from delivery date string (handles UTC dates)
    const getDeliveryDateString = (deliveryDate: string | Date | null | undefined) => {
        if (!deliveryDate) return '';
        if (typeof deliveryDate === 'string' && deliveryDate.includes('T')) {
            // Extract just the date part to avoid timezone conversion
            // "2025-07-17T00:00:00.000Z" -> "2025-07-17"
            return deliveryDate.split('T')[0];
        }
        const d = new Date(deliveryDate);
        return getDateString(d);
    };

    // Get today, tomorrow, and this week dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)

    const todayString = getDateString(today);
    const tomorrowString = getDateString(tomorrow);

    // Filter orders by delivery date
    const todayOrders = orders.filter(order => {
        if (!order.deliveryDate) return false;
        const deliveryDateString = getDeliveryDateString(order.deliveryDate);
        return deliveryDateString === todayString;
    }).sort((a, b) => new Date(a.deliveryDate!).getTime() - new Date(b.deliveryDate!).getTime());

    const tomorrowOrders = orders.filter(order => {
        if (!order.deliveryDate) return false;
        const deliveryDateString = getDeliveryDateString(order.deliveryDate);
        return deliveryDateString === tomorrowString;
    }).sort((a, b) => new Date(a.deliveryDate!).getTime() - new Date(b.deliveryDate!).getTime());

    const thisWeekOrders = orders.filter(order => {
        if (!order.deliveryDate) return false;
        const deliveryDateString = getDeliveryDateString(order.deliveryDate);
        const deliveryDate = new Date(deliveryDateString + 'T00:00:00'); // Local date
        const startOfWeekLocal = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
        const endOfWeekLocal = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate());
        return deliveryDate >= startOfWeekLocal && deliveryDate <= endOfWeekLocal;
    }).sort((a, b) => new Date(a.deliveryDate!).getTime() - new Date(b.deliveryDate!).getTime());

    // Filter by search
    const filterOrdersBySearch = (ordersList: Order[]) => {
        if (!search) return ordersList;
        return ordersList.filter(order =>
            order.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
            order.user.phone.includes(search) ||
            order.address?.city?.toLowerCase().includes(search.toLowerCase()) ||
            order.address?.street?.toLowerCase().includes(search.toLowerCase())
        );
    };

    const renderOrderTable = (ordersList: Order[], title: string, icon: React.ReactNode) => {
        const filteredOrders = filterOrdersBySearch(ordersList);

        return (
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            {icon}
                            {title}
                            <Badge variant="secondary" className="ml-2">
                                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                            </Badge>
                        </CardTitle>
                        {filteredOrders.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMapView(filteredOrders, title)}
                                className="flex items-center gap-2"
                            >
                                <MapIcon className="w-4 h-4" />
                                Map View
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Delivery Date</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                            {loading ? "Loading..." : "No deliveries scheduled."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map(order => (
                                        <TableRow
                                            key={order.id}
                                            className="cursor-pointer hover:bg-muted"
                                            onClick={(e) => {
                                                const target = e.target as HTMLElement;
                                                if (target.closest('[role="combobox"]') || target.closest('[role="option"]') || target.closest('.select-trigger')) {
                                                    return;
                                                }
                                                router.push(`/admin/orders/${order.id}`);
                                            }}
                                        >
                                            <TableCell className="max-w-[120px] truncate font-mono text-sm">{formatOrderId(order.id)}</TableCell>
                                            <TableCell className="font-medium">{order.user.fullName}</TableCell>
                                            <TableCell>{formatPhoneNumber(order.user.phone)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    {formatDeliveryDate(order.deliveryDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                    <div className="truncate">
                                                        <div className="text-sm">{order.address?.street || 'N/A'}</div>
                                                        <div className="text-xs text-gray-500">{order.address?.city || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select 
                                                    value={order.status} 
                                                    onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                                                    disabled={updatingStatus === order.id}
                                                >
                                                    <SelectTrigger className="w-32 h-8 text-xs select-trigger">
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
                                            <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/orders/${order.id}`);
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck className="w-6 h-6" />
                        Delivery Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage and track order deliveries</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 hidden sm:block">
                        Total scheduled: {orders.length} deliveries
                    </div>
                    <Input
                        placeholder="Search by customer, phone, or address..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
            </div>

            <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="today" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Today ({filterOrdersBySearch(todayOrders).length})
                    </TabsTrigger>
                    <TabsTrigger value="tomorrow" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Tomorrow ({filterOrdersBySearch(tomorrowOrders).length})
                    </TabsTrigger>
                    <TabsTrigger value="week" className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        This Week ({filterOrdersBySearch(thisWeekOrders).length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="mt-6">
                    {renderOrderTable(todayOrders, "Today's Deliveries", <Clock className="w-5 h-5 text-blue-600" />)}
                </TabsContent>

                <TabsContent value="tomorrow" className="mt-6">
                    {renderOrderTable(tomorrowOrders, "Tomorrow's Deliveries", <Calendar className="w-5 h-5 text-green-600" />)}
                </TabsContent>

                <TabsContent value="week" className="mt-6">
                    {renderOrderTable(thisWeekOrders, "This Week's Deliveries", <Package className="w-5 h-5 text-purple-600" />)}
                </TabsContent>
            </Tabs>
        </div>
    );
}
