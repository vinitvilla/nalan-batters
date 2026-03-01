import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    config: { findMany: vi.fn(), findFirst: vi.fn() },
  },
}));

import { parseChargeConfig, parseFreeDeliveryConfig, getConfigField } from './config.service';
import type { Config } from '@/generated/prisma';

// Helper to create a mock Config object
function mockConfig(title: string, value: Record<string, unknown>): Config {
  return {
    id: 'config-' + title,
    title,
    value: value as Config['value'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDelete: false,
  };
}

describe('parseChargeConfig', () => {
  it('parses a complete additionalCharges config', () => {
    const configs = [
      mockConfig('additionalCharges', {
        taxPercent: { percent: 13, waive: false },
        convenienceCharge: { amount: 2.99, waive: false },
        deliveryCharge: { amount: 4.99, waive: false },
      }),
    ];

    const result = parseChargeConfig(configs);
    expect(result.taxPercent).toEqual({ percent: 13, waive: false });
    expect(result.convenienceCharge).toEqual({ amount: 2.99, waive: false });
    expect(result.deliveryCharge).toEqual({ amount: 4.99, waive: false });
  });

  it('uses defaults when additionalCharges config is missing', () => {
    const result = parseChargeConfig([]);
    expect(result.taxPercent.percent).toBe(13);
    expect(result.taxPercent.waive).toBe(false);
    expect(result.convenienceCharge.amount).toBe(0);
    expect(result.deliveryCharge.amount).toBe(0);
  });

  it('handles partial config (only tax set)', () => {
    const configs = [
      mockConfig('additionalCharges', {
        taxPercent: { percent: 5, waive: true },
      }),
    ];

    const result = parseChargeConfig(configs);
    expect(result.taxPercent).toEqual({ percent: 5, waive: true });
    expect(result.convenienceCharge.amount).toBe(0);
    expect(result.deliveryCharge.amount).toBe(0);
  });

  it('handles waived charges', () => {
    const configs = [
      mockConfig('additionalCharges', {
        taxPercent: { percent: 13, waive: true },
        convenienceCharge: { amount: 2.50, waive: true },
        deliveryCharge: { amount: 5, waive: true },
      }),
    ];

    const result = parseChargeConfig(configs);
    expect(result.taxPercent.waive).toBe(true);
    expect(result.convenienceCharge.waive).toBe(true);
    expect(result.deliveryCharge.waive).toBe(true);
  });

  it('ignores unrelated config entries', () => {
    const configs = [
      mockConfig('someOtherConfig', { foo: 'bar' }),
      mockConfig('additionalCharges', {
        taxPercent: { percent: 10, waive: false },
        convenienceCharge: { amount: 1, waive: false },
        deliveryCharge: { amount: 3, waive: false },
      }),
    ];

    const result = parseChargeConfig(configs);
    expect(result.taxPercent.percent).toBe(10);
  });
});

describe('parseFreeDeliveryConfig', () => {
  it('parses free delivery config correctly', () => {
    const configs = [
      mockConfig('freeDelivery', {
        Monday: ['Scarborough'],
        Wednesday: ['Toronto'],
      }),
    ];

    const result = parseFreeDeliveryConfig(configs);
    expect(result).toEqual({
      Monday: ['Scarborough'],
      Wednesday: ['Toronto'],
    });
  });

  it('returns empty object when config is missing', () => {
    const result = parseFreeDeliveryConfig([]);
    expect(result).toEqual({});
  });
});

describe('getConfigField', () => {
  it('returns the config value when found', () => {
    const configs = [
      mockConfig('siteName', { name: 'Nalan Batters' }),
    ];

    const result = getConfigField(configs, 'siteName', { name: 'Default' });
    expect(result).toEqual({ name: 'Nalan Batters' });
  });

  it('returns default value when config is not found', () => {
    const result = getConfigField([], 'siteName', { name: 'Default' });
    expect(result).toEqual({ name: 'Default' });
  });
});
