import { describe, it, expect } from 'vitest';
import {
  calculateOrderCharges,
  calculateDiscountAmount,
  calculateOrderTotal,
} from './orderCalculation.service';
import type { ChargeConfig } from '@/types/config';

// Default config for tests
const defaultConfig: ChargeConfig = {
  taxPercent: { percent: 13, waive: false },
  convenienceCharge: { amount: 2.5, waive: false },
  deliveryCharge: { amount: 5, waive: false },
};

describe('calculateOrderCharges', () => {
  it('calculates all charges for a DELIVERY order', () => {
    const result = calculateOrderCharges(100, defaultConfig, false, 'DELIVERY');
    expect(result.tax).toBe(13);
    expect(result.convenienceCharge).toBe(2.5);
    expect(result.deliveryCharge).toBe(5);
    expect(result.isTaxWaived).toBe(false);
    expect(result.isConvenienceWaived).toBe(false);
    expect(result.isDeliveryWaived).toBe(false);
  });

  it('sets delivery charge to 0 for PICKUP orders', () => {
    const result = calculateOrderCharges(100, defaultConfig, false, 'PICKUP');
    expect(result.deliveryCharge).toBe(0);
    expect(result.isDeliveryWaived).toBe(true);
    expect(result.tax).toBe(13);
    expect(result.convenienceCharge).toBe(2.5);
  });

  it('sets delivery charge to 0 when free delivery is eligible', () => {
    const result = calculateOrderCharges(100, defaultConfig, true, 'DELIVERY');
    expect(result.deliveryCharge).toBe(0);
    expect(result.isDeliveryWaived).toBe(true);
  });

  it('waives tax when config says to waive', () => {
    const config: ChargeConfig = {
      ...defaultConfig,
      taxPercent: { percent: 13, waive: true },
    };
    const result = calculateOrderCharges(100, config, false, 'DELIVERY');
    expect(result.tax).toBe(0);
    expect(result.isTaxWaived).toBe(true);
    expect(result.originalTax).toBe(13); // Original amount still calculated
  });

  it('waives convenience charge when config says to waive', () => {
    const config: ChargeConfig = {
      ...defaultConfig,
      convenienceCharge: { amount: 2.5, waive: true },
    };
    const result = calculateOrderCharges(100, config, false, 'DELIVERY');
    expect(result.convenienceCharge).toBe(0);
    expect(result.isConvenienceWaived).toBe(true);
    expect(result.originalConvenienceCharge).toBe(2.5);
  });

  it('waives delivery charge when config says to waive', () => {
    const config: ChargeConfig = {
      ...defaultConfig,
      deliveryCharge: { amount: 5, waive: true },
    };
    const result = calculateOrderCharges(100, config, false, 'DELIVERY');
    expect(result.deliveryCharge).toBe(0);
    expect(result.isDeliveryWaived).toBe(true);
    expect(result.originalDeliveryCharge).toBe(5);
  });

  it('preserves original amounts even when all are waived', () => {
    const config: ChargeConfig = {
      taxPercent: { percent: 13, waive: true },
      convenienceCharge: { amount: 2.5, waive: true },
      deliveryCharge: { amount: 5, waive: true },
    };
    const result = calculateOrderCharges(50, config, false, 'DELIVERY');
    expect(result.tax).toBe(0);
    expect(result.convenienceCharge).toBe(0);
    expect(result.deliveryCharge).toBe(0);
    expect(result.originalTax).toBe(6.5); // 50 * 13% = 6.5
    expect(result.originalConvenienceCharge).toBe(2.5);
    expect(result.originalDeliveryCharge).toBe(5);
  });

  it('handles zero subtotal', () => {
    const result = calculateOrderCharges(0, defaultConfig, false, 'DELIVERY');
    expect(result.tax).toBe(0);
    expect(result.convenienceCharge).toBe(2.5);
    expect(result.deliveryCharge).toBe(5);
  });
});

