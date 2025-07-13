import { create } from "zustand";

interface OrderStore {
  selectedDeliveryDate: string;
  setSelectedDeliveryDate: (date: string) => void;
  promo: string;
  promoApplied: boolean;
  discount: number;
  setPromo: (promo: string) => void;
  setPromoApplied: (applied: boolean) => void;
  setDiscount: (discount: number) => void;
  applyPromo: (code: string) => Promise<{ success: boolean }>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  selectedDeliveryDate: "",
  setSelectedDeliveryDate: (date) => set({ selectedDeliveryDate: date }),
  promo: "",
  promoApplied: false,
  discount: 0,
  setPromo: (promo) => set({ promo }),
  setPromoApplied: (applied) => set({ promoApplied: applied }),
  setDiscount: (discount) => set({ discount }),
  applyPromo: async (code: string) => {
    try {
      const res = await fetch("/api/public/promoCodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok && data.valid && typeof data.discount === "number") {
        set({ discount: data.discount, promoApplied: true });
        return { success: true };
      } else {
        set({ discount: 0, promoApplied: false });
        return { success: false };
      }
    } catch {
      set({ discount: 0, promoApplied: false });
      return { success: false };
    }
  },
}));
