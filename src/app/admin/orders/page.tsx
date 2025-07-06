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
        adminApiFetch("/api/admin/orders", {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
        })
            .then(res => res && res.json())
            .then(data => {
                setOrders(Array.isArray(data) ? data : data.orders || []);
            })
            .catch(() => toast.error("Failed to fetch orders"))
            .finally(() => setLoading(false));
    }, [token]);

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customerName.toLowerCase().includes(search.toLowerCase()) ||
            order.customerPhone.includes(search);
        const matchesStatus = status === "all" || order.status === status;
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
                                    <TabsTrigger key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</TabsTrigger>
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
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            {loading ? "Loading..." : "No orders found."}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell>{order.customerPhone}</TableCell>
                                        <TableCell>{order.status}</TableCell>
                                        <TableCell>${order.total.toFixed(2)}</TableCell>
                                        <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                                View
                                            </Button>
                                            {/* Add status update or delete actions here if needed */}
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
