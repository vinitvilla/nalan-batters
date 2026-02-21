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
import { CheckCircle, User, MapPin, Calendar, ShoppingBag, Store, Shield, Clock, Star, ArrowRight } from "lucide-react";

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
  const hasAddress = orderType === 'PICKUP' || !!selectedAddress; // Address not required for pickup
  const hasDeliveryDate = orderType === 'PICKUP' || !!selectedDeliveryDate; // Delivery date not required for pickup

  const steps = [
    { id: 'login', label: 'Sign In', icon: User, completed: isLoggedIn, description: 'Secure authentication' },
    { id: 'orderType', label: 'Order Type', icon: Store, completed: hasOrderType, description: 'Pickup or delivery' },
    { id: 'address', label: orderType === 'PICKUP' ? 'Contact' : 'Address', icon: MapPin, completed: hasAddress, description: orderType === 'PICKUP' ? 'Contact details' : 'Delivery location' },
    { id: 'delivery', label: orderType === 'PICKUP' ? 'Pickup' : 'Delivery', icon: Calendar, completed: hasDeliveryDate, description: orderType === 'PICKUP' ? 'Pickup time' : 'Pick your date' },
    { id: 'payment', label: 'Payment', icon: ShoppingBag, completed: false, description: 'Complete order' }
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
      {/* Hero Section with enhanced visuals */}
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-25 to-amber-50">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Complete Your Order
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              You&apos;re just a few steps away from enjoying fresh, authentic batters delivered to your doorstep
            </p>

            {/* Trust indicators */}
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Quick Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span>Premium Quality</span>
              </div>
            </div>
          </div>

          {/* Minimal Progress Steps */}
          <div className="flex justify-center">
            <div className="flex items-center gap-1 md:gap-3">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = step.completed;

                return (
                  <div key={step.id} className="flex items-center">
                    {/* Step Circle with enhanced styling */}
                    <div className="relative">
                      <div
                        className={`
                          flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 transition-all duration-500 relative
                          ${isCompleted
                            ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-400 text-white shadow-lg shadow-green-200 cursor-pointer hover:shadow-xl hover:scale-105'
                            : isActive
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-400 border-yellow-400 text-white shadow-lg shadow-yellow-200 animate-pulse'
                              : 'bg-gray-100 border-gray-300 text-gray-400'
                          }
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                      </div>
                      {/* Step number badge */}
                      <div className={`
                        absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300
                        ${isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }
                      `}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Step Label and Description */}
                    <div className="ml-3 hidden md:block">
                      <p className={`
                        text-sm font-bold transition-colors duration-300 leading-tight
                        ${isCompleted
                          ? 'text-green-700'
                          : isActive
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }
                      `}>
                        {step.label}
                      </p>
                      <p className={`
                        text-xs transition-colors duration-300
                        ${isCompleted
                          ? 'text-green-600'
                          : isActive
                            ? 'text-gray-600'
                            : 'text-gray-400'
                        }
                      `}>
                        {step.description}
                      </p>
                    </div>

                    {/* Connector */}
                    {index < steps.length - 1 && (
                      <div className="relative mx-2 md:mx-4">
                        <div className="w-8 md:w-16 h-0.5 bg-gray-300"></div>
                        <div className={`
                          absolute top-0 left-0 h-0.5 transition-all duration-700 ease-out
                          ${index < currentStepIndex || steps[index + 1].completed
                            ? 'w-full bg-gradient-to-r from-yellow-400 to-orange-400'
                            : 'w-0 bg-gray-300'
                          }
                        `}></div>

                        {/* Animated arrow for active step */}
                        {isActive && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <ArrowRight className="w-4 h-4 text-yellow-500 animate-bounce" />
                          </div>
                        )}
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
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 md:p-10 relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>

                  <div className="relative">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome! Please Sign In</h2>
                        <p className="text-gray-600">Secure authentication to protect your order</p>
                      </div>
                    </div>

                    <UserAuthFlow
                      onSuccess={(user) => {
                        userStore.getState().setPhone(user.phone);
                        userStore.getState().setUser(user);
                      }}
                    />
                  </div>
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
