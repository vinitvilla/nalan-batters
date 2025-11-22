import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    address: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}))

describe('/api/public/addresses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST', () => {
    it('should create new address', async () => {
      const newAddress = {
        userId: 'user1',
        street: '123 St',
        unit: '1',
        city: 'City',
        province: 'Prov',
        country: 'Country',
        postal: '12345',
      }
      const createdAddress = { ...newAddress, id: 'addr1' }

      vi.mocked(prisma.address.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.address.create).mockResolvedValue(createdAddress as any)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const req = new Request('http://localhost/api/public/addresses', {
        method: 'POST',
        body: JSON.stringify(newAddress),
      })
      const res = await POST(req as any)
      const data = await res.json()

      expect(res.status).toBe(200) // NextResponse.json defaults to 200
      expect(data.address).toEqual(createdAddress)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { defaultAddressId: 'addr1' },
      })
    })

    it('should restore deleted address', async () => {
      const existingDeleted = { id: 'addr1', isDeleted: true }
      const restoredAddress = { id: 'addr1', isDeleted: false }

      vi.mocked(prisma.address.findFirst).mockResolvedValue(existingDeleted as any)
      vi.mocked(prisma.address.update).mockResolvedValue(restoredAddress as any)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const req = new Request('http://localhost/api/public/addresses', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user1',
          street: '123 St',
          city: 'City',
          province: 'Prov',
          country: 'Country',
          postal: '12345',
        }),
      })
      const res = await POST(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.restored).toBe(true)
      expect(prisma.address.update).toHaveBeenCalledWith({
        where: { id: 'addr1' },
        data: { isDeleted: false, unit: undefined },
      })
    })
  })
})
