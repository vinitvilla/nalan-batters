import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
  fetchAndMergeCart: (userId: string) => Promise<void>;
  syncCartToDB: (userId: string) => Promise<void>;
}

export const useCartStore = create(
  devtools<CartState>((set, get) => ({
    items: [],
    addToCart: (item) => {
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
    },
    removeFromCart: (id) => set({ items: get().items.filter(i => i.id !== id) }),
    clearCart: () => set({ items: [] }),
    updateQuantity: (id, quantity) =>
      set({
        items: get().items.map(i =>
          i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
        ),
      }),
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
    fetchAndMergeCart: async (userId: string) => {
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
      await get().syncCartToDB(userId);
    },
    syncCartToDB: async (userId: string) => {
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
