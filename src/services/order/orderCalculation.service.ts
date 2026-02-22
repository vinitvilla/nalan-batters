import type { ChargeConfig } from '@/types/config';
import type { OrderCharges, OrderCalculations } from '@/types/order';
import type { DeliveryType, DiscountType } from '@/generated/prisma';

/**
 * Order Calculation Service
 * Pure calculation logic (no database access)
 * Consolidates calculation logic from orderHelpers, orderStore, and components
 */

// Pure - calculates all order charges (tax, convenience, delivery)
export function calculateOrderCharges(
  subtotal: number,
  chargeConfig: ChargeConfig,
  isFreeDelivery: boolean,
  deliveryType: DeliveryType
): OrderCharges {
  // Calculate tax
  const taxAmount = chargeConfig.taxPercent.waive
    ? 0
    : (subtotal * chargeConfig.taxPercent.percent) / 100;

  // Calculate convenience charge
  const convenienceAmount = chargeConfig.convenienceCharge.waive
    ? 0
    : chargeConfig.convenienceCharge.amount;

  // Calculate delivery charge
  // Free delivery, pickup, or waived = no charge
  const deliveryAmount =
    isFreeDelivery || deliveryType === 'PICKUP' || chargeConfig.deliveryCharge.waive
      ? 0
      : chargeConfig.deliveryCharge.amount;

  // Return all charges with waive flags
  return {
    tax: taxAmount,
    convenienceCharge: convenienceAmount,
    deliveryCharge: deliveryAmount,
    originalTax: (subtotal * chargeConfig.taxPercent.percent) / 100,
    originalConvenienceCharge: chargeConfig.convenienceCharge.amount,
    originalDeliveryCharge: chargeConfig.deliveryCharge.amount,
    isTaxWaived: chargeConfig.taxPercent.waive,
    isConvenienceWaived: chargeConfig.convenienceCharge.waive,
    isDeliveryWaived: isFreeDelivery || deliveryType === 'PICKUP' || chargeConfig.deliveryCharge.waive,
  };
}

// Pure - calculates discount amount from promo code
export function calculateDiscountAmount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: number,
  maxDiscount?: number
): number {
  let discountAmount = 0;

  if (discountType === 'PERCENTAGE') {
    discountAmount = (subtotal * discountValue) / 100;
  } else {
    // VALUE type
    discountAmount = discountValue;
  }

  // Apply max discount cap if specified
  if (maxDiscount && discountAmount > maxDiscount) {
    discountAmount = maxDiscount;
  }

  // Discount can never exceed subtotal
  return Math.min(discountAmount, subtotal);
}

// Pure - calculates final order total
export function calculateOrderTotal(
  subtotal: number,
  charges: OrderCharges,
  discount: number,
  taxRate?: number
): OrderCalculations {
  const chargesTotal = charges.tax + charges.convenienceCharge + charges.deliveryCharge;
  const finalTotal = Math.max(0, subtotal + chargesTotal - discount);

  return {
    subtotal,
    tax: charges.tax,
    taxRate: charges.isTaxWaived ? 0 : (taxRate ?? 13),
    convenienceCharge: charges.convenienceCharge,
    deliveryCharge: charges.deliveryCharge,
    appliedDiscount: discount,
    finalTotal,
    originalTax: charges.originalTax,
    originalConvenienceCharge: charges.originalConvenienceCharge,
    originalDeliveryCharge: charges.originalDeliveryCharge,
    isTaxWaived: charges.isTaxWaived,
    isConvenienceWaived: charges.isConvenienceWaived,
    isDeliveryWaived: charges.isDeliveryWaived,
  };
}
