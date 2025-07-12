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
import { Separator } from "@radix-ui/react-separator";
import { Copy } from "lucide-react";
import { capitalize, formatCurrency, formatPhoneNumber, formatAddress } from "@/lib/utils/commonFunctions";

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
                const orderData = data?.order || data;
                setOrder(orderData);
                setStatus(orderData?.status?.toUpperCase() || "");
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
                method: "POST",
                body: JSON.stringify({ status }),
                headers: { "Content-Type": "application/json" },
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
                    <div className="flex items-center gap-2">
                        <CardTitle>#{order.id}</CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                navigator.clipboard.writeText(order.id.toString());
                                toast.success("Order ID copied!");
                            }}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/40 rounded-md p-4 mb-2">
                        <div>
                            <b>Customer:</b>
                            <div className="text-muted-foreground font-medium">{order.user?.fullName || ""}</div>
                        </div>
                        <div>
                            <b>Phone:</b>
                            <div className="text-muted-foreground font-mono">{formatPhoneNumber(order.user?.phone)}</div>
                        </div>
                        <div>
                            <b>Date:</b>
                            <div className="text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
                        </div>
                        <div>
                            <b>Address:</b>
                            <div className="text-muted-foreground font-semibold">{formatAddress(order.address)}</div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-2">
                        <b>Status:</b>{" "}
                        <Select value={status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {ORDER_STATUSES.map(s => (
                                    <SelectItem key={s} value={s}>{capitalize(s)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSave} disabled={saving || status === order.status} className="ml-2">
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                    <div>
                        <Table className="mt-2 rounded-md overflow-hidden border border-muted/40 shadow-sm">
                            <TableHeader className="bg-muted/20">
                                <TableRow>
                                    <TableHead className="font-semibold">Product</TableHead>
                                    <TableHead className="font-semibold text-center">Quantity</TableHead>
                                    <TableHead className="font-semibold text-right">Price</TableHead>
                                    <TableHead className="font-semibold text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map(item => (
                                    <TableRow key={item.productId} className="hover:bg-muted/10">
                                        <TableCell>{item.product?.name}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(item.price)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(Number(item.price) * item.quantity)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="bg-muted/30 rounded-md p-4 mt-6 max-w-sm ml-auto shadow-sm">
                        <div className="flex justify-between mb-2">
                            <span className="font-medium">Tax:</span>
                            <span>{formatCurrency(order.tax)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="font-medium">Surcharges:</span>
                            <span>{formatCurrency(order.surcharges)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="font-medium">Delivery Charges:</span>
                            <span>{formatCurrency(order.deliveryCharges)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="font-medium">Discount:</span>
                            <span className="text-green-700">-{formatCurrency(order.discount)}</span>
                        </div>
                        {order.promoCode && (
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">Promo Code:</span>
                                <span>
                                    <span className="bg-primary/10 px-2 py-0.5 rounded text-primary font-semibold mr-2">{order.promoCode.code}</span>
                                    <span className="text-green-700">-{formatCurrency(order.promoCode.discount)}</span>
                                </span>
                            </div>
                        )}
                        <Separator className="my-4" />
                        <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-primary">{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
