import { DiscountType } from "@/generated/prisma";
import { create } from "zustand";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Config {
  taxPercent?: { percent?: number; waive?: boolean };
  convenienceCharge?: { amount?: number; waive?: boolean };
  deliveryCharge?: { amount?: number; waive?: boolean };
}

interface OrderCalculations {
  subtotal: number;
  tax: number;
  convenienceCharge: number;
  deliveryCharge: number;
  appliedDiscount: number;
  finalTotal: number;
}

interface OrderStore {
  selectedDeliveryDate: string;
  setSelectedDeliveryDate: (date: string) => void;
  promoId: string | null;
  promo: string;
  promoApplied: boolean;
  discount: number;
  discountType: DiscountType;
  setPromo: (promo: string) => void;
  setPromoApplied: (applied: boolean) => void;
  setDiscount: (discount: number) => void;
  setDiscountType: (discountType: DiscountType) => void;
  applyPromo: (code: string) => Promise<{ success: boolean }>;
  
  // Calculation getters
  getOrderCalculations: (cartItems: CartItem[], config?: Config) => OrderCalculations;
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
  
  // Calculation getters
  getOrderCalculations: (cartItems: CartItem[], config?: Config): OrderCalculations => {
    const state = get();
    
    // Basic calculations
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = config?.taxPercent?.percent ? config.taxPercent.percent / 100 : 0.13; // Default 13%
    const tax = +(subtotal * taxRate).toFixed(2);
    const convenienceCharge = config?.convenienceCharge?.amount || 0;
    const deliveryCharge = config?.deliveryCharge?.amount || 0;
    
    // Apply discount
    const appliedDiscount = state.discountType === DiscountType.PERCENTAGE
      ? +(subtotal * (state.discount / 100)).toFixed(2)
      : state.discount;
    
    // Calculate final total with waivers
    const taxAmount = config?.taxPercent?.waive ? 0 : tax;
    const convenienceAmount = config?.convenienceCharge?.waive ? 0 : convenienceCharge;
    const deliveryAmount = config?.deliveryCharge?.waive ? 0 : deliveryCharge;
    const finalTotal = +(subtotal + taxAmount + convenienceAmount + deliveryAmount - appliedDiscount).toFixed(2);
    
    return {
      subtotal,
      tax,
      convenienceCharge,
      deliveryCharge,
      appliedDiscount,
      finalTotal
    };
  },
}));
