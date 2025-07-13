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
import { Order, ORDER_STATUSES } from "./types";
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { capitalize, formatCurrency, formatPhoneNumber, formatDate } from "@/lib/utils/commonFunctions";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [loading, setLoading] = useState(false);
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
    }, [token]);

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
            order.user.phone.includes(search);
        const matchesStatus = status === "all" || order.status?.toLowerCase() === status;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Orders</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Order Management</CardTitle>
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
                                {ORDER_STATUSES.map(s => (
                                    <TabsTrigger key={s} value={s} className="cursor-pointer">{capitalize(s)}</TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                                            {loading ? "Loading..." : "No orders found."}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredOrders.map(order => (
                                    <TableRow
                                        key={order.id}
                                        className="cursor-pointer hover:bg-muted"
                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                    >
                                        <TableCell className="max-w-[120px] truncate">{order.id}</TableCell>
                                        <TableCell>{order.user.fullName}</TableCell>
                                        <TableCell>{formatPhoneNumber(order.user.phone)}</TableCell>
                                        <TableCell>{capitalize(order.status)}</TableCell>
                                        <TableCell>{formatCurrency(order.total)}</TableCell>
                                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                                        <TableCell>{order.address?.city || ""}</TableCell>
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
