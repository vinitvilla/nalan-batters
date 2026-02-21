/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from './route'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/requireAdmin'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    config: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/requireAdmin', () => ({
  requireAdmin: vi.fn(),
}))

describe('/api/admin/config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return configs if admin', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const mockConfigs = [{ id: '1', title: 'Config 1' }]
      vi.mocked(prisma.config.findMany).mockResolvedValue(mockConfigs as any)

      const req = new Request('http://localhost/api/admin/config')
      const res = await GET(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual(mockConfigs)
    })
  })

  describe('PUT', () => {
    it('should update config', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const updateData = { id: '1', value: 'New Value' }
      vi.mocked(prisma.config.update).mockResolvedValue(updateData as any)

      const req = new Request('http://localhost/api/admin/config', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      const res = await PUT(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual(updateData)
    })
  })

  describe('DELETE', () => {
    it('should soft delete config', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      vi.mocked(prisma.config.update).mockResolvedValue({} as any)

      const req = new Request('http://localhost/api/admin/config', {
        method: 'DELETE',
        body: JSON.stringify({ id: '1' }),
      })
      const res = await DELETE(req as any)
      expect(res.status).toBe(200)
    })
  })
})
