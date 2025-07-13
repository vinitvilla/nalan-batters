import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { userStore } from "@/store/userStore";
import { useOrderStore } from "@/store/orderStore";
import { useConfigStore } from "@/store/configStore";
import { AddressFields } from "@/store/addressStore";
import { DiscountType } from "@/generated/prisma";

export interface OrderSummaryProps {
  cartItems: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
  removeFromCart: (id: string) => void;
  selectedAddress: AddressFields | null;
  updateQuantity?: (id: string, quantity: number) => void;
}

type FinalTotalParams = {
  subtotal: number;
  tax: number;
  convenienceCharge: number;
  deliveryCharge: number;
  discount: number;
  config: any;
};

function calculateFinalTotal({ subtotal, tax, convenienceCharge, deliveryCharge, discount, config }: FinalTotalParams): number {
  const taxAmount = config?.taxPercent?.waive ? 0 : tax;
  const convenienceAmount = config?.convenienceCharge?.waive ? 0 : convenienceCharge;
  const deliveryAmount = config?.deliveryCharge?.waive ? 0 : deliveryCharge;
  return +(subtotal + taxAmount + convenienceAmount + deliveryAmount - discount).toFixed(2);
}

export function OrderSummary({ cartItems, total, removeFromCart, selectedAddress, updateQuantity }: OrderSummaryProps) {
  // Store hooks
  const router = useRouter();
  const config = useConfigStore(s => s.configs);
  const user = userStore(s => s.user);
  const selectedDeliveryDate = useOrderStore(s => s.selectedDeliveryDate);
  const promoId = useOrderStore(s => s.promoId);
  const promo = useOrderStore(s => s.promo);
  const promoApplied = useOrderStore(s => s.promoApplied);
  const discount = useOrderStore(s => s.discount);
  const discountType = useOrderStore(s => s.discountType);
  const setPromo = useOrderStore(s => s.setPromo);
  const setPromoApplied = useOrderStore(s => s.setPromoApplied);
  const setDiscount = useOrderStore(s => s.setDiscount);

  // State hooks
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [promoError, setPromoError] = useState(false);
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Derived values
  const TAX_RATE = config?.taxPercent?.percent ? config.taxPercent.percent / 100 : 0;
  const convenienceCharge = config?.convenienceCharge?.amount || 0;
  const deliveryCharge = config?.deliveryCharge?.amount || 0;
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const appliedDiscount = discountType === DiscountType.PERCENTAGE
    ? +(subtotal * (discount / 100)).toFixed(2)
    : discount;
  const finalTotal = calculateFinalTotal({ subtotal, tax, convenienceCharge, deliveryCharge, discount: appliedDiscount, config });

  // Place order handler
  async function handlePlaceOrder() {
    setPlacing(true);
    setOrderError("");
    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          addressId: selectedAddress?.id,
          items: cartItems.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
          promoCodeId: promoApplied && promoId ? promoId : null,
          deliveryDate: selectedDeliveryDate,
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

  // --- Render ---
  return (
    <Card className="mb-8 shadow-2xl rounded-2xl border-0 bg-white max-w-md mx-auto">
      <CardHeader className="bg-white rounded-t-2xl p-4 border-b border-gray-200">
        <CardTitle className="text-xl font-extrabold text-black tracking-tight flex items-center gap-2">
          <span className="inline-block w-7 h-7 bg-gray-200 rounded-full text-black flex items-center justify-center">🛒</span>
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {cartItems.length === 0 ? (
          <div className="text-gray-400 mb-6 text-center text-base font-medium py-8">Your cart is empty.</div>
        ) : (
          <ul className="mb-6 divide-y divide-gray-100">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center py-3 text-base gap-3 hover:bg-gray-50 rounded-lg transition-all"
              >
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-black text-base">{item.name}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                    Qty:
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateQuantity && updateQuantity(item.id, Math.max(1, Number(e.target.value)))}
                      className="w-12 px-1 py-0.5 text-xs text-center border border-gray-200 rounded-md"
                    />
                  </span>
                </div>
                <span className="w-20 text-right font-bold text-black text-base">
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
          <Separator className="my-4 bg-gray-200" />
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center gap-2 mb-2 w-full">
              <div className="flex flex-col flex-1">
                <Input
                  id="promo-input"
                  type="text"
                  placeholder="Enter promo code"
                  value={promo}
                  onChange={e => setPromo(e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-black focus:ring-2 focus:ring-black/10 ${promoApplied ? 'bg-gray-100 text-gray-400' : 'bg-white text-black'}`}
                  disabled={promoApplied}
                  autoComplete="off"
                />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={promoApplied || !promo || applyingPromo}
                className={`rounded-lg font-bold px-4 py-2 transition-all shadow ${promoApplied ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-900'}`}
                onClick={async () => {
                  setApplyingPromo(true);
                  const result = await useOrderStore.getState().applyPromo(promo);
                  setPromoError(!result.success);
                  setApplyingPromo(false);
                }}
              >
                {promoApplied ? (
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 bg-green-500 rounded-full text-white flex items-center justify-center text-xs">✔</span>Applied</span>
                ) : applyingPromo ? (
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 bg-gray-400 rounded-full text-white flex items-center justify-center text-xs animate-spin">⏳</span>Applying...</span>
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
            {/* Show error or success message for promo code */}
            {promoError && !promoApplied && (
              <div className="text-xs text-red-500 font-semibold mb-1">Invalid or expired promo code.</div>
            )}
            {promoApplied && (
              <div className="text-xs text-green-600 font-semibold mb-1">Promo code applied!</div>
            )}
            <div className="flex justify-between text-xs text-black">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-black">
              <span>Tax ({Math.round(TAX_RATE * 100)}%)</span>
              {config?.taxPercent?.waive ? (
                <span className="line-through text-red-500">${tax.toFixed(2)}</span>
              ) : (
                <span>${tax.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between text-xs text-black">
              <span>Convenience Charge</span>
              {config?.convenienceCharge?.waive ? (
                <span className="line-through text-red-500">${convenienceCharge.toFixed(2)}</span>
              ) : (
                <span>${convenienceCharge.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between text-xs text-black">
              <span>Delivery Charge</span>
              {config?.deliveryCharge?.waive ? (
                <span className="line-through text-red-500">${deliveryCharge.toFixed(2)}</span>
              ) : (
                <span>${parseFloat(deliveryCharge).toFixed(2)}</span>
              )}
            </div>
            {!!appliedDiscount && (
              <div className="flex justify-between text-xs text-green-700">
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
                <span>
                  -{discountType === "PERCENTAGE" ? `${discount}% ($${appliedDiscount.toFixed(2)})` : `$${appliedDiscount.toFixed(2)}`}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2 text-black">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
            {/* Show selected delivery date with improved UI */}
            {selectedDeliveryDate && (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mt-3 shadow-sm">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <span className="inline-block w-5 h-5 bg-black text-white rounded-full flex items-center justify-center mr-1">📅</span>
                  Delivery Date
                </span>
                <span className="text-sm font-bold text-black tracking-wide bg-white border border-gray-300 rounded px-2 py-1 ml-2">
                  {selectedDeliveryDate}
                </span>
              </div>
            )}
          </div>
          <Button
            className="w-full mt-3 cursor-pointer bg-black text-white font-bold text-base py-2 rounded-xl shadow-lg hover:bg-gray-900 hover:scale-105 transition-all"
            size="lg"
            disabled={cartItems.length === 0 || !selectedAddress || placing}
            onClick={handlePlaceOrder}
          >
            {placing ? "Placing..." : "Place Order"}
          </Button>
          {orderError && <div className="text-red-600 text-xs mt-2 text-center font-semibold">{orderError}</div>}
        </>}
        <Button
          variant="ghost"
          className="w-full cursor-pointer mt-2 text-black hover:text-gray-700 font-semibold text-xs"
          onClick={() => router.push("/")}
        >
          Continue Shopping
        </Button>
      </CardContent>
    </Card>
  );
}
