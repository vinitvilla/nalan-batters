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
import { CheckCircle, User, MapPin, Calendar, ShoppingBag, Store } from "lucide-react";

export default function CheckoutPage() {
  const cartItems = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // User state
  const user = userStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const newAddress = useAddressStore((s) => s.newAddress);
  const addAddress = useAddressStore((s) => s.addAddress);
  const setSelectedAddress = useAddressStore((s) => s.setSelectedAddress);
  const setDefaultAddress = userStore((s) => s.setDefaultAddress);

  // Get selectedAddress from store
  const selectedAddress = useAddressStore((s) => s.selectedAddress);
  const selectedDeliveryDate = useOrderStore((s) => s.selectedDeliveryDate);
  const orderType = useOrderStore((s) => s.deliveryType);

  // Progress tracking
  const isLoggedIn = !!user;
  const hasOrderType = !!orderType;
  const hasAddress = orderType === 'PICKUP' || !!selectedAddress;
  const hasDeliveryDate = orderType === 'PICKUP' || !!selectedDeliveryDate;

  const steps = [
    { id: 'login', label: 'Sign In', icon: User, completed: isLoggedIn },
    { id: 'orderType', label: 'Order Type', icon: Store, completed: hasOrderType },
    { id: 'address', label: orderType === 'PICKUP' ? 'Contact' : 'Address', icon: MapPin, completed: hasAddress },
    { id: 'delivery', label: orderType === 'PICKUP' ? 'Pickup' : 'Delivery', icon: Calendar, completed: hasDeliveryDate },
    { id: 'payment', label: 'Payment', icon: ShoppingBag, completed: false }
  ];

  const getCurrentStepIndex = () => {
    if (!isLoggedIn) return 0;
    if (!hasOrderType) return 1;
    if (!hasAddress) return 2;
    if (!hasDeliveryDate) return 3;
    return 4;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <>
      {/* Compact header with progress stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Checkout</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Complete your order in a few simple steps</p>

          {/* Minimal Progress Steps */}
          <div className="flex justify-center">
            <div className="flex items-center gap-1 md:gap-3">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = step.completed;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className={`
                          flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border-2 transition-colors
                          ${isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : isActive
                              ? 'bg-yellow-500 border-yellow-500 text-white'
                              : 'bg-gray-50 border-gray-300 text-gray-400'
                          }
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                      </div>
                      <span className={`
                        text-xs font-medium hidden md:block
                        ${isCompleted ? 'text-green-700' : isActive ? 'text-gray-900' : 'text-gray-400'}
                      `}>
                        {step.label}
                      </span>
                    </div>

                    {/* Connector */}
                    {index < steps.length - 1 && (
                      <div className="mx-1 md:mx-3">
                        <div className={`w-6 md:w-10 h-0.5 transition-colors ${
                          index < currentStepIndex ? 'bg-green-400' : 'bg-gray-200'
                        }`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column - Checkout Steps */}
            <div className="lg:col-span-2">
              {!user ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-yellow-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Sign in to continue</h2>
                  </div>

                  <UserAuthFlow
                    onSuccess={(user) => {
                      userStore.getState().setPhone(user.phone);
                      userStore.getState().setUser(user);
                    }}
                  />
                </div>
              ) : !hasOrderType ? (
                <OrderTypeSelector />
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
              <div className="sticky top-8">
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
    </>
  );
}
