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
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  cartCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  promo: string;
  promoApplied: boolean;
  discount: number;
  setPromo: (promo: string) => void;
  setPromoApplied: (applied: boolean) => void;
  setDiscount: (discount: number) => void;
  fetchAndMergeCart: () => Promise<void>;
  syncCartToDB: () => Promise<void>;
}

export const useCartStore = create(
  devtools<CartState>((set, get) => ({
    items: [],
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
    promo: "",
    promoApplied: false,
    discount: 0,
    setPromo: (promo) => set({ promo }),
    setPromoApplied: (applied) => set({ promoApplied: applied }),
    setDiscount: (discount) => set({ discount }),
    // --- Cart persistence/merging ---
    fetchAndMergeCart: async () => {
      const userId = userStore.getState().id;
      if (!userId) return;
      const localItems = get().items;
      const res = await fetch(`/api/public/cart?userId=${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      const dbItems = (data.cart?.items || []).map((item: any) => ({
        id: item.productId,
        name: item.product?.name || '',
        price: Number(item.product?.price) || 0,
        quantity: item.quantity,
      }));
      // Merge logic: combine quantities for same productId
      const map = new Map<string, CartItem>();
      for (const item of [...dbItems, ...localItems]) {
        if (map.has(item.id)) {
          map.set(item.id, {
            ...item,
            quantity: map.get(item.id)!.quantity + item.quantity,
          });
        } else {
          map.set(item.id, { ...item });
        }
      }
      const merged = Array.from(map.values());
      set({ items: merged });
      // Sync merged cart to DB
      await get().syncCartToDB();
    },
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
