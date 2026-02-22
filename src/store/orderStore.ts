import { create } from "zustand";
import { DiscountType } from '@/generated/prisma';
import type { CartItem } from '@/types/cart';
import type { Config } from '@/types/config';
import type { OrderCalculations } from '@/types/order';
import type { PromoState } from '@/types/promo';
import type { AddressFields } from '@/store/addressStore';
import { isFreeDeliveryEligible } from '@/services/order/delivery.service';
import { calculateOrderCharges, calculateDiscountAmount, calculateOrderTotal } from '@/services/order/orderCalculation.service';

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
  getOrderCalculations: (cartItems: CartItem[], config?: Config, address?: AddressFields | null, deliveryDate?: string, deliveryType?: 'PICKUP' | 'DELIVERY' | null) => OrderCalculations;
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
    maxDiscount: undefined,
    minOrderAmount: undefined,
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
      maxDiscount: undefined,
      minOrderAmount: undefined,
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
            maxDiscount: data.maxDiscount,
            minOrderAmount: data.minOrderAmount,
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
  getOrderCalculations: (cartItems: CartItem[], config?: Config, address?: AddressFields | null, deliveryDate?: string, deliveryType?: 'PICKUP' | 'DELIVERY' | null): OrderCalculations => {
    const state = get();
    const currentDeliveryType = deliveryType || state.deliveryType || 'DELIVERY';

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // If no config, return basic calculation
    if (!config?.additionalCharges) {
      return {
        subtotal,
        finalTotal: subtotal,
        tax: 0,
        taxRate: 0,
        convenienceCharge: 0,
        deliveryCharge: 0,
        appliedDiscount: 0,
        originalTax: 0,
        originalConvenienceCharge: 0,
        originalDeliveryCharge: 0,
        isTaxWaived: false,
        isConvenienceWaived: false,
        isDeliveryWaived: false,
      };
    }

    // Parse config for services
    const chargeConfig = {
      taxPercent: {
        percent: config.additionalCharges.taxPercent?.percent ?? 13,
        waive: config.additionalCharges.taxPercent?.waive ?? false
      },
      convenienceCharge: {
        amount: config.additionalCharges.convenienceCharge?.amount ?? 0,
        waive: config.additionalCharges.convenienceCharge?.waive ?? false
      },
      deliveryCharge: {
        amount: config.additionalCharges.deliveryCharge?.amount ?? 0,
        waive: config.additionalCharges.deliveryCharge?.waive ?? false
      }
    };
    const freeDeliveryConfig = config.freeDelivery || {};

    // Check free delivery eligibility using service
    const isFreeDelivery = address && deliveryDate && currentDeliveryType === 'DELIVERY'
      ? isFreeDeliveryEligible(new Date(deliveryDate), address.city, currentDeliveryType, freeDeliveryConfig)
      : false;

    // Calculate charges using service
    const charges = calculateOrderCharges(subtotal, chargeConfig, isFreeDelivery, currentDeliveryType);

    // Calculate promo discount using service
    const isPromoValid = state.promo.applied && (!state.promo.minOrderAmount || subtotal >= state.promo.minOrderAmount);
    const discountAmount = isPromoValid
      ? calculateDiscountAmount(subtotal, state.promo.discountType, state.promo.discount, state.promo.maxDiscount)
      : 0;

    // Calculate total using service
    return calculateOrderTotal(subtotal, charges, discountAmount, chargeConfig.taxPercent.percent);
  },
}));