describe('calculateDiscountAmount', () => {
  it('calculates percentage discount correctly', () => {
    const result = calculateDiscountAmount(100, 'PERCENTAGE', 10);
    expect(result).toBe(10); // 10% of $100 = $10
  });

  it('calculates value discount correctly', () => {
    const result = calculateDiscountAmount(100, 'VALUE', 15);
    expect(result).toBe(15); // Flat $15 off
  });

  it('applies max discount cap for percentage', () => {
    const result = calculateDiscountAmount(200, 'PERCENTAGE', 50, 30);
    expect(result).toBe(30); // 50% of $200 = $100, but capped at $30
  });

  it('applies max discount cap for value', () => {
    const result = calculateDiscountAmount(100, 'VALUE', 50, 20);
    expect(result).toBe(20); // $50 off but capped at $20
  });

  it('discount cannot exceed subtotal', () => {
    const result = calculateDiscountAmount(10, 'VALUE', 50);
    expect(result).toBe(10); // $50 off but only $10 subtotal
  });

  it('discount cannot exceed subtotal even with percentage', () => {
    const result = calculateDiscountAmount(5, 'PERCENTAGE', 300);
    expect(result).toBe(5); // 300% of $5 = $15, capped at $5
  });

  it('handles zero discount value', () => {
    const result = calculateDiscountAmount(100, 'PERCENTAGE', 0);
    expect(result).toBe(0);
  });

  it('handles zero subtotal', () => {
    const result = calculateDiscountAmount(0, 'PERCENTAGE', 10);
    expect(result).toBe(0);
  });
});

describe('calculateOrderTotal', () => {
  it('calculates final total correctly with all charges', () => {
    const charges = {
      tax: 13,
      convenienceCharge: 2.5,
      deliveryCharge: 5,
      originalTax: 13,
      originalConvenienceCharge: 2.5,
      originalDeliveryCharge: 5,
      isTaxWaived: false,
      isConvenienceWaived: false,
      isDeliveryWaived: false,
    };
    const result = calculateOrderTotal(100, charges, 10, 13);
    // 100 + 13 + 2.5 + 5 - 10 = 110.5
    expect(result.finalTotal).toBe(110.5);
    expect(result.subtotal).toBe(100);
    expect(result.appliedDiscount).toBe(10);
    expect(result.taxRate).toBe(13);
  });

  it('sets taxRate to 0 when tax is waived', () => {
    const charges = {
      tax: 0,
      convenienceCharge: 0,
      deliveryCharge: 0,
      originalTax: 13,
      originalConvenienceCharge: 0,
      originalDeliveryCharge: 0,
      isTaxWaived: true,
      isConvenienceWaived: false,
      isDeliveryWaived: false,
    };
    const result = calculateOrderTotal(100, charges, 0, 13);
    expect(result.taxRate).toBe(0);
    expect(result.finalTotal).toBe(100);
  });

  it('final total cannot go below zero', () => {
    const charges = {
      tax: 0,
      convenienceCharge: 0,
      deliveryCharge: 0,
      originalTax: 0,
      originalConvenienceCharge: 0,
      originalDeliveryCharge: 0,
      isTaxWaived: true,
      isConvenienceWaived: true,
      isDeliveryWaived: true,
    };
    const result = calculateOrderTotal(10, charges, 100);
    expect(result.finalTotal).toBe(0); // Math.max(0, 10 + 0 - 100) = 0
  });

  it('includes waive flags in the result', () => {
    const charges = {
      tax: 0,
      convenienceCharge: 0,
      deliveryCharge: 0,
      originalTax: 13,
      originalConvenienceCharge: 2.5,
      originalDeliveryCharge: 5,
      isTaxWaived: true,
      isConvenienceWaived: true,
      isDeliveryWaived: true,
    };
    const result = calculateOrderTotal(100, charges, 0);
    expect(result.isTaxWaived).toBe(true);
    expect(result.isConvenienceWaived).toBe(true);
    expect(result.isDeliveryWaived).toBe(true);
    expect(result.originalTax).toBe(13);
    expect(result.originalConvenienceCharge).toBe(2.5);
    expect(result.originalDeliveryCharge).toBe(5);
  });

  it('calculates correctly for pickup (no delivery charge)', () => {
    const charges = {
      tax: 6.5,
      convenienceCharge: 2.5,
      deliveryCharge: 0,
      originalTax: 6.5,
      originalConvenienceCharge: 2.5,
      originalDeliveryCharge: 5,
      isTaxWaived: false,
      isConvenienceWaived: false,
      isDeliveryWaived: true,
    };
    const result = calculateOrderTotal(50, charges, 5, 13);
    // 50 + 6.5 + 2.5 + 0 - 5 = 54
    expect(result.finalTotal).toBe(54);
    expect(result.isDeliveryWaived).toBe(true);
  });
});
