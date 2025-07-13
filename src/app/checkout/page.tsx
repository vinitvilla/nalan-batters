"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { CheckoutContactDelivery } from "@/components/CheckoutContactDelivery";
import { OrderSummary } from "@/components/OrderSummary";
import { userStore } from "@/store/userStore";
import { useAddressStore } from "@/store/addressStore";
import { UserAuthFlow } from "@/components/auth/UserAuthFlow";

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

  return (
    <>
      <div id="recaptcha-container" style={{ position: "absolute", zIndex: -1, opacity: 0 }} />
      <div className="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Right: Cart/OrderSummary */}
        <div className="order-2 md:order-2">
          <OrderSummary
            cartItems={cartItems}
            total={total}
            removeFromCart={removeFromCart}
            selectedAddress={selectedAddress}
            updateQuantity={updateQuantity}
          />
        </div>
        {/* Left: UserAuthFlow and delivery/contact */}
        <div className="order-1 md:order-1">
          {!user ? (
            <UserAuthFlow
              onSuccess={(user) => {
                userStore.getState().setPhone(user.phone);
                userStore.getState().setUser({
                  id: user.id,
                  phone: user.phone,
                  fullName: user.fullName || "",
                  role: user.role
                });
              }}
            />
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
                } catch (err: any) {
                  setError(err.message || "Failed to add address");
                } finally {
                  setLoading(false);
                }
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
