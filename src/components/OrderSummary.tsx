import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar, ShoppingCart, Trash2, Store, Truck,
  Banknote, AlertTriangle, Minus, Plus, Tag, ArrowLeft
} from "lucide-react";
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
  const router = useRouter();
  const config = useConfigStore(s => s.configs);
  const selectedDeliveryDate = useOrderStore(s => s.selectedDeliveryDate);
  const deliveryType = useOrderStore(s => s.deliveryType);
  const setDeliveryType = useOrderStore(s => s.setDeliveryType);
  const setPromo = useOrderStore(s => s.setPromo);
  const getOrderCalculations = useOrderStore(s => s.getOrderCalculations);

  const { promo, applyingPromo, promoError, applyPromo, clearPromo } = usePromoCode();
  const { placing, orderError, getOrderValidationMessage, placeOrder } = useOrderPlacement();

  const calculations = getOrderCalculations(cartItems, config, selectedAddress, selectedDeliveryDate, deliveryType);
  const {
    subtotal, tax, taxRate, convenienceCharge, deliveryCharge,
    appliedDiscount, finalTotal,
    originalTax, originalConvenienceCharge, originalDeliveryCharge,
    isTaxWaived, isConvenienceWaived, isDeliveryWaived
  } = calculations;

  const validationMessage = getOrderValidationMessage(cartItems, selectedAddress, config);
  const isOrderReady = !validationMessage && !placing;

  async function handlePlaceOrder() {
    await placeOrder(cartItems, selectedAddress);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-gray-500" />
          Order Summary
        </h2>
      </div>

      <div className="p-5 space-y-5">
        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 -mx-1">
            {cartItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3 px-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">${Number(item.price).toFixed(2)} each</p>
                  {/* Qty controls */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      className="w-6 h-6 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      onClick={() => updateQuantity && updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold text-gray-900 w-5 text-center tabular-nums">{item.quantity}</span>
                    <button
                      className="w-6 h-6 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      onClick={() => updateQuantity && updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                  <button
                    className="text-gray-300 hover:text-red-500 transition-colors mt-0.5"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {cartItems.length > 0 && (
          <>
            <Separator className="bg-gray-100" />

            {/* Promo Code */}
            <div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Promo code"
                    value={promo.code}
                    onChange={e => setPromo({ code: e.target.value.toUpperCase() })}
                    className={`pl-8 text-sm border-gray-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 ${promo.applied ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'
                      }`}
                    disabled={promo.applied}
                    autoComplete="off"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={promo.applied || !promo.code || applyingPromo}
                  className={`rounded-lg text-sm font-medium px-4 h-9 ${promo.applied
                    ? 'bg-green-600 hover:bg-green-600 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    }`}
                  onClick={() => applyPromo(promo.code)}
                >
                  {promo.applied ? '✓ Applied' : applyingPromo ? '...' : 'Apply'}
                </Button>
              </div>
              {promoError && !promo.applied && (
                <p className="text-xs text-red-500 mt-1.5">Invalid or expired promo code.</p>
              )}
            </div>

            {/* Charges Breakdown */}
            <div className="space-y-2">
              <ChargeRow label="Subtotal" amount={subtotal} />
              <ChargeRow
                label={`Tax (${Math.round(taxRate)}%)`}
                amount={tax}
                isWaived={isTaxWaived}
                originalAmount={originalTax}
              />
              <ChargeRow
                label="Convenience"
                amount={convenienceCharge}
                isWaived={isConvenienceWaived}
                originalAmount={originalConvenienceCharge}
              />
              <ChargeRow
                label="Delivery"
                amount={deliveryCharge}
                isWaived={isDeliveryWaived}
                originalAmount={originalDeliveryCharge}
              />
              {promo.applied && (
                <div className={`flex justify-between text-sm ${appliedDiscount > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                  <div className="flex items-center gap-1.5">
                    <span>Promo discount</span>
                    <button
                      className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2"
                      onClick={() => clearPromo()}
                    >
                      remove
                    </button>
                  </div>
                  <span className="font-medium">
                    {appliedDiscount > 0 ? (
                      `-${promo.discountType === "PERCENTAGE"
                        ? `${promo.discount}% ($${appliedDiscount.toFixed(2)})`
                        : `$${appliedDiscount.toFixed(2)}`}`
                    ) : (
                      "$0.00"
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900 tabular-nums">${finalTotal.toFixed(2)}</span>
            </div>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 text-sm overflow-hidden">
              {deliveryType && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-gray-600 flex items-center gap-2">
                    {deliveryType === 'PICKUP'
                      ? <Store className="w-3.5 h-3.5 text-gray-400" />
                      : <Truck className="w-3.5 h-3.5 text-gray-400" />}
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
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Delivery date
                  </span>
                  <span className="font-medium text-gray-900">{selectedDeliveryDate}</span>
                </div>
              )}
              {deliveryType === 'PICKUP' && (
                <div className="px-4 py-2.5 text-gray-500 text-xs leading-relaxed">
                  We&apos;ll contact you when your order is ready for pickup.
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-gray-600 flex items-center gap-2">
                  <Banknote className="w-3.5 h-3.5 text-gray-400" />
                  Payment
                </span>
                <span className="font-medium text-gray-900 text-xs">
                  {deliveryType === 'PICKUP' ? 'Pay at Store' : 'Cash on Delivery'}
                </span>
              </div>
            </div>

            {/* Validation message */}
            {validationMessage && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                <span className="leading-snug">{validationMessage}</span>
              </div>
            )}

            {/* Place Order Button */}
            <button
              className={`
                w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
                ${isOrderReady
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm hover:shadow-md active:scale-[0.99]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
              disabled={!isOrderReady}
              onClick={handlePlaceOrder}
            >
              {placing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  Placing Order...
                </span>
              ) : 'Place Order'}
            </button>

            {orderError && (
              <p className="text-red-600 text-xs text-center font-medium">{orderError}</p>
            )}
          </>
        )}

        {/* Continue Shopping */}
        <button
          className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
