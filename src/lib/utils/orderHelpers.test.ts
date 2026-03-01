/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrdersPaginated } from './orderHelpers'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/services/config/config.service', () => ({
  getAllConfigs: vi.fn(() => Promise.resolve([])),
  parseChargeConfig: vi.fn(() => ({
    deliveryCharge: { amount: 50 },
    convenienceCharge: { percent: 5 },
    taxPercent: { percent: 5, waive: false },
  })),
  parseFreeDeliveryConfig: vi.fn(() => ({})),
}))

describe('getOrdersPaginated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter by deliveryType when provided', async () => {
    const mockOrders = [
      { id: '1', deliveryType: 'DELIVERY', user: {}, address: {}, items: [], promoCode: null },
    ]

    vi.mocked(prisma.order.count).mockResolvedValue(1)
    vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any)

    await getOrdersPaginated({ page: 1, limit: 25, deliveryType: 'delivery' })

    expect(prisma.order.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deliveryType: 'DELIVERY',
        }),
      })
    )

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deliveryType: 'DELIVERY',
        }),
      })
    )
  })

  it('should filter by PICKUP delivery type', async () => {
    const mockOrders = [
      { id: '2', deliveryType: 'PICKUP', user: {}, address: {}, items: [], promoCode: null },
    ]

    vi.mocked(prisma.order.count).mockResolvedValue(1)
    vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any)

    await getOrdersPaginated({ page: 1, limit: 25, deliveryType: 'pickup' })

    expect(prisma.order.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deliveryType: 'PICKUP',
        }),
      })
    )
  })

  it('should not filter by deliveryType when value is "all"', async () => {
    vi.mocked(prisma.order.count).mockResolvedValue(0)
    vi.mocked(prisma.order.findMany).mockResolvedValue([])

    await getOrdersPaginated({ page: 1, limit: 25, deliveryType: 'all' })

    expect(prisma.order.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isDelete: false,
        },
      })
    )
  })

  it('should not filter by deliveryType when not provided', async () => {
    vi.mocked(prisma.order.count).mockResolvedValue(0)
    vi.mocked(prisma.order.findMany).mockResolvedValue([])

    await getOrdersPaginated({ page: 1, limit: 25 })

    expect(prisma.order.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isDelete: false,
        },
      })
    )
  })

  it('should combine deliveryType filter with status filter', async () => {
    vi.mocked(prisma.order.count).mockResolvedValue(0)
    vi.mocked(prisma.order.findMany).mockResolvedValue([])

    await getOrdersPaginated({
      page: 1,
      limit: 25,
      deliveryType: 'delivery',
      status: 'pending',
    })

    expect(prisma.order.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deliveryType: 'DELIVERY',
          status: 'PENDING',
          isDelete: false,
        }),
      })
    )
  })

  it('should combine deliveryType filter with payment method filter', async () => {
    vi.mocked(prisma.order.count).mockResolvedValue(0)
    vi.mocked(prisma.order.findMany).mockResolvedValue([])

    await getOrdersPaginated({
      page: 1,
      limit: 25,
      deliveryType: 'delivery',
      paymentMethod: 'online',
    })

    expect(prisma.order.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deliveryType: 'DELIVERY',
          paymentMethod: 'ONLINE',
          isDelete: false,
        }),
      })
    )
  })

  it('should handle sorting by deliveryType', async () => {
    vi.mocked(prisma.order.count).mockResolvedValue(0)
    vi.mocked(prisma.order.findMany).mockResolvedValue([])

    await getOrdersPaginated({
      page: 1,
      limit: 25,
      sortBy: 'orderType',
      sortOrder: 'asc',
    })

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { deliveryType: 'asc' },
      })
    )
  })

  it('should handle sorting by deliveryType descending', async () => {
    vi.mocked(prisma.order.count).mockResolvedValue(0)
    vi.mocked(prisma.order.findMany).mockResolvedValue([])

    await getOrdersPaginated({
      page: 1,
      limit: 25,
      sortBy: 'orderType',
      sortOrder: 'desc',
    })

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { deliveryType: 'desc' },
      })
    )
  })

  it('should case-insensitively convert deliveryType to uppercase', async () => {
    vi.mocked(prisma.order.count).mockResolvedValue(0)
    vi.mocked(prisma.order.findMany).mockResolvedValue([])

    await getOrdersPaginated({
      page: 1,
      limit: 25,
      deliveryType: 'DeliVeRy',
    })

    expect(prisma.order.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deliveryType: 'DELIVERY',
        }),
      })
    )
  })

  it('should return correct pagination info', async () => {
    const mockOrders = [
      { id: '1', deliveryType: 'DELIVERY', user: {}, address: {}, items: [], promoCode: null },
      { id: '2', deliveryType: 'DELIVERY', user: {}, address: {}, items: [], promoCode: null },
    ]

    vi.mocked(prisma.order.count).mockResolvedValue(100)
    vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any)

    const result = await getOrdersPaginated({ page: 2, limit: 25, deliveryType: 'delivery' })

    expect(result.pagination).toEqual({
      page: 2,
      limit: 25,
      totalCount: 100,
      totalPages: 4,
      hasNext: true,
      hasPrev: true,
    })
  })
})
