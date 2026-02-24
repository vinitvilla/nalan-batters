import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import CartDropdown from "./CartDropdown";

const CartButton = forwardRef<{ openDropdown: () => void }>((_, ref) => {
  const cartCount = useCartStore(state => state.items.reduce((sum, i) => sum + i.quantity, 0));
  const isCartOpen = useCartStore(state => state.isCartOpen);
  const openCart = useCartStore(state => state.openCart);
  const closeCart = useCartStore(state => state.closeCart);
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    openDropdown: openCart,
  }), [openCart]);

  return (
    <div className="relative">
      <Button
        ref={cartBtnRef}
        variant="ghost"
        className="relative p-2.5 w-11 h-11 rounded-full hover:bg-yellow-100/50 cursor-pointer border-2 border-yellow-200 hover:border-yellow-300 hover:scale-105 transition-all duration-200 flex items-center justify-center"
        aria-label="View cart"
        onClick={openCart}
      >
        <ShoppingBasket className="w-6 h-6 text-yellow-600 hover:text-yellow-700" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full text-xs font-bold px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white shadow-lg">
            {cartCount}
          </span>
        )}
      </Button>
      <CartDropdown open={isCartOpen} onClose={closeCart} anchorRef={cartBtnRef} />
    </div>
  );
});

CartButton.displayName = 'CartButton';

export default CartButton;
