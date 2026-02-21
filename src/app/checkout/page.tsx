"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { CheckoutContactDelivery } from "@/components/CheckoutContactDelivery";
import { OrderSummary } from "@/components/OrderSummary";
import { OrderTypeSelector } from "@/components/OrderTypeSelector";
import { userStore } from "@/store/userStore";
import { useAddressStore } from "@/store/addressStore";
import { useOrderStore } from "@/store/orderStore";
import { UserAuthFlow } from "@/components/auth/UserAuthFlow";
import { CheckCircle, User, Truck, Store } from "lucide-react";

export default function CheckoutPage() {
  const cartItems = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // User state
  const user = userStore((s) => s.user);
  const phone = userStore((s) => s.phone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const newAddress = useAddressStore((s) => s.newAddress);
  const addAddress = useAddressStore((s) => s.addAddress);
  const setSelectedAddress = useAddressStore((s) => s.setSelectedAddress);
  const setDefaultAddress = userStore((s) => s.setDefaultAddress);

  const selectedAddress = useAddressStore((s) => s.selectedAddress);
  const selectedDeliveryDate = useOrderStore((s) => s.selectedDeliveryDate);
  const orderType = useOrderStore((s) => s.deliveryType);

  // Progress tracking
  const isLoggedIn = !!user;
  const hasOrderType = !!orderType;
  const hasAddress = orderType === 'PICKUP' || !!selectedAddress;
  const hasDeliveryDate = orderType === 'PICKUP' || !!selectedDeliveryDate;

  const completedSteps = [isLoggedIn, hasOrderType, hasAddress && hasDeliveryDate].filter(Boolean).length;
  const totalSteps = 3;
  const progressPercent = (completedSteps / totalSteps) * 100;
  const allComplete = completedSteps === totalSteps;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      {/* Thin progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className={`h-1 transition-all duration-700 ease-out ${allComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Compact header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500 mt-0.5">Complete your order in a few simple steps</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {/* Mini step dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-500 ${
                    i < completedSteps
                      ? 'w-2 h-2 bg-green-500'
                      : i === completedSteps
                        ? 'w-5 h-2 bg-yellow-500 rounded-full'
                        : 'w-2 h-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400 font-medium">
              {allComplete ? (
                <span className="text-green-600">Ready to order</span>
              ) : (
                `Step ${completedSteps + 1} of ${totalSteps}`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Checkout Steps */}
          <div className="lg:col-span-2 space-y-3">

            {/* Step 1: Sign In */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
                <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">Signed in</span>
                  {phone && <span className="text-sm text-gray-500">&middot; {phone}</span>}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-yellow-700" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Sign In</h2>
                      <p className="text-xs text-gray-500">Secure authentication to protect your order</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <UserAuthFlow
                    onSuccess={(user) => {
                      userStore.getState().setPhone(user.phone);
                      userStore.getState().setUser(user);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Order Type */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-3 border border-dashed border-gray-200 rounded-xl px-4 py-3 opacity-40">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-400">2</span>
                </div>
                <span className="text-sm text-gray-400">Order Type</span>
              </div>
            ) : hasOrderType ? (
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
                <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {orderType === 'DELIVERY' ? (
                    <Truck className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Store className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {orderType === 'DELIVERY' ? 'Home Delivery' : 'Store Pickup'}
                  </span>
                </div>
                <button
                  className="text-xs font-medium text-yellow-600 hover:text-yellow-700 flex-shrink-0"
                  onClick={() => {
                    useOrderStore.getState().setDeliveryType(null);
                    useOrderStore.getState().setSelectedDeliveryDate("");
                  }}
                >
                  Change
                </button>
              </div>
            ) : (
              <OrderTypeSelector />
            )}

            {/* Step 3: Contact & Delivery Details */}
            {!isLoggedIn || !hasOrderType ? (
              <div className="flex items-center gap-3 border border-dashed border-gray-200 rounded-xl px-4 py-3 opacity-40">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-400">3</span>
                </div>
                <span className="text-sm text-gray-400">
                  {orderType === 'PICKUP' ? 'Contact Details' : 'Delivery Details'}
                </span>
              </div>
            ) : (
              <CheckoutContactDelivery
                loading={loading}
                error={error}
                onAddAddress={async () => {
                  if (!user?.id) return;
                  setLoading(true);
                  setError(null);
                  try {
                    const res = await fetch("/api/public/addresses", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: user.id,
                        ...newAddress,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok || !data.address) throw new Error(data.error || "Failed to add address");
                    addAddress(data.address);
                    setDefaultAddress(data.address);
                    setSelectedAddress(data.address);
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : "Failed to add address");
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <OrderSummary
                cartItems={cartItems}
                total={total}
                removeFromCart={removeFromCart}
                selectedAddress={selectedAddress}
                updateQuantity={updateQuantity}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
