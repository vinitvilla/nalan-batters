import type { DiscountType } from '@/generated/prisma';

export interface PromoState {
  id: string | null;
  code: string;
  applied: boolean;
  discount: number;
  discountType: DiscountType;
}

// Promo code validation result
export interface PromoCodeResult {
  valid: boolean;
  error?: string;
  promo?: {
    id: string;
    code: string;
    discountType: DiscountType;
    discount: number;
    maxDiscount?: number;
  };
}
