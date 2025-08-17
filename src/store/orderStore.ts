import { create } from "zustand";
import moment from 'moment';
import { DiscountType } from '@/generated/prisma';
import type { CartItem } from '@/types/cart';
import type { Config } from '@/types/config';
import type { OrderCalculations } from '@/types/order';
import type { PromoState } from '@/types/promo';

interface OrderStore {
  selectedDeliveryDate: string;
  setSelectedDeliveryDate: (date: string) => void;
  deliveryType: 'PICKUP' | 'DELIVERY' | null;
  setDeliveryType: (type: 'PICKUP' | 'DELIVERY' | null) => void;
  promo: PromoState;
  setPromo: (promo: Partial<PromoState>) => void;
  applyPromo: (code: string) => Promise<{ success: boolean }>;
  clearPromo: () => void;
  
  // Calculation getters
  getOrderCalculations: (cartItems: CartItem[], config?: Config, address?: any, deliveryDate?: string, deliveryType?: 'PICKUP' | 'DELIVERY' | null) => OrderCalculations;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  selectedDeliveryDate: "",
  setSelectedDeliveryDate: (date) => set({ selectedDeliveryDate: date }),
  deliveryType: null, // Start with no selection, user must choose
  setDeliveryType: (type) => set({ deliveryType: type }),
  promo: {
    id: null,
    code: "",
    applied: false,
    discount: 0,
    discountType: DiscountType.PERCENTAGE,
  },
  setPromo: (promoUpdate) => set((state) => ({ 
    promo: { ...state.promo, ...promoUpdate } 
  })),
  clearPromo: () => set({
    promo: {
      id: null,
      code: "",
      applied: false,
      discount: 0,
      discountType: DiscountType.PERCENTAGE,
    }
  }),
  applyPromo: async (code: string) => {
    try {
      const res = await fetch("/api/public/promoCodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok && data.valid && typeof data.discount === "number" && data.discountType) {
        set((state) => ({
          promo: {
            ...state.promo,
            id: data.id,
            code: code.trim().toUpperCase(),
            applied: true,
            discount: data.discount,
            discountType: data.discountType,
          }
        }));
        return { success: true };
      } else {
        get().clearPromo();
        return { success: false };
      }
    } catch {
      get().clearPromo();
      return { success: false };
    }
  },
  
  // Calculation getters
  getOrderCalculations: (cartItems: CartItem[], config?: Config, address?: any, deliveryDate?: string, deliveryType?: 'PICKUP' | 'DELIVERY' | null): OrderCalculations => {
    const state = get();
    const currentDeliveryType = deliveryType || state.deliveryType || 'DELIVERY'; // Default to DELIVERY if null
    
    // Get config values from additionalCharges structure
    const charges = config?.additionalCharges || {};
    const taxConfig = charges.taxPercent || { percent: 13, waive: false };
    const convenienceConfig = charges.convenienceCharge || { amount: 0, waive: false };
    const deliveryConfig = charges.deliveryCharge || { amount: 0, waive: false };
    
    // Basic calculations
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = taxConfig.percent ? taxConfig.percent / 100 : 0.13; // Default 13%
    const tax = +(subtotal * taxRate).toFixed(2);
    let convenienceCharge = convenienceConfig.amount || 0;
    let deliveryCharge = deliveryConfig.amount || 0;
    
    // For pickup orders, waive delivery and convenience charges
    if (currentDeliveryType === 'PICKUP') {
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
    const appliedDiscount = state.promo.discountType === DiscountType.PERCENTAGE
      ? +(subtotal * (state.promo.discount / 100)).toFixed(2)
      : state.promo.discount;
    
    // Calculate final total with waivers
    const taxAmount = taxConfig.waive ? 0 : tax;
    const convenienceAmount = convenienceConfig.waive || currentDeliveryType === 'PICKUP' ? 0 : convenienceCharge;
    const deliveryAmount = deliveryConfig.waive || currentDeliveryType === 'PICKUP' ? 0 : deliveryCharge;
    const finalTotal = +(subtotal + taxAmount + convenienceAmount + deliveryAmount - appliedDiscount).toFixed(2);
    
    return {
      subtotal,
      tax: taxAmount, // Use the waived tax amount
      taxRate,
      convenienceCharge: convenienceAmount, // Use the waived convenience amount
      deliveryCharge: deliveryAmount, // Use the waived delivery amount
      appliedDiscount,
      finalTotal,
      // Original amounts (before waiving)
      originalTax: tax,
      originalConvenienceCharge: convenienceConfig.amount || 0,
      originalDeliveryCharge: deliveryConfig.amount || 0,
      // Waive flags
      isTaxWaived: taxConfig.waive || false,
      isConvenienceWaived: convenienceConfig.waive || currentDeliveryType === 'PICKUP',
      isDeliveryWaived: deliveryConfig.waive || currentDeliveryType === 'PICKUP',
    };
  },
}));
