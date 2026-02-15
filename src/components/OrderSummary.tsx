import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ShoppingCart, Trash2, Edit2 } from "lucide-react";
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
    <Card className="mb-8 pt-0 shadow-2xl rounded-2xl border-2 border-yellow-300 bg-yellow-25 max-w-md mx-auto">
      <CardHeader className="bg-yellow-50 rounded-t-2xl p-4 border-b border-yellow-200">
        <CardTitle className="text-xl font-extrabold text-yellow-800 tracking-tight flex items-center gap-2">
          <span className="w-7 h-7 bg-yellow-200 rounded-full text-yellow-800 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </span>
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 bg-yellow-25">
        {cartItems.length === 0 ? (
          <div className="text-yellow-600 mb-6 text-center text-base font-medium py-8">Your cart is empty.</div>
        ) : (
          <ul className="mb-6 divide-y divide-yellow-200">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center py-3 text-base gap-3 hover:bg-yellow-50 rounded-lg transition-all"
              >
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-yellow-800 text-base">{item.name}</span>
                  <span className="text-xs text-yellow-600 flex items-center gap-2 mt-1">
                    Qty:
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateQuantity && updateQuantity(item.id, Math.max(1, Number(e.target.value)))}
                      className="w-12 px-1 py-0.5 text-xs text-center border border-yellow-200 rounded-md focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </span>
                </div>
                <span className="w-20 text-right font-bold text-yellow-800 text-base">
                  ${(item.price * item.quantity).toFixed(2)}
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
          <Separator className="my-4 bg-yellow-200" />
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center gap-2 mb-2 w-full">
              <div className="flex flex-col flex-1">
                <Input
                  id="promo-input"
                  type="text"
                  placeholder="Enter promo code"
                  value={promo.code}
                  onChange={e => setPromo({ code: e.target.value })}
                  className={`w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 ${promo.applied ? 'bg-yellow-100 text-yellow-600' : 'bg-white text-yellow-800'}`}
                  disabled={promo.applied}
                  autoComplete="off"
                />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={promo.applied || !promo.code || applyingPromo}
                className={`rounded-lg font-bold px-4 py-2 transition-all shadow ${promo.applied ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                onClick={() => applyPromo(promo.code)}
              >
                {promo.applied ? (
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 bg-green-500 rounded-full text-white flex items-center justify-center text-xs">✔</span>Applied</span>
                ) : applyingPromo ? (
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 bg-gray-400 rounded-full text-white flex items-center justify-center text-xs animate-spin">⏳</span>Applying...</span>
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
            {/* Show error or success message for promo code */}
            {promoError && !promo.applied && (
              <div className="text-xs text-red-500 font-semibold mb-1">Invalid or expired promo code.</div>
            )}
            {promo.applied && (
              <div className="text-xs text-green-600 font-semibold mb-1">Promo code applied!</div>
            )}
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
              <div className="flex justify-between text-xs text-green-700">
                <div>Promo Discount
                  <span className="text-xs ml-2 text-red-700 cursor-pointer"
                    onClick={() => {
                      clearPromo();
                    }}>
                    remove
                  </span>
                </div>
                <span>
                  -{promo.discountType === "PERCENTAGE" ? `${promo.discount}% ($${appliedDiscount.toFixed(2)})` : `$${appliedDiscount.toFixed(2)}`}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-yellow-300 pt-2 mt-2 text-yellow-800">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
            {/* Order Type and Date/Pickup Info */}
            <div className="space-y-2">
              {/* Order Type Display */}
              {deliveryType && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 shadow-sm">
                  <span className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    {deliveryType === 'PICKUP' ? '🏪' : '🚚'} Order Type: <span className="text-blue-800 font-bold">{deliveryType === 'PICKUP' ? 'Store Pickup' : 'Home Delivery'}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 h-auto cursor-pointer"
                    onClick={() => {
                      setDeliveryType(null); // Reset delivery type to force re-selection
                      // Also clear delivery date when changing order type
                      useOrderStore.getState().setSelectedDeliveryDate("");
                    }}
                    title="Change order type"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Date/Pickup Info */}
              {deliveryType === 'DELIVERY' && selectedDeliveryDate && (
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 shadow-sm">
                  <span className="text-xs font-semibold text-yellow-700 flex items-center gap-2">
                    <span className="flex w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center mr-1">
                      <Calendar className="w-4 h-4" />
                    </span>
                    Delivery Date
                  </span>
                  <span className="text-sm font-bold text-yellow-800 tracking-wide bg-yellow-100 border border-yellow-300 rounded px-2 py-1 ml-2">
                    {selectedDeliveryDate}
                  </span>
                </div>
              )}

              {deliveryType === 'PICKUP' && (
                <div className="flex items-center justify-center bg-green-50 border border-green-200 rounded-lg px-3 py-2 shadow-sm">
                  <span className="text-xs font-semibold text-green-700 flex items-center gap-2">
                    📞 We'll contact you when your order is ready for pickup
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method Info */}
            <div className="flex items-center justify-center bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3 mb-2 shadow-sm">
              <span className="text-sm font-semibold text-green-700 flex items-center gap-2">
                💰 Payment Method: <span className="text-green-800 font-bold">{deliveryType === 'PICKUP' ? 'Pay at Store' : 'Cash on Delivery'}</span>
              </span>
            </div>

            {/* Validation Message */}
            {validationMessage && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 mb-2">
                <span className="text-sm text-amber-700 flex items-center gap-2">
                  ⚠️ {validationMessage}
                </span>
              </div>
            )}

            <Button
              className="w-full mt-3 cursor-pointer bg-yellow-500 text-white font-bold text-base py-2 rounded-xl shadow-lg hover:bg-yellow-600 hover:scale-105 transition-all border border-yellow-500 hover:border-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              size="lg"
              disabled={!isOrderReady}
              onClick={handlePlaceOrder}
            >
              {placing ? "Placing..." : "Place Order"}
            </Button>
            {orderError && <div className="text-red-600 text-xs mt-2 text-center font-semibold">{orderError}</div>}
          </div>
        </>}

        <Button
          variant="ghost"
          className="w-full cursor-pointer mt-2 text-yellow-700 hover:text-yellow-800 font-semibold text-xs hover:bg-yellow-50"
          onClick={() => router.push("/")}
        >
          Continue Shopping
        </Button>
      </CardContent>
    </Card>
  );
}
