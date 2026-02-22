import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils/commonFunctions';
import type { PromoCodeResult } from '@/types/promo';

/**
 * Promo Code Service
 * Handles promo code validation and usage tracking
 * Consolidates logic from orderHelpers and API routes
 */

// Async - validates and applies promo code
export async function validateAndApplyPromoCode(
  code: string,
  subtotal: number
): Promise<PromoCodeResult> {
  // Find promo code
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase(), isDeleted: false },
  });

  // Check if promo exists
  if (!promo) {
    return { valid: false, error: 'Invalid promo code' };
  }

  // Check if active
  if (!promo.isActive) {
    return { valid: false, error: 'Promo code is no longer active' };
  }

  // Check if expired
  if (promo.expiresAt && new Date() > promo.expiresAt) {
    return { valid: false, error: 'Promo code has expired' };
  }

  // Check minimum order amount
  if (promo.minOrderAmount && subtotal < Number(promo.minOrderAmount)) {
    return {
      valid: false,
      error: `Minimum order of ${formatCurrency(Number(promo.minOrderAmount))} required`,
    };
  }

  // Check usage limit
  if (promo.usageLimit && promo.currentUsage >= promo.usageLimit) {
    return { valid: false, error: 'Promo code usage limit reached' };
  }

  // Promo is valid!
  return {
    valid: true,
    promo: {
      id: promo.id,
      code: promo.code,
      discountType: promo.discountType,
      discount: Number(promo.discount),
      maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : undefined,
      minOrderAmount: promo.minOrderAmount ? Number(promo.minOrderAmount) : undefined,
    },
  };
}

// Async - increments promo code usage after successful order
export async function incrementPromoUsage(promoId: string): Promise<void> {
  await prisma.promoCode.update({
    where: { id: promoId },
    data: { currentUsage: { increment: 1 } },
  });
}
