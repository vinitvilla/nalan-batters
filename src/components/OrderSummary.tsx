import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ShoppingCart, Trash2, Store, Truck, Banknote, AlertTriangle, Minus, Plus } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useConfigStore } from "@/store/configStore";
import { AddressFields } from "@/store/addressStore";
import { usePromoCode } from "@/hooks/usePromoCode";
import { useOrderPlacement } from "@/hooks/useOrderPlacement";
import { ChargeRow } from "@/components/shared";

export interface OrderSummaryProps {
  cartItems: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
  removeFromCart: (id: string) => void;
  selectedAddress: AddressFields | null;
  updateQuantity?: (id: string, quantity: number) => void;
}

export function OrderSummary({ cartItems, removeFromCart, selectedAddress, updateQuantity }: OrderSummaryProps) {
  // Store hooks
  const router = useRouter();
  const config = useConfigStore(s => s.configs);
  const selectedDeliveryDate = useOrderStore(s => s.selectedDeliveryDate);
  const deliveryType = useOrderStore(s => s.deliveryType);
  const setDeliveryType = useOrderStore(s => s.setDeliveryType);
  const setPromo = useOrderStore(s => s.setPromo);
  const getOrderCalculations = useOrderStore(s => s.getOrderCalculations);

  // Custom hooks
  const { promo, applyingPromo, promoError, applyPromo, clearPromo } = usePromoCode();
  const { placing, orderError, getOrderValidationMessage, placeOrder } = useOrderPlacement();

  // Derived values using orderStore calculations
  const calculations = getOrderCalculations(cartItems, config, selectedAddress, selectedDeliveryDate, deliveryType);
  const {
    subtotal,
    tax,
    taxRate,
    convenienceCharge,
    deliveryCharge,
    appliedDiscount,
    finalTotal,
    originalTax,
    originalConvenienceCharge,
    originalDeliveryCharge,
    isTaxWaived,
    isConvenienceWaived,
    isDeliveryWaived
  } = calculations;

  // Validation message and order ready state
  const validationMessage = getOrderValidationMessage(cartItems, selectedAddress, config);
  const isOrderReady = !validationMessage && !placing;

  // Place order handler
  async function handlePlaceOrder() {
    await placeOrder(cartItems, selectedAddress);
  }

  // --- Render ---
  return (
    <Card className="mb-8 pt-0 shadow-lg rounded-xl border border-gray-200 bg-white max-w-md mx-auto">
      <CardHeader className="bg-gray-50 rounded-t-xl px-4 py-3 border-b border-gray-200">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-gray-600" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {cartItems.length === 0 ? (
          <div className="text-gray-500 mb-6 text-center text-sm py-8">Your cart is empty.</div>
        ) : (
          <ul className="mb-4 divide-y divide-gray-100">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center py-3 gap-3"
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-gray-900 text-sm truncate">{item.name}</span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-6 h-6 rounded-md border-gray-300 text-gray-600 hover:bg-gray-100"
                      onClick={() => updateQuantity && updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium text-gray-900 w-6 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-6 h-6 rounded-md border-gray-300 text-gray-600 hover:bg-gray-100"
                      onClick={() => updateQuantity && updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <span className="w-16 text-right font-semibold text-gray-900 text-sm">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1 text-gray-400 hover:text-red-600 hover:bg-red-50 w-7 h-7"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {cartItems.length !== 0 && <>
          <Separator className="my-3 bg-gray-200" />

          {/* Promo Code */}
          <div className="flex items-center gap-2 mb-3">
            <Input
              id="promo-input"
              type="text"
              placeholder="Promo code"
              value={promo.code}
              onChange={e => setPromo({ code: e.target.value })}
              className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-400/30 ${promo.applied ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-900'}`}
              disabled={promo.applied}
              autoComplete="off"
            />
            <Button
              type="button"
              size="sm"
              disabled={promo.applied || !promo.code || applyingPromo}
              className={`rounded-lg font-medium px-4 py-2 text-sm ${promo.applied ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
              onClick={() => applyPromo(promo.code)}
            >
              {promo.applied ? "Applied" : applyingPromo ? "..." : "Apply"}
            </Button>
          </div>
          {promoError && !promo.applied && (
            <p className="text-xs text-red-500 font-medium mb-2">Invalid or expired promo code.</p>
          )}
          {promo.applied && (
            <p className="text-xs text-green-600 font-medium mb-2">Promo code applied!</p>
          )}

          {/* Charges Breakdown */}
          <div className="flex flex-col gap-1.5 mb-3">
            <ChargeRow label="Subtotal" amount={subtotal} />
            <ChargeRow
              label={`Tax (${Math.round(taxRate * 100)}%)`}
              amount={tax}
              isWaived={isTaxWaived}
              originalAmount={originalTax}
            />
            <ChargeRow
              label="Convenience Charge"
              amount={convenienceCharge}
              isWaived={isConvenienceWaived}
              originalAmount={originalConvenienceCharge}
            />
            <ChargeRow
              label="Delivery Charge"
              amount={deliveryCharge}
              isWaived={isDeliveryWaived}
              originalAmount={originalDeliveryCharge}
            />
            {!!appliedDiscount && (
              <div className="flex justify-between text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <span>Promo Discount</span>
                  <button className="text-xs text-red-500 hover:text-red-700 underline" onClick={() => clearPromo()}>
                    remove
                  </button>
                </div>
                <span>
                  -{promo.discountType === "PERCENTAGE" ? `${promo.discount}% ($${appliedDiscount.toFixed(2)})` : `$${appliedDiscount.toFixed(2)}`}
                </span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-3 mt-2 text-gray-900">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>

          {/* Order Details - Compact */}
          <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200 text-sm">
            {deliveryType && (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-gray-600 flex items-center gap-2">
                  {deliveryType === 'PICKUP' ? <Store className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                  {deliveryType === 'PICKUP' ? 'Store Pickup' : 'Home Delivery'}
                </span>
                <button
                  className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                  onClick={() => {
                    setDeliveryType(null);
                    useOrderStore.getState().setSelectedDeliveryDate("");
                  }}
                >
                  Change
                </button>
              </div>
            )}
            {deliveryType === 'DELIVERY' && selectedDeliveryDate && (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Delivery Date
                </span>
                <span className="font-medium text-gray-900">{selectedDeliveryDate}</span>
              </div>
            )}
            {deliveryType === 'PICKUP' && (
              <div className="px-3 py-2 text-gray-600 text-xs">
                We&apos;ll contact you when your order is ready for pickup
              </div>
            )}
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-gray-600 flex items-center gap-2">
                <Banknote className="w-3.5 h-3.5" />
                Payment
              </span>
              <span className="font-medium text-gray-900 text-xs">
                {deliveryType === 'PICKUP' ? 'Pay at Store' : 'Cash on Delivery'}
              </span>
            </div>
          </div>

          {/* Validation Message */}
          {validationMessage && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{validationMessage}</span>
            </div>
          )}

          <Button
            className="w-full mt-4 bg-yellow-500 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
            disabled={!isOrderReady}
            onClick={handlePlaceOrder}
          >
            {placing ? "Placing Order..." : "Place Order"}
          </Button>
          {orderError && <p className="text-red-600 text-xs mt-2 text-center font-medium">{orderError}</p>}
        </>}

        <Button
          variant="ghost"
          className="w-full mt-2 text-gray-500 hover:text-gray-700 font-medium text-xs hover:bg-gray-50"
          onClick={() => router.push("/")}
        >
          Continue Shopping
        </Button>
      </CardContent>
    </Card>
  );
}
