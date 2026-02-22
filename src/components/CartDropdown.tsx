import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "./ui/separator";
import Dropdown from "@/components/ui/dropdown";
import { GoldButton } from "./GoldButton";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";
import { useConfigStore } from "@/store/configStore";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Config {
  DELIVERY_CHARGE?: number;
  FREE_DELIVERY_MINIMUM?: number;
  CONVENIENCE_CHARGE?: number;
  TAX_RATE?: number;
}

interface CartDropdownProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export default function CartDropdown({ onClose, anchorRef }: CartDropdownProps) {

  // Store hooks
  const config = useConfigStore(s => s.configs);
  
  // Cart store
  const cartItems = useCartStore(s => s.items);
  const updateQuantity = useCartStore(s => s.updateQuantity);
  const removeFromCart = useCartStore(s => s.removeFromCart);
  const isCartOpen = useCartStore(s => s.isCartOpen);

  // Order store  
  const promo = useOrderStore(s => s.promo);
  const setPromo = useOrderStore(s => s.setPromo);
  const clearPromo = useOrderStore(s => s.clearPromo);
  const applyPromo = useOrderStore(s => s.applyPromo);
  const getOrderCalculations = useOrderStore(s => s.getOrderCalculations);

  // Local state
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [visible, setVisible] = useState(false);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculations using orderStore with config  
  const calculations = getOrderCalculations(cartItems, config);
  const { 
    subtotal, 
    tax, 
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
  const taxRate = config?.taxPercent?.percent ? config.taxPercent.percent / 100 : 0.13;

  // Dropdown animation effect
  useEffect(() => {
    if (isCartOpen) {
      setVisible(true);
    } else if (dropdownRef.current) {
      const handle = setTimeout(() => setVisible(false), 180);
      return () => clearTimeout(handle);
    }
  }, [isCartOpen]);

  // Promo form handler
  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isApplyingPromo) return;
    
    setIsApplyingPromo(true);
    const result = await applyPromo(promo.code);
    setPromoError(!result.success);
    setIsApplyingPromo(false);
  };

  // Reset promo handler
  const handlePromoReset = () => {
    clearPromo();
    setPromoError(false);
  };

  const animationClass = isCartOpen ? "animate-cart-in" : "animate-cart-out";
  
  if (!visible) return null;

  // --- Render ---
  return (
    <Dropdown open onClose={onClose} anchorRef={anchorRef}>
      <div 
        ref={dropdownRef} 
        id="cartDropdown" 
        className={`p-4 ${animationClass} rounded-lg shadow-lg`}
      >
        <h4 className="font-bold mb-2 text-yellow-700">Cart</h4>
        
        {cartItems.length === 0 ? (
          <EmptyCart onClose={onClose} />
        ) : (
          <CartContent
            cartItems={cartItems}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            subtotal={subtotal}
            tax={tax}
            taxRate={taxRate}
            convenienceCharge={convenienceCharge}
            deliveryCharge={deliveryCharge}
            discount={appliedDiscount}
            total={finalTotal}
            config={config}
            originalTax={originalTax}
            originalConvenienceCharge={originalConvenienceCharge}
            originalDeliveryCharge={originalDeliveryCharge}
            isTaxWaived={isTaxWaived}
            isConvenienceWaived={isConvenienceWaived}
            isDeliveryWaived={isDeliveryWaived}
            promo={promo.code}
            promoApplied={promo.applied}
            promoError={promoError}
            isApplyingPromo={isApplyingPromo}
            setPromo={(code: string) => setPromo({ code })}
            setPromoError={setPromoError}
            handlePromoSubmit={handlePromoSubmit}
            handlePromoReset={handlePromoReset}
            onClose={onClose}
          />
        )}
      </div>
    </Dropdown>
  );
}

// Empty cart component
function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="text-yellow-500 text-sm mb-4">Your cart is empty.</div>
      <GoldButton
        className="w-full mt-3"
        onClick={() => {
          onClose();
          const el = document.getElementById("quickOrder");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Order Now
      </GoldButton>
    </>
  );
}

