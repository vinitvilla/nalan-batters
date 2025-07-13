import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import Dropdown from "@/components/ui/dropdown";
import React, { useRef, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "./ui/separator";
import { useOrderStore } from "@/store/orderStore";

interface CartDropdownProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export default function CartDropdown({ open, onClose, anchorRef }: CartDropdownProps) {
  const cartItems = useCartStore(s => s.items);
  const updateQuantity = useCartStore(s => s.updateQuantity);
  const removeFromCart = useCartStore(s => s.removeFromCart);
  const router = useRouter();
  const isCartOpen = useCartStore(s => s.isCartOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const promo = useOrderStore(s => s.promo);
  const promoApplied = useOrderStore(s => s.promoApplied);
  const discount = useOrderStore(s => s.discount);
  const setPromo = useOrderStore(s => s.setPromo);
  const setPromoApplied = useOrderStore(s => s.setPromoApplied);
  const setDiscount = useOrderStore(s => s.setDiscount);
  const [promoTried, setPromoTried] = useState(false);
  const TAX_RATE = 0.13;
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + tax - discount).toFixed(2);

  useEffect(() => {
    if (isCartOpen) setVisible(true);
    else if (dropdownRef.current) {
      const handle = setTimeout(() => setVisible(false), 180);
      return () => clearTimeout(handle);
    }
  }, [isCartOpen]);

  const animationClass = isCartOpen ? "animate-cart-in" : "animate-cart-out";
  if (!visible) return null;

  return (
    <Dropdown open onClose={onClose} anchorRef={anchorRef}>
      <div ref={dropdownRef} id="cartDropdown" className={`p-4 ${animationClass}`}>
        <h4 className="font-bold mb-2">Cart</h4>
        {cartItems.length === 0 ? (
          <div className="text-gray-500 text-sm">Your cart is empty.</div>
        ) : (
          <>
            <ul className="mb-4 max-h-40 overflow-y-auto">
              {cartItems.map(item => (
                <li key={item.id} className="flex justify-between items-center py-1 text-sm gap-2">
                  <button
                    className="ml-2 text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="flex-1">{item.name}</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => updateQuantity(item.id, Number(e.target.value))}
                    className="w-12 border rounded px-1 py-0.5 text-center text-xs cursor-pointer"
                    aria-label={`Quantity for ${item.name}`}
                  />
                  <span className="w-14 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-2" />
            <div className="flex flex-col gap-1 mb-2">
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
                      setPromoTried(false);
                    }}>
                      remove
                    </span>
                  </div>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <form
              className="flex gap-2 mb-2"
              onSubmit={e => {
                e.preventDefault();
                setPromoTried(true);
                if (promo.trim().toUpperCase() === "SAVE10") {
                  setDiscount(10);
                  setPromoApplied(true);
                } else {
                  setDiscount(0);
                  setPromoApplied(false);
                }
              }}
            >
              <input
                type="text"
                value={promo}
                onChange={e => {
                  setPromo(e.target.value);
                  setPromoApplied(false);
                  setDiscount(0);
                  setPromoTried(false);
                }}
                placeholder="Promo code"
                className="border rounded px-2 py-1 text-sm flex-1"
                autoFocus
              />
              <Button
                className="cursor-pointer"
                type="submit"
                size="sm"
                variant="secondary"
                disabled={!promo.trim()}
              >
                {promoApplied ? "Applied" : "Apply"}
              </Button>
            </form>
            {promoTried && promo && !promoApplied && (
              <div className="text-xs text-red-500 mb-1">Invalid or expired promo code.</div>
            )}
          </>
        )}
        <Button
          className="w-full mt-3 cursor-pointer"
          disabled={!cartItems.length}
          onClick={() => {
            onClose();
            router.push("/checkout");
          }}
        >
          Proceed to Checkout
        </Button>
      </div>
    </Dropdown>
  );
}
