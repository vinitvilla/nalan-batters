import type { DiscountType } from '@/generated/prisma';

export interface PromoState {
  id: string | null;
  code: string;
  applied: boolean;
  discount: number;
  discountType: DiscountType;
}
