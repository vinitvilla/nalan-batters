import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { userStore } from '@/store/userStore';

export type CartItem = {
  id: string; // productId
  name: string;
  price: number;
  quantity: number;
};

interface CartState {
  items: CartItem[];
  setCartItems: (items: CartItem[]) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  cartCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  syncCartToDB: () => Promise<void>;
}

export const useCartStore = create(
  devtools<CartState>((set, get) => ({
    items: [],
    setCartItems: (items) => set({ items }),
    addToCart: (item) => {
      const userId = userStore.getState().id;
      if (!item || !item.id || item.quantity <= 0) return;
      // Check if item already exists in cart
      if (item.quantity <= 0) {
        get().removeFromCart(item.id);
        return;
      }
      const items = get().items;
      const existing = items.find(i => i.id === item.id);
      if (existing) {
        set({
          items: items.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        });
      } else {
        set({ items: [...items, item] });
      }
      if (userId) {
        get().syncCartToDB();
      }
    },
    removeFromCart: (id) => {
      const userId = userStore.getState().id;
      set({ items: get().items.filter(i => i.id !== id) });
      if (userId) get().syncCartToDB();
    },
    clearCart: () => {
      const userId = userStore.getState().id;
      set({ items: [] });
      if (userId) get().syncCartToDB();
    },
    updateQuantity: (id, quantity) => {
      const userId = userStore.getState().id;
      if (quantity <= 0) {
        get().removeFromCart(id);
        return;
      }
      set({
        items: get().items.map(i =>
          i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
        ),
      });
      if (userId) get().syncCartToDB();
    },
    cartCount: 0,
    isCartOpen: false,
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),
    syncCartToDB: async () => {
      const userId = userStore.getState().id;
      if (!userId) return;
      const items = get().items;
      await fetch('/api/public/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
        }),
      });
    },
  }), { name: "CartStore" })
);

// Selector for cart count
export const useCartCount = () =>
  useCartStore(state => state.items.reduce((sum, i) => sum + i.quantity, 0));
