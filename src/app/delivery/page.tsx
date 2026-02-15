"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPhoneStep } from "@/components/auth/UserPhoneStep";
import { UserOtpStep } from "@/components/auth/UserOtpStep";
import { userStore } from "@/store/userStore";
import { ConfirmationResult } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, Phone, Package, CheckCircle2, LogOut, RefreshCw } from "lucide-react";
import { formatCurrency, formatPhoneNumber, formatDate } from "@/lib/utils/commonFunctions";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
  };
}

interface Order {
  id: string;
  orderNumber?: string;
  status: string;
  deliveryDate?: string;
  total: number;
  address?: {
    street?: string;
    unit?: string;
    city?: string;
    province?: string;
    postal?: string;
  };
  user?: {
    fullName: string;
    phone: string;
  };
  items?: OrderItem[];
}

export default function DeliveryPage() {
  const [step, setStep] = useState<"phone" | "otp" | "orders">("phone");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const user = userStore((s) => s.user);
  const token = userStore((s) => s.token);
  const resetUser = userStore((s) => s.reset);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/driver/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch {
      toast.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      if (user.role === "DRIVER") {
        setStep("orders");
        fetchOrders();
      } else {
        toast.error("Access Denied: You are not a driver");
        resetUser();
        setStep("phone");
      }
    } else {
      setStep("phone");
    }
  }, [user, token, resetUser, fetchOrders]);

  const handleMarkDelivered = async (orderId: string) => {
    if (!token) return;
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/driver/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "DELIVERED" }),
      });

      if (res.ok) {
        toast.success("Order marked as delivered");
        fetchOrders(); // Refresh list
      } else {
        toast.error("Failed to update order");
      }
    } catch {
      toast.error("Error updating order");
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    resetUser();
    setStep("phone");
    setOrders([]);
  };

  if (step === "phone") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Driver Login
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <UserPhoneStep
              onOtpSent={(cr) => {
                setConfirmationResult(cr);
                setStep("otp");
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify OTP
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <UserOtpStep
              confirmationResult={confirmationResult}
              onUserFound={(u) => {
                if (u.role === "DRIVER") {
                  setStep("orders");
                } else {
                  toast.error("Access Denied: You are not a driver");
                  resetUser();
                  setStep("phone");
                }
              }}
              onUserNotFound={() => {
                toast.error("Driver account not found");
                setStep("phone");
              }}
              onBack={() => setStep("phone")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Driver Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Assigned Orders</h2>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No active orders assigned to you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-bold">
                        #{order.orderNumber || order.id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(order.deliveryDate)}
                      </p>
                    </div>
                    <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Delivery Address</p>
                      <p className="text-sm text-gray-600">
                        {order.address?.street} {order.address?.unit ? `Unit ${order.address.unit}` : ""}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.address?.city}, {order.address?.province} {order.address?.postal}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Customer</p>
                      <p className="text-sm text-gray-600">{order.user?.fullName}</p>
                      <p className="text-sm text-gray-600">{formatPhoneNumber(order.user?.phone || "")}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <p className="font-medium text-gray-900 mb-2">Items</p>
                    <ul className="space-y-2">
                      {order.items?.map((item: OrderItem) => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.product?.name}
                          </span>
                          <span className="font-medium">
                            ${formatCurrency(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between mt-4 font-bold text-gray-900">
                      <span>Total</span>
                      <span>${formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  {order.status !== "DELIVERED" && (
                    <Button
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleMarkDelivered(order.id)}
                      disabled={updating === order.id}
                    >
                      {updating === order.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Mark as Delivered
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
