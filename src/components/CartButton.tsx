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
        className="relative p-2 rounded-full hover:bg-green-100 cursor-pointer"
        aria-label="View cart"
        onClick={openCart}
      >
        <ShoppingBasket className="w-10 h-10 text-lg text-green-500" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full text-xs font-bold px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white">
            {cartCount}
          </span>
        )}
      </Button>
      <CartDropdown open={isCartOpen} onClose={closeCart} anchorRef={cartBtnRef} />
    </div>
  );
});

export default CartButton;
