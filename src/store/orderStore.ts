import { DiscountType } from "@/generated/prisma";
import { create } from "zustand";

interface OrderStore {
  selectedDeliveryDate: string;
  setSelectedDeliveryDate: (date: string) => void;
  promoId: string|null;
  promo: string;
  promoApplied: boolean;
  discount: number;
  discountType: DiscountType;
  setPromo: (promo: string) => void;
  setPromoApplied: (applied: boolean) => void;
  setDiscount: (discount: number) => void;
  setDiscountType: (discountType: DiscountType)=> void;
  applyPromo: (code: string) => Promise<{ success: boolean }>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  selectedDeliveryDate: "",
  setSelectedDeliveryDate: (date) => set({ selectedDeliveryDate: date }),
  promoId: null,
  promo: "",
  promoApplied: false,
  discount: 0,
  discountType: DiscountType.PERCENTAGE,
  setPromo: (promo) => set({ promo }),
  setPromoApplied: (applied) => set({ promoApplied: applied }),
  setDiscount: (discount) => set({ discount }),
  setDiscountType: (discountType) => set({ discountType }),
  applyPromo: async (code: string) => {
    try {
      const res = await fetch("/api/public/promoCodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok && data.valid && typeof data.discount === "number" && data.discountType) {
        set({ promoId: data.id, discount: data.discount, discountType: data.discountType, promoApplied: true });
        return { success: true };
      } else {
        set({ discount: 0, discountType: DiscountType.PERCENTAGE, promoApplied: false });
        return { success: false };
      }
    } catch {
      set({ discount: 0, discountType: DiscountType.PERCENTAGE, promoApplied: false });
      return { success: false };
    }
  },
}));
