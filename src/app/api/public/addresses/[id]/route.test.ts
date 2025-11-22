import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE } from './route'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    address: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
  },
}))

describe('/api/public/addresses/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('DELETE', () => {
    it('should soft delete address', async () => {
      const mockAddress = { id: 'addr1' }
      vi.mocked(prisma.address.findUnique).mockResolvedValue(mockAddress as any)
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null) // Not default for any user
      vi.mocked(prisma.address.update).mockResolvedValue({} as any)

      const req = new Request('http://localhost/api/public/addresses/addr1')
      const params = Promise.resolve({ id: 'addr1' })
      const res = await DELETE(req as any, { params })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(prisma.address.update).toHaveBeenCalledWith({
        where: { id: 'addr1' },
        data: { isDeleted: true },
      })
    })

    it('should return 400 if address is default', async () => {
      const mockAddress = { id: 'addr1' }
      vi.mocked(prisma.address.findUnique).mockResolvedValue(mockAddress as any)
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user1' } as any) // Is default

      const req = new Request('http://localhost/api/public/addresses/addr1')
      const params = Promise.resolve({ id: 'addr1' })
      const res = await DELETE(req as any, { params })
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.error).toContain('Cannot delete default address')
    })

    it('should return 404 if address not found', async () => {
      vi.mocked(prisma.address.findUnique).mockResolvedValue(null)

      const req = new Request('http://localhost/api/public/addresses/addr1')
      const params = Promise.resolve({ id: 'addr1' })
      const res = await DELETE(req as any, { params })
      expect(res.status).toBe(404)
    })
  })
})