// Cart content component
function CartContent({
  cartItems,
  updateQuantity,
  removeFromCart,
  subtotal,
  tax,
  taxRate,
  convenienceCharge,
  deliveryCharge,
  discount,
  total,
  config,
  originalTax,
  originalConvenienceCharge,
  originalDeliveryCharge,
  isTaxWaived,
  isConvenienceWaived,
  isDeliveryWaived,
  promo,
  promoApplied,
  promoError,
  isApplyingPromo,
  setPromo,
  setPromoError,
  handlePromoSubmit,
  handlePromoReset,
  onClose
}: {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  subtotal: number;
  tax: number;
  taxRate: number;
  convenienceCharge: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  config: Config;
  originalTax: number;
  originalConvenienceCharge: number;
  originalDeliveryCharge: number;
  isTaxWaived: boolean;
  isConvenienceWaived: boolean;
  isDeliveryWaived: boolean;
  promo: string;
  promoApplied: boolean;
  promoError: boolean;
  isApplyingPromo: boolean;
  setPromo: (promo: string) => void;
  setPromoError: (error: boolean) => void;
  handlePromoSubmit: (e: React.FormEvent) => Promise<void>;
  handlePromoReset: () => void;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <>
      {/* Cart Items */}
      <CartItems 
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
      
      <Separator className="my-2" />
      
      {/* Price Summary */}
      <PriceSummary 
        subtotal={subtotal}
        tax={tax}
        taxRate={taxRate}
        convenienceCharge={convenienceCharge}
        deliveryCharge={deliveryCharge}
        discount={discount}
        total={total}
        config={config}
        originalTax={originalTax}
        originalConvenienceCharge={originalConvenienceCharge}
        originalDeliveryCharge={originalDeliveryCharge}
        isTaxWaived={isTaxWaived}
        isConvenienceWaived={isConvenienceWaived}
        isDeliveryWaived={isDeliveryWaived}
        handlePromoReset={handlePromoReset}
      />
      
      {/* Promo Form */}
      <PromoForm
        promo={promo}
        promoApplied={promoApplied}
        isApplyingPromo={isApplyingPromo}
        setPromo={setPromo}
        setPromoError={setPromoError}
        handlePromoSubmit={handlePromoSubmit}
      />
      
      {/* Promo Messages */}
      <PromoMessages promoError={promoError} promoApplied={promoApplied} />
      
      {/* Checkout Button */}
      <GoldButton
        className="w-full mt-3"
        onClick={() => {
          onClose();
          router.push("/checkout");
        }}
      >
        Proceed to Checkout
      </GoldButton>
    </>
  );
}

