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
import { Order, ORDER_STATUS_FILTERS, ORDER_STATUSES } from "./types";
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { capitalize, formatCurrency, formatPhoneNumber, formatDate, formatDateOnly } from "@/lib/utils/commonFunctions";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
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
                // Map orders to use user.fullName and user.phone
                const orders = (Array.isArray(data) ? data : data.orders || []).map((order: Order) => ({
                    ...order,
                    fullName: order.user?.fullName || "",
                    phone: order.user?.phone || "",
                }));
                setOrders(orders);
            })
            .catch(() => toast.error("Failed to fetch orders"))
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

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
            order.user.phone.includes(search);
        const matchesStatus = status === "all" || order.status?.toUpperCase() === status.toUpperCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
            </div>
            
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <Input
                            placeholder="Search by customer name or phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                        <Tabs value={status} onValueChange={setStatus} className="w-full md:w-auto">
                            <TabsList>
                                {ORDER_STATUS_FILTERS.map(s => (
                                    <TabsTrigger 
                                        key={s} 
                                        value={s} 
                                        className="cursor-pointer text-xs sm:text-sm"
                                    >
                                        {capitalize(s)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                    
                    {/* Mobile Card View */}
                    <div className="block lg:hidden space-y-4">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                {loading ? "Loading..." : "No orders found."}
                            </div>
                        ) : (
                            filteredOrders.map(order => (
                                <div
                                    key={order.id}
                                    className="bg-white border rounded-lg p-4 space-y-3 hover:bg-gray-50 cursor-pointer"
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
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">{order.user.fullName}</p>
                                            <p className="text-xs text-gray-500">{formatPhoneNumber(order.user.phone)}</p>
                                        </div>
                                        <div className="text-right space-y-2">
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
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="text-gray-500">Order ID:</span>
                                            <p className="font-mono truncate">{order.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Total:</span>
                                            <p className="font-semibold">{formatCurrency(order.total)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Date:</span>
                                            <p>{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Delivery:</span>
                                            <p>{order.deliveryDate ? formatDateOnly(order.deliveryDate) : "Not scheduled"}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Order Date</TableHead>
                                    <TableHead>Delivery Date</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                                            {loading ? "Loading..." : "No orders found."}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredOrders.map(order => (
                                    <TableRow
                                        key={order.id}
                                        className="cursor-pointer hover:bg-muted"
                                        onClick={(e) => {
                                            // Don't navigate if clicking on the select dropdown or actions menu
                                            const target = e.target as HTMLElement;
                                            if (target.closest('[role="combobox"]') || target.closest('[role="option"]') || target.closest('.select-trigger') || target.closest('[data-radix-menu-trigger]')) {
                                                return;
                                            }
                                            router.push(`/admin/orders/${order.id}`);
                                        }}
                                    >
                                        <TableCell className="max-w-[120px] truncate font-mono text-sm">{order.id}</TableCell>
                                        <TableCell>{order.user.fullName}</TableCell>
                                        <TableCell>{formatPhoneNumber(order.user.phone)}</TableCell>
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
                                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                                        <TableCell>
                                            {order.deliveryDate ? (
                                                <div className="flex items-center gap-2">
                                                    <span>{formatDateOnly(order.deliveryDate)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Not scheduled</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{order.address?.city || "N/A"}</TableCell>
                                        <TableCell
                                            className="text-right space-x-2"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="ghost">
                                                        <MoreVertical size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {/* TODO: implement edit */}}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {/* TODO: implement delete */}}>
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
