import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateAndApplyPromoCode, validatePromoById, incrementPromoUsage } from './promoCode.service';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    promoCode: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

const mockPromo = {
  id: 'promo-uuid-1',
  code: 'SAVE15',
  discount: 15,
  discountType: 'PERCENTAGE' as const,
  isActive: true,
  isDeleted: false,
  expiresAt: new Date(2027, 11, 31), // future date
  minOrderAmount: 20,
  maxDiscount: 50,
  usageLimit: 100,
  currentUsage: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  description: 'Save 15%',
};

describe('validateAndApplyPromoCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns valid result for a valid promo code', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue(mockPromo);

    const result = await validateAndApplyPromoCode('SAVE15', 50);
    expect(result.valid).toBe(true);
    expect(result.promo?.code).toBe('SAVE15');
    expect(result.promo?.discount).toBe(15);
    expect(result.promo?.discountType).toBe('PERCENTAGE');
  });

  it('converts code to uppercase for lookup', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue(mockPromo);

    await validateAndApplyPromoCode('save15', 50);
    expect(prisma.promoCode.findUnique).toHaveBeenCalledWith({
      where: { code: 'SAVE15', isDeleted: false },
    });
  });

  it('returns error for non-existent promo code', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue(null);

    const result = await validateAndApplyPromoCode('INVALID', 50);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid promo code');
  });

  it('returns error for inactive promo code', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
      ...mockPromo,
      isActive: false,
    });

    const result = await validateAndApplyPromoCode('SAVE15', 50);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Promo code is no longer active');
  });

  it('returns error for expired promo code', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
      ...mockPromo,
      expiresAt: new Date(2020, 0, 1), // past date
    });

    const result = await validateAndApplyPromoCode('SAVE15', 50);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Promo code has expired');
  });

  it('returns error when order is below minimum amount', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue(mockPromo);

    const result = await validateAndApplyPromoCode('SAVE15', 10); // below $20 min
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Minimum order');
  });

  it('returns error when usage limit is reached', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
      ...mockPromo,
      usageLimit: 5,
      currentUsage: 5, // at limit
    });

    const result = await validateAndApplyPromoCode('SAVE15', 50);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Promo code usage limit reached');
  });

  it('allows promo with no expiry date', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
      ...mockPromo,
      expiresAt: null,
    });

    const result = await validateAndApplyPromoCode('SAVE15', 50);
    expect(result.valid).toBe(true);
  });

  it('allows promo with no usage limit', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
      ...mockPromo,
      usageLimit: null,
    });

    const result = await validateAndApplyPromoCode('SAVE15', 50);
    expect(result.valid).toBe(true);
  });

  it('allows promo with no minimum order amount', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
      ...mockPromo,
      minOrderAmount: null,
    });

    const result = await validateAndApplyPromoCode('SAVE15', 5);
    expect(result.valid).toBe(true);
  });
});

describe('validatePromoById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates promo by UUID', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue(mockPromo);

    const result = await validatePromoById('promo-uuid-1', 50);
    expect(result.valid).toBe(true);
    expect(prisma.promoCode.findUnique).toHaveBeenCalledWith({
      where: { id: 'promo-uuid-1', isDeleted: false },
    });
  });

  it('returns error for non-existent promo ID', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue(null);

    const result = await validatePromoById('nonexistent-id', 50);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid promo code');
  });

  it('checks all validation rules same as validateAndApplyPromoCode', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
      ...mockPromo,
      isActive: false,
    });

    const result = await validatePromoById('promo-uuid-1', 50);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Promo code is no longer active');
  });

  it('returns decimal values as numbers', async () => {
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue(mockPromo);

    const result = await validatePromoById('promo-uuid-1', 50);
    expect(typeof result.promo?.discount).toBe('number');
    expect(result.promo?.maxDiscount).toBe(50);
  });
});

describe('incrementPromoUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('increments usage count by 1', async () => {
    vi.mocked(prisma.promoCode.update).mockResolvedValue(mockPromo);

    await incrementPromoUsage('promo-uuid-1');
    expect(prisma.promoCode.update).toHaveBeenCalledWith({
      where: { id: 'promo-uuid-1' },
      data: { currentUsage: { increment: 1 } },
    });
  });
});
