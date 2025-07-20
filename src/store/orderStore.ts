import { DiscountType } from "@/generated/prisma";
import { create } from "zustand";
import moment from 'moment';

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
  freeDelivery?: Record<string, string[]>;
}

interface OrderCalculations {
  subtotal: number;
  tax: number;
  convenienceCharge: number;
  deliveryCharge: number;
  appliedDiscount: number;
  finalTotal: number;
  // Original amounts (before waiving)
  originalTax: number;
  originalConvenienceCharge: number;
  originalDeliveryCharge: number;
  // Waive flags
  isTaxWaived: boolean;
  isConvenienceWaived: boolean;
  isDeliveryWaived: boolean;
}

interface OrderStore {
  selectedDeliveryDate: string;
  setSelectedDeliveryDate: (date: string) => void;
  orderType: 'PICKUP' | 'DELIVERY' | null;
  setOrderType: (type: 'PICKUP' | 'DELIVERY' | null) => void;
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
  getOrderCalculations: (cartItems: CartItem[], config?: Config, address?: any, deliveryDate?: string, orderType?: 'PICKUP' | 'DELIVERY' | null) => OrderCalculations;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  selectedDeliveryDate: "",
  setSelectedDeliveryDate: (date) => set({ selectedDeliveryDate: date }),
  orderType: null, // Start with no selection, user must choose
  setOrderType: (type) => set({ orderType: type }),
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
  getOrderCalculations: (cartItems: CartItem[], config?: Config, address?: any, deliveryDate?: string, orderType?: 'PICKUP' | 'DELIVERY' | null): OrderCalculations => {
    const state = get();
    const currentOrderType = orderType || state.orderType || 'DELIVERY'; // Default to DELIVERY if null
    
    // Basic calculations
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = config?.taxPercent?.percent ? config.taxPercent.percent / 100 : 0.13; // Default 13%
    const tax = +(subtotal * taxRate).toFixed(2);
    let convenienceCharge = config?.convenienceCharge?.amount || 0;
    let deliveryCharge = config?.deliveryCharge?.amount || 0;
    
    // For pickup orders, waive delivery and convenience charges
    if (currentOrderType === 'PICKUP') {
      deliveryCharge = 0;
      convenienceCharge = 0;
    } else {
      // Check for free delivery eligibility (only for delivery orders)
      if (address && deliveryDate && deliveryCharge > 0 && config?.freeDelivery) {
        const deliveryDateObj = moment(deliveryDate);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = daysOfWeek[deliveryDateObj.day()];
        
        const areasForDay = config.freeDelivery[dayName];
        if (Array.isArray(areasForDay) && address.city) {
          const isEligible = areasForDay.some((area: string) => 
            area.toLowerCase().includes(address.city.toLowerCase()) ||
            address.city.toLowerCase().includes(area.toLowerCase())
          );
          
          if (isEligible) {
            deliveryCharge = 0;
            convenienceCharge = 0; // Also waive convenience charge for free delivery areas
          }
        }
      }
    }
    
    // Apply discount
    const appliedDiscount = state.discountType === DiscountType.PERCENTAGE
      ? +(subtotal * (state.discount / 100)).toFixed(2)
      : state.discount;
    
    // Calculate final total with waivers
    const taxAmount = config?.taxPercent?.waive ? 0 : tax;
    const convenienceAmount = config?.convenienceCharge?.waive || currentOrderType === 'PICKUP' ? 0 : convenienceCharge;
    const deliveryAmount = config?.deliveryCharge?.waive || currentOrderType === 'PICKUP' ? 0 : deliveryCharge;
    const finalTotal = +(subtotal + taxAmount + convenienceAmount + deliveryAmount - appliedDiscount).toFixed(2);
    
    return {
      subtotal,
      tax: taxAmount, // Use the waived tax amount
      convenienceCharge: convenienceAmount, // Use the waived convenience amount
      deliveryCharge: deliveryAmount, // Use the waived delivery amount
      appliedDiscount,
      finalTotal,
      // Original amounts (before waiving)
      originalTax: tax,
      originalConvenienceCharge: config?.convenienceCharge?.amount || 0,
      originalDeliveryCharge: config?.deliveryCharge?.amount || 0,
      // Waive flags
      isTaxWaived: config?.taxPercent?.waive || false,
      isConvenienceWaived: config?.convenienceCharge?.waive || currentOrderType === 'PICKUP',
      isDeliveryWaived: config?.deliveryCharge?.waive || currentOrderType === 'PICKUP',
    };
  },
}));
