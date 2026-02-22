"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { userStore } from "@/store/userStore";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { AdminOrderResponse } from "@/types/order";
import { ORDER_STATUSES } from "@/constants/order";
import type { OrderStatus } from "@/generated/prisma";
import { Separator } from "@radix-ui/react-separator";
import { Copy, Calendar, User, Phone, MapPin, Package, CreditCard, Clock, ArrowLeft, Edit3, CheckCircle2, AlertCircle, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { capitalize, formatCurrency, formatPhoneNumber, formatAddress } from "@/lib/utils/commonFunctions";
import moment from "moment";

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

    const handleStatusChange = (value: string) => setStatus(value);

    const handleSave = async () => {
        if (!orderId || !token) return;
        setSaving(true);
        try {
            // Ensure status is uppercase to match backend enum
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

            // Update local order state with new status
            setOrder(prev => prev ? { ...prev, status: uppercaseStatus as OrderStatus } : null);
            setStatus(uppercaseStatus); // Update the local status state as well
            toast.success("Order status updated successfully");
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update status");
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'bg-gray-100 text-gray-800 border-gray-300';
            case 'CONFIRMED': return 'bg-gray-200 text-gray-900 border-gray-400';
            case 'SHIPPED': return 'bg-gray-300 text-gray-900 border-gray-500';
            case 'DELIVERED': return 'bg-black text-white border-black';
            case 'CANCELLED': return 'bg-gray-600 text-white border-gray-600';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return <Clock className="w-4 h-4" />;
            case 'CONFIRMED': return <CheckCircle2 className="w-4 h-4" />;
            case 'SHIPPED': return <Package className="w-4 h-4" />;
            case 'DELIVERED': return <Truck className="w-4 h-4" />;
            case 'CANCELLED': return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black mx-auto"></div>
                    <div className="absolute inset-0 rounded-full bg-gray-100 opacity-20 animate-pulse"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading order details...</p>
            </div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900">Order Not Found</h3>
                    <p className="text-gray-600 leading-relaxed">
                        The order you&apos;re looking for doesn&apos;t exist or has been removed from the system.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Orders
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
                {/* Enhanced Header */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Top Section - Navigation and Actions */}
                    <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="cursor-pointer hover:bg-white hover:text-black border border-transparent hover:border-gray-300 rounded-lg"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Orders
                            </Button>

                            <div className="h-6 border-l border-gray-300"></div>

                            <Badge className={`${getStatusColor(order.status)} border px-3 py-1.5 font-semibold text-sm flex items-center gap-2`}>
                                {getStatusIcon(order.status)}
                                {capitalize(order.status)}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-3">
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-40 cursor-pointer border-gray-300 focus:border-black focus:ring-gray-100 bg-white text-sm">
                                    <SelectValue placeholder="Change status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ORDER_STATUSES.map(s => (
                                        <SelectItem key={s} value={s} className="cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(s)}
                                                {capitalize(s)}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={handleSave}
                                disabled={saving || status === order.status}
                                className="cursor-pointer bg-black hover:bg-gray-800 text-white px-4 shadow-md hover:shadow-lg transition-all duration-200"
                                size="sm"
                            >
                                {saving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs">Updating...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Edit3 className="w-3 h-3 mr-1.5" />
                                        <span className="text-xs">Update</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Main Header Content */}
                    <div className="p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Order Number and Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                        {order.orderNumber ? `Order #${order.orderNumber}` : `Order #${order.id}`}
                                    </h1>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 text-xs"
                                        onClick={() => {
                                            const textToCopy = order.orderNumber || order.id;
                                            navigator.clipboard.writeText(textToCopy.toString());
                                            toast.success("Order number copied!");
                                        }}
                                    >
                                        <Copy className="w-3 h-3 mr-1.5" />
                                        Copy {order.orderNumber ? 'Number' : 'ID'}
                                    </Button>
                                </div>

                                {order.orderNumber && (
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Order ID:</span> {order.id}
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">
                                            {moment(order.createdAt).format('MMM D, YYYY [at] h:mm A')}
                                        </span>
                                    </div>

                                    {order.deliveryDate && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />                            <span className="font-medium">
                                                Delivery: {moment(order.deliveryDate).format('MMM D, YYYY')}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">
                                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex flex-col lg:items-end gap-2">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Order Total</p>
                                    <p className="text-2xl font-bold text-black">{formatCurrency(order.total)}</p>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <CreditCard className="w-3 h-3" />
                                    <span>Payment: Cash on Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content with Tabs */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <Tabs defaultValue="overview" className="w-full">
                        <div className="border-b border-gray-200 px-6 lg:px-8 py-6">
                            <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl p-1">
                                <TabsTrigger
                                    value="overview"
                                    className="cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm font-medium"
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="customer"
                                    className="cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm font-medium"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Customer
                                </TabsTrigger>
                                <TabsTrigger
                                    value="billing"
                                    className="cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm font-medium"
                                >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Billing
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="h-[calc(100vh-300px)]">
                            <div className="p-6 lg:p-8">
                                {/* Overview Tab */}
                                <TabsContent value="overview" className="mt-0 space-y-8">
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                        {/* Order Items - Takes 2 columns */}
                                        <div className="xl:col-span-2">
                                            <Card className="border-gray-200 shadow-lg pt-0">
                                                <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl p-6">
                                                    <CardTitle className="text-xl font-bold flex items-center gap-3 text-gray-900">
                                                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <Package className="w-5 h-5 text-gray-700" />
                                                        </div>
                                                        Order Items
                                                        <Badge variant="secondary" className="bg-gray-200 text-gray-800 font-semibold">
                                                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                        </Badge>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-0">
                                                    <div className="overflow-hidden">
                                                        {order.items.map((item, index) => (
                                                            <div
                                                                key={`${item.productId}-${index}`}
                                                                className={`flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group ${index !== order.items.length - 1 ? 'border-b border-gray-100' : ''
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:shadow-md transition-shadow">
                                                                        <Package className="w-6 h-6 text-gray-600" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-semibold text-gray-900 text-lg group-hover:text-black transition-colors">
                                                                            {item.product?.name || `Product ${item.productId}`}
                                                                        </h4>
                                                                        <div className="flex items-center gap-3 mt-1">
                                                                            <p className="text-gray-600 text-sm">Unit Price: {formatCurrency(item.price)}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-6">
                                                                    <div className="text-center">
                                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</p>
                                                                        <Badge variant="outline" className="bg-gray-50 text-gray-700 font-bold text-lg px-3 py-1 mt-1 group-hover:bg-gray-100 group-hover:text-black transition-colors">
                                                                            {item.quantity}
                                                                        </Badge>
                                                                    </div>

                                                                    <div className="text-right">
                                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subtotal</p>
                                                                        <p className="font-bold text-xl text-gray-900 mt-1 group-hover:text-black transition-colors">
                                                                            {formatCurrency(Number(item.price) * item.quantity)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Quick Summary - Takes 1 column */}
                                        <div>
                                            <Card className="border-gray-200 shadow-lg pt-0">
                                                <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl p-6">
                                                    <CardTitle className="text-xl font-bold flex items-center gap-3 text-gray-900">
                                                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <CreditCard className="w-5 h-5 text-gray-700" />
                                                        </div>
                                                        Quick Summary
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6 space-y-4">
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 font-medium">Items Subtotal</span>
                                                            <span className="font-semibold">{formatCurrency(order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0))}</span>
                                                        </div>

                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 font-medium">Tax</span>
                                                            <span className="font-semibold">{formatCurrency(order.tax || 0)}</span>
                                                        </div>

                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 font-medium">Convenience Charges</span>
                                                            <span className="font-semibold">{formatCurrency(order.convenienceCharges || 0)}</span>
                                                        </div>

                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 font-medium">Delivery Charges</span>
                                                            <span className="font-semibold">{formatCurrency(order.deliveryCharges || 0)}</span>
                                                        </div>

                                                        {(order.discount || 0) > 0 && (
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-600 font-medium">
                                                                        {(order.promoCodeCode || order.promoCode) ? 'Promo Discount' : 'Discount'}
                                                                    </span>
                                                                    {(order.promoCodeCode || order.promoCode?.code) && (
                                                                        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 w-fit mt-1 text-xs">
                                                                            {order.promoCodeCode || order.promoCode?.code}
                                                                            {(order.promoDiscountType || order.promoCode?.discountType) === 'PERCENTAGE'
                                                                                ? ` (${order.promoDiscount || order.promoCode?.discount}% OFF)`
                                                                                : ''}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <span className="font-semibold text-gray-600">-{formatCurrency(order.discount || 0)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Separator className="my-4 bg-gray-200" />

                                                    {/* Total with Clean Pricing Badge */}
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center pt-2">
                                                            <span className="text-lg font-bold text-gray-900">Total</span>
                                                            <span className="text-2xl font-bold text-black">{formatCurrency(order.total)}</span>
                                                        </div>

                                                        {/* Clean Pricing Indicator */}
                                                        {(order.tax || 0) === 0 && (order.convenienceCharges || 0) === 0 && (order.deliveryCharges || 0) === 0 && (order.discount || 0) === 0 && !order.promoCode && (
                                                            <div className="flex items-center justify-center">
                                                                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                                                                    ✨ Clean Pricing - No Additional Fees
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Customer Tab */}
                                <TabsContent value="customer" className="mt-0">
                                    <Card className="border-gray-200 shadow-lg pt-0">
                                        <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl p-6">
                                            <CardTitle className="text-xl font-bold flex items-center gap-3 text-gray-900">
                                                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <User className="w-5 h-5 text-gray-700" />
                                                </div>
                                                Customer Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <User className="w-5 h-5 text-gray-700" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Customer Name</p>
                                                            <p className="text-xl font-bold text-gray-900">{order.user?.fullName || "N/A"}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <Phone className="w-5 h-5 text-gray-700" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</p>
                                                            <p className="text-xl font-mono font-semibold text-gray-900">{formatPhoneNumber(order.user?.phone)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <MapPin className="w-5 h-5 text-gray-700" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Delivery Address</p>
                                                            <p className="text-lg leading-relaxed text-gray-900">{formatAddress(order.address)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <Calendar className="w-5 h-5 text-gray-700" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Delivery Date</p>
                                                            <p className="text-lg font-semibold text-gray-900">
                                                                {order.deliveryDate
                                                                    ? moment(order.deliveryDate).format('MMMM D, YYYY')
                                                                    : <span className="italic text-gray-500">Not scheduled</span>
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Billing Tab */}
                                <TabsContent value="billing" className="mt-0">
                                    <Card className="border-gray-200 shadow-lg pt-0">
                                        <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl p-6">
                                            <CardTitle className="text-xl font-bold flex items-center gap-3 text-gray-900">
                                                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-gray-700" />
                                                </div>
                                                Billing Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            <div className="max-w-lg mx-auto space-y-6">
                                                {/* Detailed Breakdown */}
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                        <span className="text-gray-700 font-medium">Items Subtotal</span>
                                                        <span className="font-semibold text-lg">{formatCurrency(order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0))}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                        <span className="text-gray-700 font-medium">Tax & Fees</span>
                                                        <span className="font-semibold text-lg">{formatCurrency(order.tax || 0)}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                        <span className="text-gray-700 font-medium">Convenience Charges</span>
                                                        <span className="font-semibold text-lg">{formatCurrency(order.convenienceCharges || 0)}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                        <span className="text-gray-700 font-medium">Delivery Charges</span>
                                                        <span className="font-semibold text-lg">{formatCurrency(order.deliveryCharges || 0)}</span>
                                                    </div>

                                                    {(order.discount || 0) > 0 && (
                                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                            <div className="space-y-1">
                                                                <span className="text-gray-700 font-medium">
                                                                    {(order.promoCodeCode || order.promoCode) ? 'Promo Discount' : 'Discount Applied'}
                                                                </span>
                                                                {(order.promoCodeCode || order.promoCode?.code) && (
                                                                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                                                                        {order.promoCodeCode || order.promoCode?.code}
                                                                        {(order.promoDiscountType || order.promoCode?.discountType) === 'PERCENTAGE'
                                                                            ? ` (${order.promoDiscount || order.promoCode?.discount}% OFF)`
                                                                            : ''}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="font-semibold text-lg text-gray-600">-{formatCurrency(order.discount || 0)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xl font-bold text-gray-900">Total Amount</span>
                                                        <span className="text-3xl font-bold text-black">{formatCurrency(order.total)}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Payment processed on {moment(order.createdAt).format('MMMM D, YYYY')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