// Cart items component
function CartItems({ 
  cartItems, 
  updateQuantity, 
  removeFromCart 
}: {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
}) {
  return (
    <ul className="mb-4 max-h-40 overflow-y-auto">
      {cartItems.map(item => (
        <li key={item.id} className="flex justify-between items-center py-1 text-sm gap-2 text-yellow-700">
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 text-red-500 hover:text-red-700 h-6 w-6"
            onClick={() => removeFromCart(item.id)}
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <span className="flex-1">{item.name}</span>
          <Input
            type="number"
            min={1}
            value={item.quantity}
            onChange={e => updateQuantity(item.id, Number(e.target.value))}
            className="w-14 h-6 text-center text-xs border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400"
            aria-label={`Quantity for ${item.name}`}
          />
          <span className="w-14 text-right">${(item.price * item.quantity).toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}

// Price summary component
function PriceSummary({ 
  subtotal, 
  tax, 
  taxRate,
  convenienceCharge,
  deliveryCharge,
  discount, 
  total,
  originalTax,
  originalConvenienceCharge,
  originalDeliveryCharge,
  isTaxWaived,
  isConvenienceWaived,
  isDeliveryWaived,
  handlePromoReset 
}: {
  subtotal: number;
  tax: number;
  taxRate: number;
  convenienceCharge: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;
  originalTax: number;
  originalConvenienceCharge: number;
  originalDeliveryCharge: number;
  isTaxWaived: boolean;
  isConvenienceWaived: boolean;
  isDeliveryWaived: boolean;
  handlePromoReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-1 mb-2">
      <div className="flex justify-between text-sm text-yellow-600">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm text-yellow-600">
        <span>Tax ({Math.round(taxRate * 100)}%)</span>
        {isTaxWaived ? (
          <div className="flex items-center gap-2">
            <span className="line-through text-red-500">${originalTax.toFixed(2)}</span>
            <span className="text-green-600 font-semibold">$0.00</span>
          </div>
        ) : (
          <span>${tax.toFixed(2)}</span>
        )}
      </div>
      <div className="flex justify-between text-sm text-yellow-600">
        <span>Convenience Charge</span>
        {isConvenienceWaived ? (
          <div className="flex items-center gap-2">
            <span className="line-through text-red-500">${originalConvenienceCharge.toFixed(2)}</span>
            <span className="text-green-600 font-semibold">$0.00</span>
          </div>
        ) : (
          <span>${convenienceCharge.toFixed(2)}</span>
        )}
      </div>
      <div className="flex justify-between text-sm text-yellow-600">
        <span>Delivery Charge</span>
        {isDeliveryWaived ? (
          <div className="flex items-center gap-2">
            <span className="line-through text-red-500">${originalDeliveryCharge.toFixed(2)}</span>
            <span className="text-green-600 font-semibold">$0.00</span>
          </div>
        ) : (
          <span>${deliveryCharge.toFixed(2)}</span>
        )}
      </div>
      {!!discount && (
        <div className="flex justify-between text-sm text-green-700">
          <div>
            Promo Discount
            <span 
              className="text-xs ml-2 text-red-700 cursor-pointer"
              onClick={handlePromoReset}
            >
              remove
            </span>
          </div>
          <span>-${discount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold border-t border-yellow-200 pt-2 mt-2 text-yellow-700">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

// Promo form component
function PromoForm({
  promo,
  promoApplied,
  isApplyingPromo,
  setPromo,
  setPromoError,
  handlePromoSubmit
}: {
  promo: string;
  promoApplied: boolean;
  isApplyingPromo: boolean;
  setPromo: (promo: string) => void;
  setPromoError: (error: boolean) => void;
  handlePromoSubmit: (e: React.FormEvent) => Promise<void>;
}) {
  return (
    <form className="flex gap-2 mb-2" onSubmit={handlePromoSubmit}>
      <Input
        type="text"
        value={promo}
        onChange={e => {
          setPromo(e.target.value);
          setPromoError(false);
        }}
        placeholder="Promo code"
        className="flex-1 text-sm border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400"
        autoFocus
        disabled={promoApplied}
      />
      <Button
        className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white border-yellow-400 hover:border-yellow-500"
        type="submit"
        size="sm"
        variant="secondary"
        disabled={promoApplied || !promo || isApplyingPromo}
      >
        {promoApplied ? (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full text-white flex items-center justify-center text-xs">✔</span>
            Applied
          </span>
        ) : isApplyingPromo ? (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-gray-400 rounded-full text-white flex items-center justify-center text-xs animate-spin">⏳</span>
            Applying...
          </span>
        ) : (
          "Apply"
        )}
      </Button>
    </form>
  );
}

// Promo messages component
function PromoMessages({ 
  promoError, 
  promoApplied 
}: {
  promoError: boolean;
  promoApplied: boolean;
}) {
  return (
    <>
      {promoError && !promoApplied && (
        <div className="text-xs text-red-500 mb-1">Invalid or expired promo code.</div>
      )}
      {promoApplied && (
        <div className="text-xs text-green-600 mb-1">Promo code applied!</div>
      )}
    </>
  );
}
