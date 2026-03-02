"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { userStore } from "@/store/userStore";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { AdminOrderResponse } from "@/types/order";
import { ORDER_STATUSES } from "@/constants/order";
import type { OrderStatus } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@radix-ui/react-separator";
import {
    Copy, Calendar, User, Phone, MapPin, Package,
    CreditCard, Clock, ArrowLeft, CheckCircle2,
    AlertCircle, Truck, Save, Tag,
} from "lucide-react";
import { formatCurrency, formatPhoneNumber, formatAddress } from "@/lib/utils/commonFunctions";
import moment from "moment";
import { useUnreadOrderIds } from "@/hooks/useUnreadOrderIds";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
    CONFIRMED: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    SHIPPED: { label: "Shipped", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: <Package className="w-3.5 h-3.5" /> },
    DELIVERED: { label: "Delivered", color: "bg-green-50 text-green-700 border-green-200", icon: <Truck className="w-3.5 h-3.5" /> },
    CANCELLED: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status?.toUpperCase()] ?? STATUS_CONFIG.PENDING;
    return (
        <Badge className={`${cfg.color} border flex items-center gap-1.5 px-2.5 py-1 font-medium text-xs`}>
            {cfg.icon}
            {cfg.label}
        </Badge>
    );
}

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params?.orderId as string;
    const token = userStore((s) => s.token);
    const adminApiFetch = useAdminApi();
    const [order, setOrder] = useState<AdminOrderResponse | null>(null);
    const [status, setStatus] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { markOrderRead } = useUnreadOrderIds();

    // Mark notification as read when order detail is viewed
    useEffect(() => {
        if (orderId) {
            void markOrderRead(orderId);
        }
    }, [orderId, markOrderRead]);

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
                setStatus(orderData?.status || "");
            })
            .catch(() => toast.error("Failed to fetch order details"))
            .finally(() => setLoading(false));
    }, [orderId, token, adminApiFetch]);

    const handleSave = async () => {
        if (!orderId || !token) return;
        setSaving(true);
        try {
            const uppercaseStatus = status.toUpperCase();
            const res = await adminApiFetch(`/api/admin/orders/${orderId}`, {
                method: "PUT",
                body: JSON.stringify({ status: uppercaseStatus }),
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            if (!res || !res.ok) {
                const errorData = await res?.json?.();
                throw new Error(errorData?.message || "Failed to update order status");
            }
            setOrder(prev => prev ? { ...prev, status: uppercaseStatus as OrderStatus } : null);
            setStatus(uppercaseStatus);
            toast.success("Order status updated");
            void markOrderRead(orderId);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update status");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-gray-800 mx-auto" />
                    <p className="text-sm text-gray-500">Loading order…</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4 max-w-sm p-8">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Order not found</h3>
                    <p className="text-sm text-gray-500">This order doesn&apos;t exist or has been removed.</p>
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Orders
                    </Button>
                </div>
            </div>
        );
    }

    const itemsSubtotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const hasDiscount = (order.discount || 0) > 0;
    const promoCode = order.promoCodeCode || order.promoCode?.code;
    const isDirty = status !== order.status;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

                {/* ── Top Bar ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 -ml-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            Orders
                        </Button>
                        <span className="text-gray-300">/</span>
                        <span className="text-sm text-gray-500 font-mono">
                            {order.orderNumber ? `#${order.orderNumber}` : order.id}
                        </span>
                    </div>

                    {/* Status controls */}
                    <div className="flex items-center gap-2">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-40 h-9 text-sm border-gray-200 bg-white cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ORDER_STATUSES.map(s => {
                                    const cfg = STATUS_CONFIG[s];
                                    return (
                                        <SelectItem key={s} value={s} className="cursor-pointer">
                                            <div className="flex items-center gap-2 text-sm">
                                                {cfg.icon}
                                                {cfg.label}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>

                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving || !isDirty}
                            className="h-9 bg-gray-900 hover:bg-gray-700 text-white cursor-pointer disabled:opacity-40"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5 mr-1.5" />
                                    Save
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* ── Order Header Card ── */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-xl font-bold text-gray-900">
                                {order.orderNumber ? `Order #${order.orderNumber}` : `Order`}
                            </h1>
                            <button
                                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:border-b hover:border-gray-500 hover:text-gray-600 transition-colors"
                                onClick={() => {
                                    navigator.clipboard.writeText(order.orderNumber || order.id);
                                    toast.success("Copied!");
                                }}
                            >
                                <Copy className="w-3 h-3" />
                                Copy
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {moment(order.createdAt).format("MMM D, YYYY [at] h:mm A")}
                            </span>
                            {order.deliveryDate && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Delivery: {moment(order.deliveryDate).format("MMM D, YYYY")}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5" />
                                {order.items.length} {order.items.length === 1 ? "item" : "items"}
                            </span>
                            <StatusBadge status={order.status} />
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                    </div>
                </div>

                {/* ── Main Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Left Column – Items + Customer */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Items */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-900 text-sm">Order Items</h2>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.items.map((item, index) => (
                                    <div key={`${item.productId}-${index}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <Package className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate">
                                                    {item.product?.name || `Product ${item.productId}`}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {formatCurrency(item.price)} each
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                                            <div className="text-center">
                                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Qty</p>
                                                <p className="font-semibold text-gray-800 text-sm mt-0.5">{item.quantity}</p>
                                            </div>
                                            <div className="text-right min-w-[70px]">
                                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Subtotal</p>
                                                <p className="font-bold text-gray-900 text-sm mt-0.5">
                                                    {formatCurrency(Number(item.price) * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-900 text-sm">Customer</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                                <div className="px-5 py-4 space-y-4">
                                    <InfoRow icon={<User className="w-4 h-4" />} label="Name" value={order.user?.fullName || "N/A"} />
                                    <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={formatPhoneNumber(order.user?.phone)} mono />
                                </div>
                                <div className="px-5 py-4 space-y-4">
                                    <InfoRow icon={<MapPin className="w-4 h-4" />} label="Delivery Address" value={formatAddress(order.address)} />
                                    <InfoRow
                                        icon={<Calendar className="w-4 h-4" />}
                                        label="Delivery Date"
                                        value={order.deliveryDate ? moment(order.deliveryDate).format("MMMM D, YYYY") : "Not scheduled"}
                                        muted={!order.deliveryDate}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column – Summary (sticky) */}
                    <div className="space-y-4 lg:sticky lg:top-6">

                        {/* Order Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-900 text-sm">Summary</h2>
                            </div>
                            <div className="px-5 py-4 space-y-2.5">
                                <SummaryRow label="Subtotal" value={formatCurrency(itemsSubtotal)} />
                                {(order.tax || 0) > 0 && (
                                    <SummaryRow label="Tax" value={formatCurrency(order.tax || 0)} />
                                )}
                                {(order.convenienceCharges || 0) > 0 && (
                                    <SummaryRow label="Convenience" value={formatCurrency(order.convenienceCharges || 0)} />
                                )}
                                {(order.deliveryCharges || 0) > 0 && (
                                    <SummaryRow label="Delivery" value={formatCurrency(order.deliveryCharges || 0)} />
                                )}
                                {hasDiscount && (
                                    <div className="flex items-start justify-between text-sm">
                                        <div className="space-y-1">
                                            <span className="text-gray-600">Discount</span>
                                            {promoCode && (
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Tag className="w-3 h-3" />
                                                    {promoCode}
                                                    {(order.promoDiscountType || order.promoCode?.discountType) === "PERCENTAGE"
                                                        ? ` (${order.promoDiscount || order.promoCode?.discount}% off)`
                                                        : ""}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-green-600 font-medium">-{formatCurrency(order.discount || 0)}</span>
                                    </div>
                                )}

                                <Separator className="my-1 bg-gray-100 h-px" />

                                <div className="flex items-center justify-between pt-1">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 space-y-2">
                            <h2 className="font-semibold text-gray-900 text-sm mb-3">Payment</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span>Cash on Delivery</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span>Placed {moment(order.createdAt).format("MMM D, YYYY")}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function InfoRow({ icon, label, value, mono, muted }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    mono?: boolean;
    muted?: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-gray-400 flex-shrink-0">{icon}</div>
            <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                <p className={`text-sm mt-0.5 ${mono ? "font-mono" : "font-medium"} ${muted ? "text-gray-400 italic" : "text-gray-900"}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800">{value}</span>
        </div>
    );
}
