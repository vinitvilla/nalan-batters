import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { userStore } from "@/store/userStore";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AddressFields } from "@/store/addressStore";

export interface OrderSummaryProps {
  cartItems: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
  removeFromCart: (id: string) => void;
  selectedAddress: AddressFields | null;
  updateQuantity?: (id: string, quantity: number) => void;
}

export function OrderSummary({ cartItems, total, removeFromCart, selectedAddress, updateQuantity }: OrderSummaryProps) {
  const router = useRouter();
  const TAX_RATE = 0.13;
  const promo = useCartStore(s => s.promo);
  const promoApplied = useCartStore(s => s.promoApplied);
  const discount = useCartStore(s => s.discount);
  const setPromo = useCartStore(s => s.setPromo);
  const setPromoApplied = useCartStore(s => s.setPromoApplied);
  const setDiscount = useCartStore(s => s.setDiscount);
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const finalTotal = +(subtotal + tax - discount).toFixed(2);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const user = userStore(s => s.user);

  async function handlePlaceOrder() {
    setPlacing(true);
    setOrderError("");
    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          addressId: selectedAddress?.id, // Pass the full address object
          items: cartItems.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      useCartStore.getState().clearCart();
      router.push("/order-success");
    } catch (err: any) {
      setOrderError(err.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <div className="text-gray-500 mb-6 text-center">
            Your cart is empty.
          </div>
        ) : (
          <ul className="mb-8 divide-y">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center py-3 text-base gap-2"
              >
                <div className="flex flex-col flex-1">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-2">
                    Qty:
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateQuantity && updateQuantity(item.id, Math.max(1, Number(e.target.value)))}
                      className="w-14 px-1 py-0.5 text-xs text-center"
                    />
                  </span>
                </div>
                <span className="w-20 text-right font-medium">
                  ${ (item.price * item.quantity).toFixed(2) }
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {cartItems.length !== 0 && <>
          <Separator className="my-4" />
          <div className="flex flex-col gap-1 mb-2">
            {/* Promo code input */}
            <div className="flex items-center gap-2 mb-2 w-full">
              <Input
                type="text"
                placeholder="Enter promo code"
                value={promo}
                onChange={e => setPromo(e.target.value)}
                className="w-40"
                disabled={promoApplied}
              />
              <Button
                type="button"
                size="sm"
                disabled={promoApplied || !promo}
                onClick={() => {
                  // Example: hardcoded promo logic
                  if (promo.toLowerCase() === "save10") {
                    setDiscount(10);
                    setPromoApplied(true);
                  } else {
                    setDiscount(0);
                    setPromoApplied(false);
                  }
                }}
              >
                {promoApplied ? "Applied" : "Apply"}
              </Button>
            </div>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (13%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {!!discount && (
              <div className="flex justify-between text-sm text-green-700">
                <div>Promo Discount
                  <span className="text-xs ml-2 text-red-700 cursor-pointer"
                    onClick={() => {
                      setPromo("");
                      setPromoApplied(false);
                      setDiscount(0);
                    }}>
                    remove
                  </span>
                </div>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
          <Button
            className="w-full mt-4 cursor-pointer"
            size="lg"
            disabled={cartItems.length === 0 || !selectedAddress || placing}
            onClick={handlePlaceOrder}
          >
            {placing ? "Placing..." : "Place Order"}
          </Button>
          {orderError && <div className="text-red-600 text-sm mt-2 text-center">{orderError}</div>}
        </>}
        <Button
          variant="ghost"
          className="w-full cursor-pointer mt-2"
          onClick={() => router.push("/")}
        >
          Continue Shopping
        </Button>
      </CardContent>
    </Card>
  );
}
