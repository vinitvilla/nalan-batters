"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { userStore } from "@/store/userStore";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { Order, ORDER_STATUSES } from "../types";

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params?.orderId as string;
    const token = userStore((s) => s.token);
    const adminApiFetch = useAdminApi();
    const [order, setOrder] = useState<Order | null>(null);
    const [status, setStatus] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!orderId || !token) return;
        setLoading(true);
        adminApiFetch(`/api/admin/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
        })
            .then(res => res && res.json())
            .then(data => {
                setOrder(data?.order || data);
                setStatus(data?.order?.status || data?.status || "");
            })
            .catch(() => toast.error("Failed to fetch order details"))
            .finally(() => setLoading(false));
    }, [orderId, token]);

    const handleStatusChange = (value: string) => setStatus(value);

    const handleSave = async () => {
        if (!orderId || !token) return;
        setSaving(true);
        try {
            const res = await adminApiFetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ status }),
            });
            if (!res || !res.ok) throw new Error();
            toast.success("Order status updated");
        } catch {
            toast.error("Failed to update status");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!order) return <div className="p-8">Order not found.</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 p-4">
            <Button variant="ghost" onClick={() => router.back()} className="mb-2">&larr; Back</Button>
            <Card>
                <CardHeader>
                    <CardTitle>Order #{order.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div><b>Customer:</b> {order.customerName}</div>
                        <div><b>Phone:</b> {order.customerPhone}</div>
                        <div><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                        <b>Status:</b>{" "}
                        <Select value={status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {ORDER_STATUSES.map(s => (
                                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSave} disabled={saving || status === order.status} className="ml-2">
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                    <div>
                        <b>Items:</b>
                        <Table className="mt-2">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map(item => (
                                    <TableRow key={item.productId}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>${item.price.toFixed(2)}</TableCell>
                                        <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="text-right font-bold text-lg">
                        Total: ${order.total.toFixed(2)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
